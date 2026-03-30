# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The codebase is in excellent shape — 0 ESLint warnings, 0 typecheck errors, Map-based lookups consistent across all hot paths, all API routes hardened with validation and Dutch error messages, design alignment with DESIGN.md is high across all major surfaces. The major design overhaul (SMI-004) is complete and the connectivity hub admin screen (PB-016) is delivered. The active backlog is light — the next cycle focuses on small cleanup and consistency items. Remaining work is low-priority refinement.

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

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-075: Memoize Map creation in DriverForm.tsx
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Wrapped employer, department, and location Map creations in `useMemo` with appropriate dependency arrays. Consistent with Map-based memoization pattern used in PlanningGrid.

### PB-073: Remove remaining unused utility functions and enum
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed 6 unused functions from `utils.ts` (`getWeekDates`, `get4WeekDates`, `formatDateNL`, `getCurrentWeek`, `getMonthDates`, `getYearMonths`) and their now-unused imports (`startOfMonth`, `endOfMonth`, `getYear`, `getDaysInMonth`, `format`, `nl`, `MONTH_SHORT`). Removed unused `StamtabelType` enum from `enums.ts`. Updated documentatie page description.

### PB-074: Add `btn-danger` CSS class and replace inline button styles
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Added `.btn-danger` class to `globals.css` following the same token structure as `.btn-primary` (danger-600 bg, inverse text, danger-800 hover, disabled state). Replaced inline class string in `ConfirmDialog.tsx` with `btn-danger`. Replaced inline class string in `documentatie/page.tsx` with `btn-primary`. Button system now has complete coverage: primary, secondary, danger, icon, icon-danger.

### PB-016: Connectivity hub — admin screen for import source configuration
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Working admin screen for managing CSV import sources with field mapping. Added as "Connectiviteit" tab within the settings page. Includes create/edit form with name, target entity selector, description, and visual field mapping editor. Full CRUD with toast notifications and delete confirmation dialog. All labels in Dutch. Uses design tokens only.

### PB-071: Remove unused utility exports from utils.ts
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed four unused functions from `src/lib/utils.ts`.

### PB-072: Planning page header subtitle
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Planning page header now shows active scenario name as subtitle. All three major pages show contextual subtitles consistently.

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
- **Reason:** Low-risk follow-up but needs visual evaluation before broad application.
- **Source:** EX-REC-038.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional and usable. Card-based or drag-connect interface would be a polish item for when the connectivity hub sees regular use. CSV preview is a future enhancement.
- **Source:** EX-REC-043.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene. Scenarios payload is small. Only worth addressing if PlanningGrid is refactored for other reasons.
- **Source:** EX-REC-042.

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
