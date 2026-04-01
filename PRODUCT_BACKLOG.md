# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2 items. The product is stable across all core features: planning grid, capacity analysis, driver management, mobile views, API connectivity, audit trail, user groups, and authentication. All remaining items are P3/P4 deferred polish and cleanup. Next cycle work depends on Scrum Master direction or new user feedback.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items ready for next cycle._

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-168: Fix mobiele sidebar sluit direct bij openen (useEffect mount-bug)

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Added `useRef` mount guard in `Sidebar.tsx` to skip the `onClose()` call on initial mount. The useEffect now only triggers `onClose()` when `pathname` actually changes after the first render. Desktop behavior unchanged. `npm run verify` passes.

### PB-165: Fix mobiele hamburger-menu (z-index bug)

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Added `relative z-50` to header element in `Header.tsx`. Partial fix — z-index was correct but a separate mount-trigger bug in Sidebar.tsx remained. See PB-168 for the full fix.

### PB-166: Fix uitlijning vergrootglas in zoekbalken

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-167: Mobiele planning omzetten naar maandkalenderweergave

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
- **Reason:** Natural next step for mobile planning. PB-167 (calendar redesign) is complete. Validate read-only flow with user feedback first before investing in edit capability.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is structurally aligned. Custom tooltip is cosmetic.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural follow-up to PB-164 deduplication. Low effort but no user impact.

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
- Backlog IDs are sequential and never reused. Next available: PB-169.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
