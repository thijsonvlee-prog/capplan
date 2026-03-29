# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Planning grid redesign (3 phases), DayCell popup, styled date input, and settings page tab navigation are all complete. Input styling standardized. Race condition, API guard, performance memoization, and dead code cleanup done. Focus shifts to: (1) drivers page composition (PB-048) as the next major UX deliverable per SMI-004, (2) remaining small technical improvements (ESLint fix, date validation), and (3) connectivity hub (PB-015/016) when capacity allows.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-048: Drivers page header and layout composition

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** The drivers page has not been reviewed against DESIGN.md standards. With planning grid, settings page, and DayCell popup all redesigned, the drivers page is the next most visible screen and the consistency gap is increasingly noticeable. SMI-004 calls for bigger design steps.
- **Why this matters now:** Aligns with SMI-004 direction. Users navigating between planning, settings, and drivers should feel the same design standard. The drivers page is a core workflow screen.
- **Scope notes:** Review the drivers page header, filter grouping, table layout, and overall composition against DESIGN.md sections 2.5, 7.1, 7.2. Apply tab or surface grouping patterns if needed. Follow the same pattern as the settings page redesign.
- **Dependencies:** None.
- **Definition of done:** Drivers page uses composed layout with proper hierarchy, consistent with planning grid and settings page design quality. Passes `npm run verify`.
- **Implementation note:** Evaluate whether tabs, section headers, or surface grouping best fits this screen's content. Do not over-engineer — the goal is compositional quality, not feature additions.
- **Source:** EX-REC-022.

### PB-049: Fix handleDragEnd stale closure in PlanningGrid useEffect

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The `useEffect` in `PlanningGrid.tsx` references `handleDragEnd` without including it in the dependency array. This causes a stale closure and triggers the last remaining ESLint `react-hooks/exhaustive-deps` warning.
- **Why this matters now:** It's the last ESLint warning in the codebase. The fix is small and well-scoped.
- **Scope notes:** Wrap `handleDragEnd` in `useCallback` with `[dragState]` deps, then include it in the useEffect dependency array. Verify drag interaction still works correctly.
- **Dependencies:** None.
- **Definition of done:** ESLint warning eliminated. Drag interactions work correctly. Passes `npm run verify` with 0 warnings.
- **Implementation note:** PlanningGrid is the most complex component — verify carefully. Test drag behavior after the change.
- **Source:** DE-REC-023.

### PB-050: Add date logic validation to sub-record PUT routes

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The PUT routes for employment, functions, and roster assignments accept date fields without validating that `endDate >= startDate`. Invalid date ranges are accepted silently.
- **Why this matters now:** Simple defensive validation at system boundary, per CLAUDE.md guidelines. Prevents invalid data.
- **Scope notes:** Add validation guard to 3 PUT routes: `/api/drivers/[id]/employment/[recordId]`, `/api/drivers/[id]/functions/[recordId]`, `/api/drivers/[id]/roster-assignments/[recordId]`. Return 400 with Dutch error message if `endDate` is before `startDate`.
- **Dependencies:** None.
- **Definition of done:** All 3 PUT routes validate date ranges. Dutch error messages on failure. Passes `npm run verify`.
- **Source:** DE-REC-024.

### PB-051: Validate source scenario exists before duplication

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** `POST /api/scenarios/[id]/duplicate` doesn't verify the source scenario exists. If called with an invalid ID, it silently creates an empty scenario.
- **Why this matters now:** Quick safety fix. Low effort.
- **Scope notes:** Add `findUnique` check at start of transaction. Return 404 with Dutch error message if not found.
- **Dependencies:** None.
- **Definition of done:** Invalid scenario ID returns 404. Passes `npm run verify`.
- **Source:** DE-REC-025.

---

## Planned (Future Cycles)

### PB-047: Capacity page status badge consistency

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The capacity page uses basic status badges without dot indicators. The planning grid uses the refined `status-chip-compact` pattern, making the capacity page feel visually dated.
- **Scope notes:** Apply `status-chip-compact` + `status-dot` pattern from the planning grid to capacity table status badges.
- **Dependencies:** None.
- **Definition of done:** Capacity page uses the same status chip pattern as the planning grid. Passes `npm run verify`.
- **Source:** EX-REC-021.

### PB-040: RosterAssigner modal table styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The RosterAssigner modal table uses dense cell borders, conflicting with DESIGN.md and visually inconsistent with the planning grid.
- **Scope notes:** Apply tonal separator approach: remove cell borders, use subtle row separators, keep header bottom edge.
- **Dependencies:** None.
- **Definition of done:** RosterAssigner table uses tonal separators. Passes `npm run verify`.
- **Source:** EX-REC-018.

### PB-015: Connectivity hub — data model and import source API

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** First phase of the connectivity hub MVP (ESC-001 decision: CSV-only, field mapping UI, no scheduled execution).
- **Scope notes:** Design and implement Prisma schema additions for import source configuration. Create API routes for CRUD. No UI, no import execution logic.
- **Dependencies:** None.
- **Definition of done:** Prisma migration for import source tables. API routes for CRUD. Passes `npm run verify`.
- **Implementation note:** Keep schema minimal: ImportSource (id, name, type=CSV, fieldMappings as JSON, createdAt, updatedAt).
- **Source:** ESC-001 decision (Option A), SMI-001.

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen for CSV import source configuration with field mapping.
- **Dependencies:** PB-015.
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-041: Settings page layout composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced flat vertical scroll layout with tab-based navigation (Stamgegevens / Competenties / Roosters). Each tab has section header with title and contextual description. Count badge on Stamgegevens tab. Layout widened. Also fixed PB-010 (input styling).

### PB-043: Fix TOCTOU race condition in POST /api/planning upsert
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `@@unique([driverId, date, scenarioId])` constraint with deduplication migration. Replaced findFirst+create/update with transactional upsert in both single and bulk endpoints.

### PB-044: Add date range guard to GET /api/planning
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Returns 400 if neither `dates` nor `driverId` parameter is provided.

### PB-045: Memoize filteredDrivers in PlanningGrid
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped `filteredDrivers` in `useMemo`. Reduced ESLint warnings from 2 to 1.

### PB-046: Remove dead code batch
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed unused `patchBody`, `isDriverActiveByEmployment`, misleading `userId` param, and redundant cascade-covered deletes.

---

## Deferred

### PB-018: Add foreign key existence checks before relation creation

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Medium effort — touches several routes. Schedule when capacity allows after higher-priority items.
- **Source:** DE-REC-008.

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness.
- **Source:** DE-REC-005.

### PB-030: Move hardcoded comparison chart colors to constants

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** CLAUDE.md compliance fix but low user impact. Schedule when capacity allows.
- **Source:** DE-REC-014.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active execution sections.
- Stale or superseded items should be removed or deferred.
- Overlapping items should be merged.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
