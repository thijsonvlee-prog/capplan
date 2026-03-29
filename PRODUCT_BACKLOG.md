# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major redesign work, API validation hardening, and performance optimizations are complete. ESLint is clean (0 warnings). The connectivity hub data model and API (PB-015) are shipped. The active backlog contains small UX polish items (design system alignment, semantic color fixes) and one technical cleanup item. PB-016 (connectivity hub admin UI) remains planned for a future cycle.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-062: Fix capacity page scenario toggle color semantics

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The active scenario toggle on the capacity page uses `bg-warning-50 text-warning-700`, which semantically implies caution/warning. The correct semantic for active selection is brand colors.
- **Why this matters now:** Single-line fix. The current color is semantically wrong and creates inconsistency with brand color usage elsewhere.
- **Scope notes:** Change selected scenario toggle from `warning-50`/`warning-700` to `brand-50`/`brand-700`.
- **Dependencies:** None.
- **Definition of done:** Active scenario toggle uses brand colors instead of warning colors. Passes `npm run verify`.
- **Implementation note:** Trivial CSS class change.
- **Source:** EX-REC-034.

### PB-063: Add Manrope typeface for display and headline levels

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** DESIGN.md section 5.1 specifies Manrope for display and headline levels. Currently, only Inter is loaded. Page titles and section headers lack the typographic contrast intended by the design system.
- **Why this matters now:** Low-risk, high-impact change affecting every page. Directly addresses a gap between implementation and DESIGN.md.
- **Scope notes:** Add Manrope via `next/font/google`. Apply to `.text-page-title` and optionally to other display-level elements. Keep Inter for body, labels, and dense data. Use `display: swap` and limit to weights 600/700.
- **Dependencies:** None.
- **Definition of done:** Manrope is loaded and applied to page titles. Typographic hierarchy is visibly stronger. Passes `npm run verify`.
- **Implementation note:** Font addition is isolated. Be mindful of slightly increased initial page load.
- **Source:** EX-REC-033.

### PB-064: Strengthen header component composition

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The header bar (`Header.tsx`) uses `border-b` for separation, conflicting with DESIGN.md No-Line Rule (section 4.1). The right side shows a redundant "CapPlan" label already visible in the sidebar. The header appears on every page and is below design target.
- **Why this matters now:** Quick win for design consistency. Removing the border and redundant label aligns with the No-Line Rule.
- **Scope notes:** Remove `border-bottom`, rely on tonal surface contrast. Remove redundant "CapPlan" label. Do not add complex breadcrumbs or new interactive elements in this pass.
- **Dependencies:** None.
- **Definition of done:** Header uses tonal separation instead of border. No redundant label. Passes `npm run verify`.
- **Implementation note:** Small change to `Header.tsx`.
- **Source:** EX-REC-035.

### PB-065: Replace DayCell leaveType .find() with Map-based lookup

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** `DayCell.tsx:68` uses `leaveTypes.find()` inside render. DayCell is rendered once per driver x date, running this lookup hundreds of times with the same array. The Map-based lookup pattern has been applied everywhere else (PB-060) but this spot was missed.
- **Why this matters now:** Completes the Map-based lookup pattern across the entire codebase. Small, safe change.
- **Scope notes:** Pass a pre-built `leaveTypeMap: Map<string, string>` as a prop instead of the full `leaveTypes` array, following the pattern from PB-060.
- **Dependencies:** None.
- **Definition of done:** DayCell uses Map-based lookup for leaveType. No `.find()` calls remain for lookups in render paths. Passes `npm run verify`.
- **Implementation note:** Follow the existing `skillMap` / `buildLookupMaps` pattern from PB-060.
- **Source:** DE-REC-033.

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

### PB-060: Replace linear .find() lookups with Map-based lookups
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced O(N×M) `.find()` lookups with O(1) Map-based lookups in `api-helpers.ts`, `PlanningGrid.tsx`, and `DriverList.tsx`. Added `buildLookupMaps` helper.

### PB-015: Connectivity hub — data model and import source API
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `ImportSource` model with full CRUD API at `/api/import-sources`. Validation and Dutch error messages.

### PB-018: Add foreign key existence checks before relation creation
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** FK existence validation on 10 routes. Invalid references return 400 with Dutch messages.

### PB-058: RosterAssigner driver name format consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Name format changed to "Achternaam, Voornaam" in RosterAssigner.

### PB-059: Capacity page control bar grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Period/zoom and compare controls grouped into contained toolbar sections.

### PB-055: Translate remaining English error messages across all API routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** ~70 English API error messages translated to Dutch across 24 route files.

### PB-056: Wrap find-then-update PUT routes in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** `prisma.$transaction` applied to employment, functions, and roster assignment PUT routes.

### PB-047: Capacity page status badge consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Status badges replaced with `status-chip-compact` + `status-dot` pattern.

### PB-040: RosterAssigner modal table styling
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Tonal row separators, alternating backgrounds, card surface wrapping.

### PB-057: RosterProfileEditor status dot indicators
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `status-dot` indicators to roster profile editor grid cells.

### PB-053: Add date validation to POST sub-record routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** `endDate >= startDate` validation on employment, functions, and roster assignment POST routes.

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
- **Scope notes:** Either call `cleanupOldEvents()` at the end of `withPerfLogging`, add a periodic cleanup, or remove the perf system if unused.
- **Source:** DE-REC-031.

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
