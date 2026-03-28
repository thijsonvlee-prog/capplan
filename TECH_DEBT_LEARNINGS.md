# Technical Debt Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende code quality en technical debt reviews op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen behouden blijven.

## Terugkerende structurele aandachtspunten
- API routes bevatten veel duplicatie die bij elke nieuwe route meegekopieerd wordt (transformDriver, resolveScenarioId, auto-close logica)
- De migratie van localStorage naar Prisma/API is functioneel compleet, maar liet ~1200 regels dode code achter
- PlanningGrid.tsx (709 regels) en CapacityPage.tsx (237 regels) delen aggregatielogica die niet centraal staat
- `any` types worden breed ingezet in zowel API routes als client-side helpers
- Magische waarden (DEFAULT_DAY_COUNT=56, driverColWidth=180, etc.) staan verspreid over meerdere componenten

## Bekende technische schuld
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| PlanningGrid.tsx | 709 regels, 11+ useState hooks, meerdere verantwoordelijkheden | Hoog - lastig te onderhouden en uit te breiden | Open | Opsplitsen in PlanningHeader, PlanningTable, PlanningRow subcomponenten |
| DriverForm.tsx | 455 regels met 3 inline sub-form componenten (EmploymentForm, PositionForm, RosterForm) | Middel - werkbaar maar niet ideaal | Open | Sub-forms naar eigen bestanden extraheren |
| Aggregatielogica duplicatie | Identieke week/maand/kwartaal aggregatie in PlanningGrid (r99-177) en CapacityPage (r43-127) | Middel - inconsistentierisico bij wijzigingen | Open | Extraheer naar gedeelde utility in lib/ |
| Type safety API routes | Breed gebruik van `any` types in route handlers en api.ts | Middel - runtime bugs mogelijk | Open | Geleidelijk vervangen door Prisma-afgeleide types |
| Type safety api.ts | 464 regels met veel `any` types voor request bodies | Middel | Open | Definieer request/response types per endpoint |
| Type safety api-helpers.ts | getComputedFields accepteert `driver: any` | Laag | Open | Vervang door Driver type uit domain/types |
| Magische waarden | DEFAULT_DAY_COUNT, DENSITY_CONFIG, driverColWidth, extraColWidth verspreid | Laag | Open | Centraliseer in domain/constants.ts |
| MONTH_SHORT array | Gedupliceerd in PlanningGrid en CapacityPage | Laag | Open | Verplaats naar domain/constants.ts |
| Settings routes `(prisma as any)` | Dynamische model lookup omzeilt type safety | Laag - werkt maar fragiel | Open | Overweeg aparte endpoints per type i.p.v. generiek |
| Transactieveiligheid | Roster assignment + planning generatie niet in transactie | Middel - race condition risico | Open | Wrap in prisma.$transaction |
| roster-assignments/route.ts | 174 regels, maakt roster assignment + genereert 364 dagen planning | Middel - te veel verantwoordelijkheden | Open | Split planning generatie naar apart endpoint of service |
| DocumentatiePage.tsx | 350+ regels hardcoded documentatiestring | Laag | Open | Overweeg markdown bestand i.p.v. inline string |
| useApi.ts globale state | Globale cache Map en listeners Set - potentieel geheugenlek | Laag | Open | Overweeg cleanup bij unmount |

## Bewezen effectieve verbeteringen
- Extractie van gedeelde API route utilities (transformDriver, resolveScenarioId, transformProfile, driverInclude, getSettingsModel, autoCloseOpenRecords, getNextSequenceNumber) naar `src/lib/api-route-utils.ts` - elimineert ~150 regels duplicatie over 14 bestanden
- Verwijdering van dode localStorage repositories en services (~1200 regels) na volledige migratie naar Prisma
- Consolidatie van 3 identieke getActiveEmployment/getActiveFunction/getActiveRoster naar generieke getActiveRecord<T>
- Repository interfaces verwijderd (niet meer gebruikt na migratie)

## Dingen die weinig opleverden of juist extra risico gaven
- (Eerste run - nog geen mislukte pogingen)

## Cross-domain aandachtspunten
- PlanningGrid.tsx refactoring is randvoorwaardelijk voor performance-virtualisatie (zie PERFORMANCE_LEARNINGS.md). Coördineer opsplitsing met performance-runs.
- Aggregatielogica-extractie (PlanningGrid + CapacityPage) raakt ook de POC CapacitySummaryRow (zie POC_EXPERIMENTS.md). Neem dit experiment mee bij consolidatie.
- Type safety verbeteringen mogen de bestaande API-route conventie uit CLAUDE.md niet doorbreken (alle data access via API routes met Prisma).

## Aandachtspunten voor volgende runs
- PlanningGrid.tsx is de grootste kandidaat voor opsplitsing, maar riskant vanwege complexe state-interacties
- De `saving` prop in DriverForm wordt niet doorgegeven vanuit DriverList - dit is een feature die nog aangesloten moet worden, niet dode code
- baseRosterHours in DayCell is een prop die wel gebruikt wordt in de component maar nooit doorgegeven wordt vanuit PlanningGrid
- Bij het consolideren van aggregatielogica: test goed of week/maand/kwartaal berekeningen identiek blijven
- De `any` types in api-route-utils.ts zijn bewust gekozen omdat de Prisma types niet beschikbaar zijn vanuit het generated pad

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
  - transformDriver (was gedupliceerd in 3 bestanden)
  - transformProfile (was gedupliceerd in 2 bestanden)
  - resolveScenarioId (was gedupliceerd in 5 bestanden)
  - driverInclude (was gedupliceerd in 2 bestanden)
  - getSettingsModel + typeModelMap (was gedupliceerd in 2 bestanden)
  - autoCloseOpenRecords (was gedupliceerd in 3 bestanden met enkel andere modelnaam)
  - getNextSequenceNumber (was gedupliceerd in 3 bestanden)
- 14 API route bestanden geupdate om gedeelde utilities te importeren
- ~1200 regels dode code verwijderd:
  - src/repositories/localStorage/ (7 bestanden, ~730 regels)
  - src/repositories/interfaces/ (7 bestanden, ~50 regels)
  - src/services/ (7 bestanden, ~480 regels)
- getActiveEmployment, getActiveFunction, getActiveRoster geconsolideerd naar generieke getActiveRecord<T>
- PlanningGrid.tsx geupdate om getActiveRecord te gebruiken

**Niet doorgevoerd**
- Opsplitsing PlanningGrid.tsx: te groot risico, complexe state-interacties
- Extractie DriverForm sub-components: nuttig maar niet urgent, functioneert goed
- Aggregatielogica consolidatie: vereist zorgvuldige afstemming PlanningGrid + CapacityPage
- Type safety verbetering api.ts: grote impact, vereist geleidelijke aanpak
- Transactie-wrapping in roster-assignments: vereist testomgeving
- Verplaatsing magische waarden naar constants: cosmetisch, laag risico maar ook lage prioriteit

**Nieuwe learnings**
- De localStorage -> Prisma migratie is 100% compleet; geen enkele referentie naar localStorage repos of services gevonden
- Auto-close logica in employment/functions/roster-assignments is identiek op de modelnaam na - goed kandidaat voor extractie
- getSettingsModel gebruikt `(prisma as any)` - dit is een bewuste keuze vanwege dynamische model lookup

**Aanbevolen vervolgstappen**
1. Aggregatielogica (week/maand/kwartaal) extraheren naar shared utility - middel risico, hoge waarde
2. PlanningGrid.tsx opsplitsen in subcomponenten - hoog risico, hoge waarde, zorgvuldig plannen
3. Type safety geleidelijk verbeteren: begin met api-helpers.ts (vervang `driver: any` door `Driver`)
4. MONTH_SHORT en andere gedupliceerde constanten centraliseren in domain/constants.ts
5. saving prop in DriverForm aansluiten vanuit DriverList
