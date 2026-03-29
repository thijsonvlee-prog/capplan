# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The codebase is in strong shape — 0 ESLint warnings, Map-based lookups fully consistent across PlanningGrid and all component render paths, all API routes hardened with validation and Dutch error messages. Design alignment with DESIGN.md is high. No hot-path `.find()` calls remain in PlanningGrid. The CapacitySummaryRow (POC) has a remaining `.find()` pattern that can be addressed if the POC is promoted to production quality.

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

## Planned (Future Cycles)

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen for CSV import source configuration with field mapping.
- **Dependencies:** PB-015 (completed).
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Follows existing design token system and component patterns. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-066: PlanningGrid per-cell entry lookup optimization
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced `planningEntries.find()` and `.filter()` in PlanningGrid's per-cell and aggregated-view render paths with O(1) Map-based lookups via a `useEntryMaps` hook in GroupRows. Also optimizes the aggregated column entry collection. Passes `npm run verify` with 0 errors.
- **Follow-up:** `CapacitySummaryRow.tsx` (POC) has the same `.find()` pattern at line 47. Noted in DE-REC-036.

### PB-067: Planning grid toolbar second row — tighter grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Status legend in toolbar row 2 wrapped in `.control-group` with "Status" label, matching the visual grouping pattern of the first toolbar row and the existing search/grouping and columns/totals groups. All three control groups in row 2 now have consistent tonal surface treatment.

### PB-068: ScenarioSelector hardcoded Tailwind color fix
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced `bg-amber-100 text-amber-700` with `bg-warning-200 text-warning-900` design tokens on the "Concept" scenario badge. No hardcoded Tailwind color classes remain in ScenarioSelector.tsx.

### PB-065: Replace DayCell leaveType .find() with Map-based lookup
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced `leaveTypes.find()` in DayCell render path with `leaveTypeMap.get()` using a pre-built `Map<string, string>`. Completes the Map-based lookup pattern across the entire codebase.

### PB-062: Fix capacity page scenario toggle color semantics
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Changed active scenario toggle from undefined warning tokens to `brand-50`/`brand-700`.

### PB-063: Add Manrope typeface for display and headline levels
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added Manrope via `next/font/google`. Applied to `.text-page-title` with weight 700 and tighter letter-spacing.

### PB-064: Strengthen header component composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Removed `border-b` from header. Removed redundant "CapPlan" label. Tonal surface contrast for separation.

---

## Deferred

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness.
- **Source:** DE-REC-005.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Includes API magic numbers (DE-REC-030) and chart colors (DE-REC-014). Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `cleanupOldEvents()` in `perf.ts` is defined but never called. Table grows unbounded, but traffic is low. Low urgency.
- **Source:** DE-REC-031.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** The drivers page is functional and the alternating backgrounds are a minor visual issue. Defer until higher-priority UX work is complete.
- **Source:** EX-REC-036.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up to PB-063 but needs visual evaluation before broad application. Defer until next UX cycle.
- **Source:** EX-REC-038.

### EX-REC-039: Header contextual enhancements

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Good idea but requires per-page context data plumbing. Defer until the current toolbar grouping work is done and the header base is stable.
- **Source:** EX-REC-039.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Stale or superseded items should be removed or deferred.
- Overlapping items should be merged.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
