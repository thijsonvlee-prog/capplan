# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The mobile app redesign initiative (SMI-024) is fully complete. All phases delivered and deployed. The project is in a stable post-initiative state with no active strategic driver. Next cycle focuses on small maintenance and polish items. No Scrum Master input pending.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-176: Verplaats COMPARE_COLORS naar module scope en constants

- **ID:** PB-176
- **Title:** Verplaats COMPARE_COLORS naar module scope en constants
- **Problem / opportunity:** `COMPARE_COLORS` is defined inside the `CapacityChart` component function, creating a new array reference on every render. Also uses hardcoded hex values without referencing design tokens.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Trivial fix that improves render stability and centralizes color definitions. Combines two related recommendations.
- **Scope notes:** Move `COMPARE_COLORS` outside the component to module scope. Add comments referencing design token equivalents. Optionally move to `src/domain/constants.ts` if reuse is likely.
- **Dependencies:** None.
- **Definition of done:** `COMPARE_COLORS` is at module scope (not inside the component function). Hex values have comments referencing tokens. Verify passes.
- **Implementation note:** Combines DE-REC-047 and DE-REC-014.
- **Source:** DE-REC-047 + DE-REC-014

### PB-177: Verwijder ongebruikte type-exports uit domain/types.ts

- **ID:** PB-177
- **Title:** Verwijder ongebruikte type-exports uit domain/types.ts
- **Problem / opportunity:** `PlanningEntryOptions` and `UserContext` are defined but never imported anywhere. Dead code creates confusion.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Quick cleanup. No risk.
- **Scope notes:** Remove only types confirmed unused via grep. Do not remove types that may be used indirectly.
- **Dependencies:** None.
- **Definition of done:** Unused types removed. Verify passes. No other files affected.
- **Implementation note:** See DE-REC-041.
- **Source:** DE-REC-041

### PB-178: Opruimen ongebruikte mobiele CSS-klassen

- **ID:** PB-178
- **Title:** Opruimen ongebruikte mobiele CSS-klassen
- **Problem / opportunity:** `mobile-nav-overlay` and `mobile-nav-panel` CSS classes in globals.css are no longer used after the mobile navigation overhaul removed the hamburger menu.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Dead CSS from the mobile redesign. Quick cleanup.
- **Scope notes:** Confirm classes are unused via grep, then remove from globals.css. Do not remove any CSS class that is still referenced.
- **Dependencies:** None.
- **Definition of done:** Unused mobile-nav CSS classes removed. Verify passes.
- **Implementation note:** Flagged in Experience Agent risks/watch-outs.
- **Source:** EX-REC risks

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-175: Mobiele chauffeurspagina — visuele opfrisbeurt

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Added `mobile-page-enter` entrance animation to the mobile card list. Increased driver card padding from 0.75rem to 0.875rem/1rem to match settings card pattern. Desktop unchanged. Verify passes.

### PB-170: Mobiele planning — aanpassen aan nieuwe navigatie

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-171: Mobiele capaciteitsweergave

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-172: Mobiele instellingenweergave

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-173: Mobiele app-feel — transities en polish

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-174: Documentatiepagina vervangen door releasenotes-pagina

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-163: Deduplicate resolveUserId naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

### PB-164: Deduplicate validateApiFields naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

---

## Deferred

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first. Can be picked up when user demand is confirmed.

### EX-REC-053: Mobiel startscherm — begroeting en scenario-context

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-effort personalization enhancement. Can be combined with any future mobile work cycle.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Most visible remaining desktop integration gap. Low risk but no user demand driving it.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Only relevant if narrow desktop viewport usage is reported.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No user impact. Pick up when capacity allows.

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

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick optimization but not user-facing.

### DE-REC-065: API response data path configuration

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural Phase 1 follow-up but not blocking.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Partially addressed by PB-176.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-179.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
