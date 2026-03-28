# Performance Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende performance-audits op deze applicatie. Elke volgende audit moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen niet verloren gaan.

## Terugkerende architectuurinzichten
- De app is een driver workforce planning tool met ~25 API routes, allemaal serverless op Vercel
- PlanningEntry is de meest query-intensieve tabel: elke cel in het planningsraster is een row
- Bij 100 chauffeurs x 56 dagen = 5600+ entries per view — queries moeten geoptimaliseerd zijn
- Roster assignment generatie maakt tot 364 planning entries per keer — moet batch zijn
- Neon Postgres + serverless = elke query kost een round-trip; batching is kritisch
- Prisma's `groupBy` is effectiever dan `findMany` + in-memory aggregatie voor tellingen
- De planning grid rendert potentieel duizenden DayCell componenten — memoization is essentieel

## Bekende bottlenecks
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| Roster assignment POST | Was 728 queries per request (364-day loop met 2 queries per dag) | Kritiek: timeout op serverless | Opgelost | Vervangen door 1 findMany + batch createMany/updateMany |
| Planning bulk POST | Was N+1 per datum (findFirst + update/create per date) | Hoog: vertraagde drag-select | Opgelost | Vervangen door 1 findMany + batch updateMany/createMany |
| Planning for-range GET | Laadde alle driver relaties (skills, employment, functions, roster) | Hoog: onnodige payload | Opgelost | Nu met select op alleen benodigde velden |
| Planning capacity GET | Haalde alle entries op en telde in-memory | Middel: onnodige data transfer | Opgelost | Vervangen door Prisma groupBy |
| Auto-close patronen | Promise.all met individuele updates in employment/functions/roster POST | Middel: N queries i.p.v. 1 | Opgelost | Vervangen door updateMany |
| DayCell component | Geen React.memo — alle cellen re-renderen bij elke drag | Hoog: janky drag UX | Opgelost | Wrapped in React.memo |
| CapacityChart | Geen memo, chartData herberekend elk render | Middel: chart flashing | Opgelost | Wrapped in React.memo + useMemo |
| PlanningEntry indexes | Ontbrekend composite index (driverId, date, scenarioId) | Hoog: trage lookups | Opgelost | Migration toegevoegd |
| PlanningGrid monoliet | 709 regels, geen virtualisatie, inline helpers | Hoog bij >50 drivers | Open | Toekomstige refactor |
| Geen pagination op GET endpoints | Drivers, settings, etc. laden alles | Middel bij groei | Open | Pas toevoegen bij schaalproblemen |
| StatusSelector per cel | Modal wordt per DayCell geinstantieerd | Laag-middel | Open | Consolideren naar single portal |

## Bewezen effectieve optimalisaties
- Batch createMany/updateMany in plaats van loops met individuele queries: ~728x reductie in roster assignment
- Prisma groupBy voor aggregaties in plaats van findMany + in-memory counting
- React.memo op veelgerenderde componenten (DayCell) met stabiele props
- Composite database indexes op veelgebruikte filter-combinaties (driverId+date+scenarioId)
- Select op relatie-includes om payload te reduceren (for-range endpoint)
- updateMany voor bulk auto-close operaties in plaats van Promise.all met individuele updates

## Dingen die weinig opleverden of juist risico gaven
- (Eerste run — nog geen negatieve ervaringen)
- Overweging: virtualisatie voor PlanningGrid is niet doorgevoerd vanwege complexiteit met sticky kolommen en drag-functionaliteit. Pas doen als >50 drivers problematisch wordt.
- Overweging: unique constraint op (driverId, date, scenarioId) niet toegevoegd vanwege risico op conflicten met bestaande data. Kan later als data-integriteit is gevalideerd.

## Performance Observability Infrastructuur

Sinds 2026-03-28 is er een gestructureerde performance logging infrastructuur beschikbaar. Zie `PERFORMANCE_OBSERVABILITY.md` voor volledige documentatie.

**Kern**: alle kritieke API-routes worden automatisch gemeten (duur, status, metadata) en opgeslagen in de `PerformanceEvent` tabel. Dagelijkse samenvattingen kunnen worden gegenereerd in `PerformanceSummary`.

**Voor volgende performance-runs**:
- Gebruik `getSlowEvents()` en `getRouteStats()` uit `src/lib/perf.ts` om echte bottlenecks te vinden
- Gebruik `compareDays()` om regressies te detecteren
- Gebruik `generateDailySummary()` om trends over tijd te analyseren
- Focus optimalisatie op routes die in de data als traag naar voren komen, niet op code-inspectie alleen
- De data is querybaar via Prisma of directe SQL (zie PERFORMANCE_OBSERVABILITY.md voor voorbeeldqueries)

## Aandachtspunten voor volgende runs
- Monitor of de PlanningGrid bij >50 drivers nog responsive is; zo niet, implementeer row virtualisatie
- Check of de nieuwe composite indexes daadwerkelijk door Prisma's query planner worden gebruikt (EXPLAIN ANALYZE)
- Overweeg pagination voor /api/drivers GET als het aantal chauffeurs groeit voorbij ~200
- De scenario duplication POST (`/api/scenarios/[id]/duplicate`) mist een transaction — kan inconsistente state geven bij failure
- DriverForm (455 regels) maakt 4 API calls bij mount in edit mode — overweeg server-side aggregatie
- Recharts is ~250KB gzipped — als capacity page weinig bezocht wordt, overweeg dynamic import
- Planning route POST gebruikt nog findFirst+update/create i.p.v. een echte upsert — overweeg unique constraint + upsert
- RosterAssigner maakt 3 losse API calls — overweeg batching of server-side join

## Auditgeschiedenis

### 2026-03-28
**Samenvatting**
Eerste volledige performance audit. Focus op database query-efficiency (serverless round-trips), frontend rendering performance, en missing indexes.

**Geanalyseerd**
- Alle 25 API route bestanden op query patronen, N+1, missing indexes, over-fetching
- Alle 18 frontend componenten/pagina's op re-render patronen, memoization, state management
- Prisma schema op index strategie
- Next.js configuratie en bundle output
- Architecturele data flow patronen

**Doorgevoerd**
1. **Roster assignment POST**: Loop van 728 queries vervangen door batch operaties (1 findMany + createMany + updateMany per status). Impact: ~99% reductie in DB round-trips.
2. **Planning bulk POST**: N+1 loop vervangen door batch findMany + updateMany/createMany. Impact: van 2N queries naar 3 queries.
3. **Planning for-range GET**: Over-fetching van driver relaties beperkt met select. Impact: kleinere payloads, minder DB work.
4. **Planning capacity GET**: In-memory counting vervangen door Prisma groupBy. Impact: minder data transfer, DB doet het zware werk.
5. **Auto-close patronen**: Promise.all individuele updates vervangen door updateMany in employment, functions, en roster-assignments POST. Impact: van N queries naar 1 per auto-close.
6. **DayCell component**: Wrapped in React.memo. Impact: voorkomt re-render van honderden cellen bij drag/state changes.
7. **CapacityChart component**: Wrapped in React.memo + useMemo voor chartData. Impact: voorkomt onnodige Recharts re-mounts.
8. **Database indexes**: Composite index (driverId, date, scenarioId) en (scenarioId, date) toegevoegd; verouderde (driverId, date) index verwijderd. Impact: snellere lookups op de meest gebruikte query patronen.

**Niet doorgevoerd**
- PlanningGrid virtualisatie: te complex voor eerste run, sticky columns + drag compliceren het
- Pagination op list endpoints: niet urgent bij huidige data volumes
- Unique constraint op PlanningEntry: risico op bestaande duplicaten
- StatusSelector portal consolidatie: lage impact, hoog refactor-risico
- DriverForm opsplitsen: functioneel risico, geen directe performance crisis
- Recharts lazy loading: capacity page is al statisch gerendered

**Nieuwe learnings**
- Prisma's groupBy is effectief voor aggregaties maar let op: het genereert niet altijd optimale SQL voor Neon
- React.memo op DayCell is high-impact omdat de planning grid potentieel 2800+ cellen heeft
- Batch operaties op Neon Postgres zijn significant sneller dan individuele queries door serverless overhead per query
- TypeScript met Map iteration vereist downlevelIteration of target es2015+ — gebruik Record<> in batch code

**Aanbevolen vervolgstappen**
1. Implementeer row virtualisatie in PlanningGrid als >50 drivers in productie
2. Voeg transaction toe aan scenario duplication
3. Overweeg server-side aggregatie voor DriverForm edit mode (1 endpoint i.p.v. 4)
4. Valideer index-gebruik met EXPLAIN ANALYZE op productie
5. Monitor Vercel function duration logs voor de geoptimaliseerde endpoints
