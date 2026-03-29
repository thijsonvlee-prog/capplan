# Technical Debt Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende code quality en technical debt reviews op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen behouden blijven.

## Terugkerende structurele aandachtspunten
- API routes bevatten nog steeds `any` types (where clauses, context params, update data) die geleidelijk vervangen moeten worden
- PlanningGrid.tsx (nu ~650 regels na extractie aggregatielogica) blijft de grootste en meest complexe component
- `any` types in api.ts (464 regels) voor request bodies zijn nog niet aangepakt
- useApi.ts globale cache heeft geen eviction — potentieel geheugenlek bij langdurig gebruik
- Inconsistente `context?: any` typing in sommige API routes i.p.v. proper `{ params: Promise<...> }` destructuring

## Bekende technische schuld
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| PlanningGrid.tsx | ~650 regels, 12 useState hooks, meerdere verantwoordelijkheden | Hoog - lastig te onderhouden en uit te breiden | Open | Aggregatielogica geëxtraheerd (run 2), optimistic update geconsolideerd (run 2). Verdere opsplitsing mogelijk: drag logic → useDragSelection hook, GroupRows → apart bestand |
| DriverForm.tsx | 448 regels met 3 inline sub-form componenten | Middel - werkbaar maar niet ideaal | Open | Sub-forms naar eigen bestanden extraheren |
| Type safety API routes | `any` types in where clauses, context params, update data | Middel - runtime bugs mogelijk | Open | ~11 instances verspreid over route files |
| Type safety api.ts | 464 regels met veel `any` types voor request bodies | Middel | Open | Definieer request/response types per endpoint |
| Type safety api-helpers.ts | getComputedFields accepteert `driver: any` | Laag | Open | Vervang door DriverWithEntries type |
| Settings routes `(prisma as any)` | Dynamische model lookup omzeilt type safety | Laag - werkt maar fragiel | Open | Overweeg aparte endpoints per type i.p.v. generiek |
| Transactieveiligheid | Roster assignment + planning generatie niet in transactie | Middel - race condition risico | Open | Wrap in prisma.$transaction |
| roster-assignments/route.ts | 159 regels, maakt roster assignment + genereert 364 dagen planning | Middel - te veel verantwoordelijkheden | Open | Split planning generatie naar apart endpoint of service |
| DocumentatiePage.tsx | 295 regels hardcoded documentatiestring | Laag | Open | Overweeg markdown bestand i.p.v. inline string |
| useApi.ts globale state | Globale cache Map en listeners Set - potentieel geheugenlek | Middel | Open | Cache keys zijn afhankelijk van function identity — inline arrow functions in useApiData() creëren steeds nieuwe keys. Overweeg LRU cache of time-based eviction |
| API response inconsistentie | Mix van `{ success: true }`, objecten en arrays als response | Laag | Open | Standaardiseer response format |
| Input validatie API routes | 7+ routes missen validatie op verplichte velden of formaat | Middel | Open | Voeg validatie helper toe aan api-route-utils.ts |

## Bewezen effectieve verbeteringen
- Extractie van gedeelde API route utilities (transformDriver, resolveScenarioId, transformProfile, driverInclude, getSettingsModel, autoCloseOpenRecords, getNextSequenceNumber) naar `src/lib/api-route-utils.ts` — elimineert ~150 regels duplicatie over 14 bestanden
- Verwijdering van dode localStorage repositories en services (~1200 regels) na volledige migratie naar Prisma
- Consolidatie van 3 identieke getActiveEmployment/getActiveFunction/getActiveRoster naar generieke getActiveRecord<T>
- Repository interfaces verwijderd (niet meer gebruikt na migratie)
- Extractie van `transformPlanningEntry` naar api-route-utils.ts — elimineert 3x dezelfde entry-transformatie in planning routes
- Extractie van aggregatielogica (dag/week/4weken/maand/kwartaal/jaar) naar `src/lib/aggregation.ts` — elimineert ~160 regels identieke code tussen PlanningGrid en CapacityPage
- Centralisering van MONTH_SHORT, DEFAULT_PERIOD_DAYS en UNKNOWN_LABEL in constants.ts — elimineert 5 losse definities
- Extractie van getMondayStart() naar utils.ts — elimineert gedupliceerde "snap to Monday" berekening
- Consolidatie van optimistic update logica in PlanningGrid via applyOptimisticEntries() — elimineert code-drift risico tussen single en bulk updates

## Dingen die weinig opleverden of juist extra risico gaven
- (Nog geen mislukte pogingen)

## Cross-domain aandachtspunten
- PlanningGrid.tsx refactoring is randvoorwaardelijk voor performance-virtualisatie (zie PERFORMANCE_LEARNINGS.md). Coördineer opsplitsing met performance-runs.
- Type safety verbeteringen mogen de bestaande API-route conventie uit CLAUDE.md niet doorbreken (alle data access via API routes met Prisma).
- De `any` types in api-route-utils.ts zijn bewust gekozen omdat de Prisma types niet direct exporteerbaar zijn vanuit het generated pad.

## Aandachtspunten voor volgende runs
- PlanningGrid.tsx is nog steeds de grootste kandidaat voor opsplitsing: drag-logica → useDragSelection hook, GroupRows → apart bestand, viewConfig state consolidatie
- De `saving` prop in DriverForm wordt niet doorgegeven vanuit DriverList — feature die nog aangesloten moet worden
- baseRosterHours in DayCell is een prop die wel gedefinieerd maar nooit doorgegeven wordt vanuit PlanningGrid
- useApi.ts cache-eviction is een groeiend risico naarmate de app meer pagina's en modals krijgt
- Bij verbeteren type safety: begin met api-helpers.ts (vervang `driver: any` door `DriverWithEntries`)
- `context?: any` pattern in roster-assignments en scenarios/duplicate routes moet vervangen worden door proper typed params destructuring
- CapacityChart en CapacityTable definiëren beide lokaal `available = BASE_ROSTER + AVAILABLE_EXTRA` — kandidaat voor extractie bij volgende run

## Auditgeschiedenis

### [2026-03-28]
**Samenvatting**
Eerste volledige code quality en technical debt audit. Focus op duplicatiereductie, dode code verwijdering, en structurele consolidatie.

**Geanalyseerd**
- Alle 25 API route files (src/app/api/)
- Alle 18 frontend componenten (src/components/)
- Alle 5 pagina's (src/app/(dashboard)/)
- Alle lib/utility bestanden (api.ts, api-helpers.ts, utils.ts, prisma.ts)
- Domain types, enums, constants
- Services en repositories (als dode code geidentificeerd)
- Prisma schema

**Doorgevoerd**
- Nieuw bestand: `src/lib/api-route-utils.ts` met gedeelde API route utilities
  - transformDriver, transformProfile, resolveScenarioId, driverInclude, getSettingsModel, autoCloseOpenRecords, getNextSequenceNumber
- 14 API route bestanden geupdate om gedeelde utilities te importeren
- ~1200 regels dode code verwijderd (localStorage repos, interfaces, services)
- getActiveRecord<T> generieke consolidatie

**Niet doorgevoerd**
- Opsplitsing PlanningGrid.tsx: te groot risico, complexe state-interacties
- Extractie DriverForm sub-components: nuttig maar niet urgent
- Aggregatielogica consolidatie: vereist zorgvuldige afstemming
- Type safety verbetering api.ts: grote impact, vereist geleidelijke aanpak
- Transactie-wrapping in roster-assignments: vereist testomgeving

**Nieuwe learnings**
- De localStorage → Prisma migratie is 100% compleet
- Auto-close logica in employment/functions/roster-assignments is identiek op de modelnaam na
- getSettingsModel gebruikt `(prisma as any)` — bewuste keuze vanwege dynamische model lookup

### [2026-03-29]
**Samenvatting**
Tweede audit. Focus op verdere duplicatiereductie en centralisering van gedeelde logica. Alle wijzigingen gevalideerd met typecheck + lint (0 errors).

**Geanalyseerd**
- Alle bestanden uit vorige audit opnieuw beoordeeld
- Speciale aandacht voor open punten uit vorige run
- Nieuwe focus: aggregatielogica duplicatie, magic values, planning entry transformatie, optimistic update duplicatie

**Doorgevoerd**
1. **Aggregatielogica geëxtraheerd** → nieuw bestand `src/lib/aggregation.ts`
   - `getAggregatedColumns()` vervangt ~80 regels identieke switch/case in zowel PlanningGrid.tsx als CapacityPage.tsx
   - Totaal ~160 regels gedupliceerde code geëlimineerd
   - Type `ColumnHeader` nu centraal gedefinieerd en geëxporteerd

2. **transformPlanningEntry geëxtraheerd** → toegevoegd aan `src/lib/api-route-utils.ts`
   - Vervangt 3x dezelfde entry → response transformatie in planning/route.ts (GET + POST) en planning/for-range/route.ts
   - `any[]` type in for-range/route.ts vervangen door `ReturnType<typeof transformPlanningEntry>[]`

3. **MONTH_SHORT, DEFAULT_PERIOD_DAYS, UNKNOWN_LABEL** → toegevoegd aan `src/domain/constants.ts`
   - MONTH_SHORT was gedupliceerd in: PlanningGrid.tsx, CapacityPage.tsx, utils.ts
   - DEFAULT_PERIOD_DAYS (56) was gedupliceerd als DEFAULT_DAY_COUNT en DEFAULT_CAPACITY_DAYS
   - UNKNOWN_LABEL vervangt 6x hardcoded "Onbekend" in api-helpers.ts

4. **getMondayStart()** → toegevoegd aan `src/lib/utils.ts`
   - "Snap today to Monday" berekening was gedupliceerd in PlanningGrid.tsx en CapacityPage.tsx

5. **applyOptimisticEntries()** → geëxtraheerd binnen PlanningGrid.tsx
   - Identieke entry-creatie logica in handleUpdate en handleBulkSelect geconsolideerd
   - Voorkomt code-drift tussen single en bulk update paden

**Niet doorgevoerd**
- **PlanningGrid opsplitsing** (GroupRows → apart bestand, useDragSelection hook): hoog risico vanwege complexe state-interacties en prop doorgifte. Documenteer als vervolgstap.
- **Type safety api.ts**: 464 regels met `any` types — te groot voor veilige bulk-wijziging. Geleidelijke aanpak aanbevolen.
- **useApi.ts cache-eviction**: vereist design-beslissing (LRU vs TTL vs WeakRef). Documenteer als open punt.
- **`context?: any` in API routes**: 2 routes (roster-assignments, scenarios/duplicate) gebruiken los `context?: any` i.p.v. proper destructuring. Klein maar vereist testen per route.
- **Input validatie API routes**: nuttig maar vereist validatie-helper design + toepassing over 7+ routes.
- **CapacityChart/CapacityTable available-berekening**: kleine duplicatie, lage impact.

**Nieuwe learnings**
- Aggregatielogica was 100% identiek tussen PlanningGrid en CapacityPage — veilige extractie zonder randgevallen
- CapacityPage had een lokaal `ColumnHeader` type dat `dates` miste — de gedeelde versie uit aggregation.ts bevat `dates` wat correct is (CapacityPage gebruikte `dateGroups` apart, nu afgeleid via `columnHeaders.map(col => col.dates)`)
- PlanningGrid importeerde `addDays` uit date-fns alleen voor de Monday-snap — na extractie van getMondayStart is die import verwijderd
- De pre-existing ESLint warnings in PlanningGrid (missing dep handleDragEnd, filteredDrivers logical expression) zijn niet door deze audit veroorzaakt

**Aanbevolen vervolgstappen**
1. PlanningGrid.tsx opsplitsen: drag logic → `useDragSelection()` hook, GroupRows → eigen bestand — hoog risico maar hoogste onderhoudswinst
2. Type safety geleidelijk verbeteren: begin met `getComputedFields(driver: any)` → `DriverWithEntries`
3. useApi.ts cache-eviction implementeren (LRU of TTL)
4. `context?: any` vervangen door typed params in roster-assignments en scenarios/duplicate routes
5. Input validatie helper toevoegen aan api-route-utils.ts
