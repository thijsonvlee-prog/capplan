# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** API connections Phase 1 is halfway done (PB-150, PB-151 complete). Next: API execution (PB-152), then test connection (PB-158), response mapping (PB-153). Mobile views (PB-154–156) follow after API Phase 1 is complete.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready._

---

## Upcoming (Sequenced)

### PB-154: Mobiele layout shell en navigatie

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Blocked (sequenced after API Phase 1)
- **Problem:** De applicatie heeft geen mobiele navigatie of responsive layout shell. De Scrum Master wil selectieve mobiele weergaven (ESC-013, Option B).
- **Scope notes:** Maak een responsive layout variant voor schermen < 768px: hamburger-menu voor navigatie, compactere header, touch-vriendelijke tap targets. Sidebar wordt een slide-over panel op mobiel. Desktop layout blijft ongewijzigd. Gebruik Tailwind responsive utilities.
- **Dependencies:** None (technical), but sequenced after API Phase 1 for capacity reasons
- **Definition of done:** Op mobiele viewports: sidebar is verborgen achter hamburger-menu, header is compact, navigatie werkt via slide-over. Desktop is ongewijzigd. `npm run verify` slaagt.

### PB-155: Mobiele chauffeurlijst en zoeken

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Blocked (on PB-154)
- **Problem:** De chauffeurspagina is niet bruikbaar op mobiel (brede tabel, kleine tekst).
- **Scope notes:** Maak een mobiele variant van de chauffeurspagina: card-based layout in plaats van tabel, prominente zoekbalk, tap-to-open detail. Toon naam, personeelsnummer, afdeling en status per card. Gebruik responsive breakpoints: tabel op desktop, cards op mobiel.
- **Dependencies:** PB-154
- **Definition of done:** Chauffeurlijst is bruikbaar op mobiel met card-layout en zoekfunctie.

### PB-156: Mobiele dag-/weekplanning per chauffeur

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Blocked (on PB-155)
- **Problem:** De planningsgrid is niet bruikbaar op mobiel (30+ kolommen).
- **Scope notes:** Maak een mobiele planning-weergave: selecteer één chauffeur, toon dag- of weekweergave met statusblokken. Geen bewerkfunctionaliteit in eerste versie (read-only). Planners kunnen op mobiel de planning inzien maar bewerken op desktop.
- **Dependencies:** PB-155
- **Definition of done:** Planners kunnen op mobiel de planning van een individuele chauffeur bekijken per dag of week.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-158: API-bron test-verbinding knop

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Summary:** "Verbinding testen" knop in het API-configuratieformulier. Test-endpoint (`/api/import-sources/test`) voert een lichtgewicht HTTP-request uit met de geconfigureerde URL, headers en authenticatie. Toont inline succes/fout-status. Bij succes wordt ook de response-structuur ontdekt (JSON-paden en voorbeelddata) — dit dient als basis voor PB-153.
- **Implementation note:** Test endpoint accepteert configuratie als POST body (werkt ook voor nog niet opgeslagen bronnen). 15s timeout. Hergebruikt dezelfde auth-header bouwlogica als de execute-handler.

### PB-153: API-bron response mapping

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Summary:** Na een succesvolle verbindingstest toont het formulier de ontdekte response-structuur met JSON-paden en voorbeeldwaarden. Klik op een pad om het als bronveld in de veldkoppeling toe te voegen. Bronveld-invoervelden bieden autocomplete via datalist met ontdekte paden. Ondersteunt geneste objecten via dot-notatie.
- **Implementation note:** Response structure discovery via recursive path extraction op het eerste record. Datalist HTML5 autocomplete op source column inputs. Click-to-add populeert eerste lege mapping of voegt nieuwe rij toe.

### PB-152: API-bron uitvoering — GET-request en response-import

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Summary:** Execute-handler uitgebreid voor API-bronnen. Server-side HTTP-request naar geconfigureerde URL met headers en authenticatie (Basic, Bearer, API-sleutel). JSON-response wordt geparseerd en via dot-notatie veldmapping geïmporteerd. Ondersteunt geneste objecten (bijv. `employee.firstName`). Zoekt automatisch data-arrays in response (root array of `data`/`results`/`items`/`rows`/`records` wrapper). UI met uitvoerknop, moduskeuze en resultaatweergave. Resultaat zichtbaar in importlogboek.
- **Implementation note:** Reuses existing importDrivers/importStamtabel functions. API-specific: 30s timeout, auth header building, JSON path resolution, data array extraction. Frontend: `executeApi()` method and dedicated API execute panel in ImportSourceManager.

### PB-151: API-bron configuratie UI

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Summary:** ImportSourceManager uitgebreid met brontype-kiezer (CSV/API). API-modus toont URL, HTTP-methode, headers key-value editor, authenticatietype met credential-velden. Bronnenlijst toont type-badge met icoon en API-details.

### PB-150: API-bron type — datamodel uitbreiding ImportSource

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Summary:** ImportSource model uitgebreid met API-specifieke velden. Migratie aangemaakt. Domain enums toegevoegd. API-routes valideren API-velden bij type=API.

### PB-157: Elimineer overbodige findMany in autoCloseOpenRecords

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Summary:** Redundante `findMany()` guard verwijderd. Bespaart ~3 DB-roundtrips per sub-record aanmaak.

### PB-146–PB-149: Audittrail — volledig

- **Status:** Completed
- **Owner:** Delivery Agent + Experience Agent
- **Completed:** 2026-03-31
- **Summary:** Volledige audittrail: datamodel, logging op alle entiteiten, UI viewer in instellingen.

---

## Deferred

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is structurally aligned. Custom tooltip is cosmetic.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. May become relevant when mobile work (PB-154) starts.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014, DE-REC-030, DE-REC-047.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement. Needs visual evaluation.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. May be revisited when API mapping work (PB-153) starts.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor optimization. Low urgency.

### DE-REC-063: weeklyHours range validation on roster assignment routes

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Trivial validation gap on a single numeric field. Near-zero risk.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick optimization but not user-facing.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-159.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
