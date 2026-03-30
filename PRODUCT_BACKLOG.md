# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The codebase is in excellent shape — 0 ESLint warnings, Map-based lookups fully consistent across all hot paths, all API routes hardened with validation and Dutch error messages, design alignment with DESIGN.md is high across all major surfaces. The major design overhaul (SMI-004) is complete. Remaining work is refinement: small UX consistency items, dead code cleanup, and the connectivity hub admin screen (PB-016) as the next feature milestone.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-071: Remove unused utility exports from utils.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** Four exported functions in `src/lib/utils.ts` are never imported anywhere: `getStartDateForRange()`, `getQuarterDates()`, `getQuarterLabel()`, `get4WeekPeriodStarts()`. Dead exports create confusion about what is actually used.
- **Why this matters now:** Quick cleanup that reduces maintenance noise. Confirmed unused via grep.
- **Scope notes:** Remove the four unused functions only. Do not refactor adjacent code.
- **Dependencies:** None.
- **Definition of done:** Four unused functions removed from `src/lib/utils.ts`. `npm run verify` passes with 0 errors.
- **Implementation note:** If any function turns out to have an import that grep missed, keep it.
- **Source:** DE-REC-037.

### PB-072: Planning page header subtitle

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** The capacity and drivers pages now show contextual subtitles in the header (scenario name, driver count) via PB-070. The planning page does not yet show a subtitle, breaking consistency across the three major pages.
- **Why this matters now:** Small follow-up to PB-070. Consistent contextual headers across all major pages.
- **Scope notes:** Have the planning page call `useHeaderSubtitle` with the active scenario name. May require reading the scenario name from the scenarios list already fetched by ScenarioSelector. Do not refactor PlanningGrid broadly — find the least invasive way to surface the scenario name.
- **Dependencies:** PB-070 (completed).
- **Definition of done:** Planning page header shows active scenario name as subtitle. `npm run verify` passes with 0 errors.
- **Implementation note:** PlanningGrid currently fetches `activeScenarioId` but not the name. ScenarioSelector fetches the scenarios list. The simplest path may be to read from ScenarioSelector's data or lift a small fetch.
- **Source:** EX-REC-041.

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

### PB-070: Header contextual enhancements
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Header shows contextual subtitles: capacity page displays active scenario name, drivers page shows driver count.

### PB-069: Expand warning design token scale
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `warning-50`, `warning-500`, `warning-700`. ScenarioSelector "Concept" badge uses softer styling.

### PB-066: PlanningGrid per-cell entry lookup optimization
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced `.find()` and `.filter()` in PlanningGrid with O(1) Map-based lookups via `useEntryMaps` hook.

### PB-067: Planning grid toolbar second row — tighter grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Status legend wrapped in `.control-group` with "Status" label.

### PB-068: ScenarioSelector hardcoded Tailwind color fix
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced hardcoded Tailwind colors with design tokens on "Concept" badge.

### PB-065: Replace DayCell leaveType .find() with Map-based lookup
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced `leaveTypes.find()` with `leaveTypeMap.get()` in DayCell render path.

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

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Same `.find()` pattern as PB-066 but in the POC capacity summary component. Depends on whether the POC is promoted or removed. Not worth optimizing dead-end code.
- **Source:** DE-REC-036.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and usable. Minor visual issue. Defer until higher-priority UX work is complete.
- **Source:** EX-REC-036.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up to PB-063 but needs visual evaluation before broad application.
- **Source:** EX-REC-038.

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
