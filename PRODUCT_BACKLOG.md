# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** API Phase 1 is fully complete. Next priorities: (1) deduplicate API helpers created during Phase 1, (2) audit log cleanup mechanism, (3) mobile views starting with layout shell. Mobile is sequenced as PB-154 → PB-155 → PB-156.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items ready for next cycle._

### PB-154: Mobiele layout shell en navigatie

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Completed:** 2026-03-31
- **Problem:** De applicatie heeft geen mobiele navigatie of responsive layout shell. De Scrum Master wil selectieve mobiele weergaven (ESC-013, Option B).
- **Scope notes:** Maak een responsive layout variant voor schermen < 768px: hamburger-menu voor navigatie, compactere header, touch-vriendelijke tap targets. Sidebar wordt een slide-over panel op mobiel. Desktop layout blijft ongewijzigd. Gebruik Tailwind responsive utilities.
- **Dependencies:** None
- **Definition of done:** Op mobiele viewports: sidebar is verborgen achter hamburger-menu, header is compact, navigatie werkt via slide-over. Desktop is ongewijzigd. `npm run verify` slaagt.
- **Implementation note:** Sidebar hidden on mobile (`hidden md:flex`), slide-over panel with backdrop overlay and close-on-navigate. Hamburger button in Header (md:hidden). Touch-friendly tap targets (py-2.5 on mobile nav items). Compact mobile padding (p-4 vs p-6). Animations: slide-in-left for panel, fade-in for overlay. Desktop completely unchanged.

---

## Upcoming (Sequenced)

### PB-155: Mobiele chauffeurlijst en zoeken

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
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

### PB-160: Deduplicate API import helpers naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Implementation note:** Extracted `buildApiHeaders()`, `extractDataArray()`, `resolveJsonPath()`, and `discoverPaths()` to `src/lib/api-import-helpers.ts`. Both test and execute routes now import from the shared module. ~80 lines of duplication eliminated. Minor inconsistency fixed: execute route used raw `value` in header loop; shared version uses `String(value)` for safety.

### PB-161: Audit log cleanup mechanisme

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Implementation note:** Added `cleanupOldAuditLogs(retentionDays = 90)` to `src/lib/audit.ts`. Fire-and-forget call at the end of import execution in the execute route. Uses `deleteMany` with date filter. Failures are logged but never block the import.

### PB-159: Fix authorization bypass op planning DELETE en import-source GET

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-158: API-bron test-verbinding knop

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-153: API-bron response mapping

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-152: API-bron uitvoering — GET-request en response-import

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-151: API-bron configuratie UI

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-150: API-bron type — datamodel uitbreiding ImportSource

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-157: Elimineer overbodige findMany in autoCloseOpenRecords

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-146–PB-149: Audittrail — volledig

- **Status:** Completed
- **Owner:** Delivery Agent + Experience Agent
- **Completed:** 2026-03-31

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
- **Reason:** Current field mapping editor is functional with autocomplete from discovered paths.

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

### DE-REC-065: API response data path configuration

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural Phase 1 follow-up but not blocking. Current auto-detection handles common patterns. Promote if users report incompatible APIs.
- **Source:** DE-REC-065

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-162.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
