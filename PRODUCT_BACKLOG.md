# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Planning grid redesign (3 phases), DayCell popup, styled date input, settings page tab navigation, and drivers page composition are all complete. Input styling standardized. Race condition, API guard, performance memoization, dead code cleanup, ESLint fix, date validation, and scenario guard all done. Focus shifts to: (1) smaller UX consistency items (capacity badges PB-047, RosterAssigner table PB-040), and (2) connectivity hub (PB-015/016) when capacity allows. See `RECOMMENDATIONS_DELIVERY.md` for new technical improvement proposals.

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

### PB-049: Fix handleDragEnd stale closure in PlanningGrid useEffect
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped `handleDragEnd` in `useCallback` with `[dragState]` dependency and added it to the useEffect dependency array. Eliminates the last ESLint `react-hooks/exhaustive-deps` warning. Codebase now has 0 ESLint warnings. Passes `npm run verify`.

### PB-050: Add date logic validation to sub-record PUT routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `endDate >= startDate` validation to PUT routes for employment, functions, and roster assignments. Returns 400 with Dutch error message ("Einddatum mag niet voor de startdatum liggen") if `endDate` is before `startDate`. Passes `npm run verify`.

### PB-051: Validate source scenario exists before duplication
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `findUnique` check before duplicating a scenario. Returns 404 with Dutch error message ("Bronscenario niet gevonden") if the source scenario ID is invalid. Skips check for default scenario (which has no DB record). Passes `npm run verify`.

### PB-048: Drivers page header and layout composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Redesigned drivers page composition: added contextual subtitle, improved header hierarchy, introduced view-mode state management (list/create/edit) so table hides during editing, applied tonal row alternation and tonal separators to the drivers table, improved name display to "Achternaam, Voornaam" format matching the planning grid, added form section headers with descriptions for create/edit states, improved empty state spacing, better aria-labels. Added `.drivers-form-header` CSS class. No functional changes to data flow.

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
