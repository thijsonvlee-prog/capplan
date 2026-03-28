# Performance Observability

## Doel
Dit document beschrijft hoe performance logging en observability in CapPlan is ingericht, zodat performanceproblemen meetbaar en analyseerbaar zijn. Toekomstige performance-runs moeten dit bestand eerst lezen voordat ze wijzigingen doorvoeren.

## Wat wordt gemeten

- **API route response times**: duur van alle geïnstrumenteerde API-routes (van request tot response)
- **HTTP status codes**: success (2xx) vs errors (4xx/5xx)
- **Slow events**: requests die langer duren dan 500ms worden expliciet als "slow" gemarkeerd
- **Error events**: requests die falen worden met "error" status gelogd, inclusief error message
- **Request metadata**: HTTP method, URL path, response status code

### Geïnstrumenteerde routes
| Route | Method | Reden |
|---|---|---|
| `/api/planning/for-range` | GET | Meest kritieke query: laadt het volledige planningsraster (drivers + entries) |
| `/api/planning/bulk` | POST | Zware write-path: bulk create/update van planning entries |
| `/api/planning/capacity` | GET | Aggregatiequery via groupBy |
| `/api/planning` | GET, POST | Basis planning CRUD |
| `/api/drivers` | GET, POST | Driver listing en aanmaken (inclusief relaties) |
| `/api/drivers/[id]/roster-assignments` | GET, POST | POST genereert 364 planning entries — zwaarste batch operatie |
| `/api/scenarios/[id]/duplicate` | POST | Kopieert alle planning entries van een scenario |

## Wat bewust niet wordt gemeten

- **Volledige request/response bodies**: te groot, privacyrisico
- **Ruwe SQL queries**: geen directe SQL logging (Prisma abstraheert dit)
- **Frontend rendering times**: niet geïmplementeerd in deze eerste versie (vervolgstap)
- **Settings/stamtabel CRUD**: lage frequentie, lage impact
- **Individuele driver detail routes** (`/api/drivers/[id]`): lagere prioriteit
- **User preferences**: geen performance-relevante operaties
- **Persoonsgegevens**: geen namen, emails of andere PII in metadata

## Datamodel

### PerformanceEvent (ruwe events)
- **Doel**: opslaan van individuele performance metingen per API-call
- **Belangrijkste velden**:
  - `timestamp` (DateTime): wanneer het event plaatsvond
  - `environment` (String): "production", "development", etc.
  - `source` (String): herkomst — "api", "frontend", "db", "system"
  - `eventType` (String): type — "request", "query", "action", "error"
  - `name` (String): identificatie, bijv. "GET /api/planning/for-range"
  - `durationMs` (Int): duur in milliseconden
  - `status` (String): "success", "error", "slow"
  - `requestId` (String): unieke ID per request (voor correlatie)
  - `metadata` (JSONB): aanvullende context (httpStatus, method, url, errorMessage)
- **Indexes**: timestamp, (source+name+timestamp), (eventType+timestamp), (status+timestamp)

### PerformanceSummary (dagelijkse aggregaties)
- **Doel**: opslaan van dagelijkse samenvattingen per route/actie voor trendanalyse
- **Belangrijkste velden**:
  - `date` (String): YYYY-MM-DD
  - `source`, `name`: groepering
  - `count`: aantal events
  - `avgMs`, `p95Ms`, `maxMs`, `minMs`: duurstatistieken
  - `errorCount`, `slowCount`: fout- en traagheidsaantallen
  - `metadata` (JSONB): extra context
- **Unique constraint**: (date, source, name) — één samenvatting per dag per route
- **Wanneer gebruiken**: wordt gevuld door `generateDailySummary()`, bedoeld voor nachtelijke analyse-runs

## Loggingstrategie

### Events die altijd worden gelogd
- Alle requests naar geïnstrumenteerde API-routes (ongeacht duur)
- Alle errors (status "error")
- Alle slow events (durationMs > 500ms)

### Sampling en filtering
- `CONFIG.sampleRate` (default 1.0): bij hoog volume kan dit worden verlaagd om normale events te samplen
- Slow events en errors worden altijd gelogd, ongeacht sampling rate
- Logging kan volledig worden uitgeschakeld via `PERF_LOGGING_ENABLED=false`

### Privacy en volume
- Geen PII in metadata
- Geen request/response bodies
- Metadata is compact: alleen httpStatus, method, URL path
- Fire-and-forget: logging blokkeert de response niet
- Retentiebeleid: `cleanupOldEvents()` verwijdert events ouder dan 30 dagen (default)

### Fouttolerantie
- Alle logging-writes zijn fire-and-forget met `.catch(() => {})`
- Als de logging-write faalt, wordt het event stil genegeerd
- De applicatie zal nooit crashen door een loggingfout

## Instrumentatiepunten

### Server-side (API routes)
Wrapper: `withPerfLogging(name, handler)` in `src/lib/perf.ts`
- Wrapt de handler, meet start/stop met `performance.now()`
- Genereert een uniek `requestId` per request
- Logt automatisch duur, status, en basis-metadata

### Handmatige timing
Helper: `measureAsync(name, source, eventType, fn, metadata?)` in `src/lib/perf.ts`
- Kan gebruikt worden om specifieke operaties binnen een route te meten
- Bijv. losse database queries of service calls

### Direct event logging
Helper: `logPerfEvent(event)` in `src/lib/perf.ts`
- Voor custom events die niet in een wrapper passen

## Analyse voor volgende runs

### Beschikbare functies in `src/lib/perf.ts`

1. **`getSlowEvents({ since?, limit?, source?, minDurationMs? })`**
   - Haalt de traagste events op uit een tijdperiode
   - Handig voor: "wat zijn de traagste API-calls van de laatste 24 uur?"

2. **`getRouteStats({ since?, source? })`**
   - Berekent per route: count, avg, p95, max, min, errors, slow
   - Handig voor: "welke routes zijn structureel traag?"

3. **`generateDailySummary(date?)`**
   - Genereert en slaat dagelijkse samenvattingen op in PerformanceSummary
   - Handig voor: nachtelijke cron-job of handmatige analyse

4. **`compareDays(date1, date2)`**
   - Vergelijkt twee dagen op basis van PerformanceSummary
   - Handig voor: "is performance vandaag beter of slechter dan gisteren?"

5. **`getErrorEvents({ since?, limit?, name? })`**
   - Haalt error events op met performance context
   - Handig voor: "welke fouten kosten het meeste tijd?"

6. **`cleanupOldEvents(retentionDays?)`**
   - Verwijdert oude ruwe events (default: 30 dagen)
   - Summaries worden bewaard voor langetermijntrends

### Voorbeeld analyse queries (voor nacht-runs)

```typescript
import { getSlowEvents, getRouteStats, generateDailySummary, compareDays } from "@/lib/perf";

// Top 20 traagste events van de laatste 24 uur
const slow = await getSlowEvents({ limit: 20 });

// Statistieken per route
const stats = await getRouteStats({});

// Dagelijkse samenvatting genereren en opslaan
await generateDailySummary("2026-03-28");

// Vergelijk vandaag met gisteren
const comparison = await compareDays("2026-03-28", "2026-03-27");

// Alleen API errors
const errors = await getErrorEvents({ limit: 10 });
```

### Directe SQL queries (voor ad-hoc analyse)

```sql
-- Top 10 traagste routes (afgelopen 24 uur)
SELECT name, "durationMs", status, metadata, timestamp
FROM "PerformanceEvent"
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY "durationMs" DESC
LIMIT 10;

-- Gemiddelde duur per route
SELECT name, COUNT(*) as cnt,
  AVG("durationMs") as avg_ms,
  MAX("durationMs") as max_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "durationMs") as p95_ms
FROM "PerformanceEvent"
WHERE timestamp > NOW() - INTERVAL '24 hours'
  AND "durationMs" IS NOT NULL
GROUP BY name
ORDER BY p95_ms DESC;

-- Error ratio per route
SELECT name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  ROUND(COUNT(*) FILTER (WHERE status = 'error')::numeric / COUNT(*)::numeric * 100, 1) as error_pct
FROM "PerformanceEvent"
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY name
ORDER BY error_pct DESC;

-- Dagelijkse trend voor een specifieke route
SELECT date, "avgMs", "p95Ms", "maxMs", count, "errorCount"
FROM "PerformanceSummary"
WHERE name = 'GET /api/planning/for-range'
ORDER BY date DESC
LIMIT 14;
```

## Aandachtspunten

- **Serverless cold starts**: de eerste request na een cold start zal langer duren door Prisma client initialization. Dit is zichtbaar in de data maar is een Vercel/serverless eigenschap, niet een app-probleem.
- **Logging overhead**: elke geïnstrumenteerde request maakt één extra database write (fire-and-forget). Op Neon Postgres is dit ~1-5ms extra serverside, maar het blokkeert de response niet.
- **Volume bij hoog gebruik**: bij zeer hoog volume kan `CONFIG.sampleRate` worden verlaagd. Bij normaal gebruik (planning tool) is 100% sampling haalbaar.
- **Frontend niet gemeten**: client-side rendering, hydration en interactietijden worden nog niet gemeten. Dit is een logische vervolgstap.
- **Geen distributed tracing**: er is geen trace propagation tussen frontend en backend. Het `requestId` is server-side only.

## Wijzigingslog

### 2026-03-28
**Toegevoegd**
- PerformanceEvent tabel in Postgres (ruwe events)
- PerformanceSummary tabel (dagelijkse aggregaties)
- Centrale logging library (`src/lib/perf.ts`) met:
  - `logPerfEvent()`: fire-and-forget event logging
  - `withPerfLogging()`: API route wrapper
  - `measureAsync()`: timing helper voor specifieke operaties
  - `getSlowEvents()`, `getRouteStats()`, `getErrorEvents()`: analyse helpers
  - `generateDailySummary()`: dagelijkse aggregatie
  - `compareDays()`: regressiedetectie
  - `cleanupOldEvents()`: retentiebeleid
- Instrumentatie van 7 API routes (de meest kritieke)
- Prisma migration voor performance tabellen

**Belangrijke ontwerpkeuzes**
- Fire-and-forget logging: nooit blokkeren, nooit crashen
- Gestructureerde data in Postgres (geen tekstlogs): querybaar en analyseerbaar
- JSONB metadata voor flexibiliteit zonder schema-wijzigingen
- Slow threshold op 500ms: past bij serverless response-verwachtingen
- Geen frontend instrumentatie in eerste versie: risico/complexiteit niet evenredig met waarde voor eerste iteratie
- 100% sampling als default: bij deze app-schaal is volume beheersbaar

**Beperkingen**
- Alleen server-side API routes zijn gemeten
- Geen individuele database query timing (alleen totale request duur)
- Geen frontend performance metingen
- Geen trace propagation tussen client en server
- Summary generatie moet handmatig of via cron worden getriggerd
- Retentie-cleanup moet handmatig of via cron worden gedraaid

**Aanbevolen vervolgstappen**
1. Voeg frontend timing toe (bijv. via Performance API / web-vitals)
2. Voeg `measureAsync()` toe binnen zware routes om individuele DB queries te timen
3. Configureer een dagelijkse cron/nacht-run die `generateDailySummary()` en `cleanupOldEvents()` draait
4. Bouw een simpel dashboard of API endpoint om performance data te bekijken
5. Voeg instrumentatie toe aan meer routes als er schaalvragen opkomen
6. Overweeg sampling te verlagen als logvolume boven ~10.000 events/dag komt
