# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Mobile initiative (SMI-019 / ESC-013) is 2/3 complete (PB-154 ✓, PB-155 ✓). Next priorities: PB-156 (mobile planning view) for Experience Agent, PB-163 and PB-164 (deduplication consolidation) for Delivery Agent. After that, only P4 polish/cleanup items remain.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-156: Mobiele dag-/weekplanning per chauffeur

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem:** De planningsgrid is niet bruikbaar op mobiel (30+ kolommen). De mobiele navigatie (PB-154) en chauffeurlijst (PB-155) zijn klaar — planners kunnen op hun telefoon navigeren en chauffeurs opzoeken, maar kunnen geen roosters inzien.
- **Scope notes:** Maak een mobiele planning-weergave: selecteer één chauffeur, toon dag- of weekweergave met statusblokken. Geen bewerkfunctionaliteit in eerste versie (read-only). Planners kunnen op mobiel de planning inzien maar bewerken op desktop.
- **Dependencies:** PB-155 (completed)
- **Definition of done:** Planners kunnen op mobiel de planning van een individuele chauffeur bekijken per dag of week. Statusblokken met semantische kleuren. Desktop planning grid is ongewijzigd. `npm run verify` slaagt.
- **Implementation note:** Read-only view. Single driver selection. Day/week toggle. Use existing status colors from STATUS_COLORS. Reuse data from planning API. No edit capability in v1. This completes the mobile read-only flow defined in ESC-013 Option B.
- **Source:** EX-REC-051, ESC-013

### PB-163: Deduplicate resolveUserId naar gedeelde module

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem:** `resolveUserId()` is volledig gedupliceerd tussen `src/app/api/preferences/route.ts` en `src/app/api/scenarios/active/route.ts`. Beide resolven de huidige gebruiker uit de sessie met fallback naar "default".
- **Scope notes:** Extraheer naar `src/lib/api-route-utils.ts` naast de andere gedeelde route helpers. Beide routes importeren van daar. ~15 regels duplicatie geëlimineerd.
- **Dependencies:** None
- **Definition of done:** `resolveUserId()` staat in `api-route-utils.ts`. Beide routes importeren van daar. Functionaliteit ongewijzigd. `npm run verify` slaagt.
- **Implementation note:** Volgt hetzelfde extractiepatroon als PB-160.
- **Source:** DE-REC-068

### PB-164: Deduplicate validateApiFields naar gedeelde module

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem:** `validateApiFields()` en bijbehorende validatieconstanten (`VALID_TARGET_ENTITIES`, `VALID_SOURCE_TYPES`, `VALID_API_METHODS`, `VALID_API_AUTH_TYPES`) zijn volledig gedupliceerd tussen `src/app/api/import-sources/route.ts` en `src/app/api/import-sources/[id]/route.ts`. ~70 regels duplicatie.
- **Scope notes:** Verplaats `validateApiFields()` en de validatieconstanten naar `src/lib/api-import-helpers.ts` (bestaat al na PB-160). Beide routes importeren van daar.
- **Dependencies:** None
- **Definition of done:** `validateApiFields()` en constanten staan in `api-import-helpers.ts`. Beide routes importeren van daar. Functionaliteit ongewijzigd. `npm run verify` slaagt.
- **Implementation note:** `api-import-helpers.ts` is de natuurlijke locatie — bevat al de andere gedeelde import-source logica.
- **Source:** DE-REC-069

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-155: Mobiele chauffeurlijst en zoeken

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-154: Mobiele layout shell en navigatie

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-162: Importbron GET-lijst endpoint beveiligd met ADMIN-rol

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-160: Deduplicate API import helpers naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-161: Audit log cleanup mechanisme

- **Status:** Completed
- **Owner:** Delivery Agent
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
- **Reason:** Current flex-wrap handles basic cases. May become relevant after mobile work completes.

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
- **Reason:** Natural Phase 1 follow-up but not blocking. Current auto-detection handles common patterns.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-165.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
