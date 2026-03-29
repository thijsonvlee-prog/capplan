# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All three planning grid redesign phases and DayCell popup redesign are complete. Styled date input wrapper is deployed. Settings page (PB-041) now uses tab-based navigation with stronger hierarchy. Input styling standardized (PB-010). Planning upsert race condition fixed (PB-043). API safety guard added (PB-044). PlanningGrid performance improved (PB-045). Dead code batch removed (PB-046). Focus shifts to: (1) remaining design gaps (RosterAssigner modal PB-040, capacity page badges), (2) connectivity hub (PB-015/016), and (3) deferred technical items.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-041: Settings page layout composition

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Completed:** 2026-03-29
- **Problem / opportunity:** The settings page (stamtabellen) is functional but uses a generic list-of-cards layout without strong grouping, hierarchy, or visual rhythm. It reads as a standard admin panel rather than a designed product screen.
- **Implementation note:** Replaced flat vertical scroll layout with tab-based navigation (Stamgegevens / Competenties / Roosters). Each tab has a section header with title and contextual description. Stamgegevens tab shows a count badge. Layout widened from `max-w-2xl` to `max-w-3xl`. New CSS classes added to `globals.css` for tabs, tab badges, and section intros. Page subtitle made more concise. Also fixed PB-010 in the same pass.
- **Source:** EX-REC-020.

---

## Planned (Future Cycles)

### PB-047: Capacity page status badge consistency

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The capacity page (`CapacityTable.tsx`) uses basic `px-2 py-0.5 rounded` status badges without dot indicators. Now that the planning grid uses the refined `status-chip-compact` pattern, the capacity page feels visually dated.
- **Why this matters now:** Small effort, high consistency impact. Users who switch between planning and capacity views will see inconsistent status styling.
- **Scope notes:** Apply the same `status-chip-compact` + `status-dot` pattern from the planning grid to capacity table status badges.
- **Dependencies:** None.
- **Definition of done:** Capacity page uses the same status chip pattern as the planning grid. Passes `npm run verify`.
- **Source:** EX-REC-021.

### PB-040: RosterAssigner modal table styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The RosterAssigner modal table uses dense `border border-border-default` on every cell, conflicting with DESIGN.md section 4.1 and visually inconsistent with the updated planning grid.
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

### PB-043: Fix TOCTOU race condition in POST /api/planning upsert
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `@@unique([driverId, date, scenarioId])` constraint to PlanningEntry with a migration that deduplicates existing rows first. Replaced findFirst+create/update with transactional upsert pattern in both `POST /api/planning` and `POST /api/planning/bulk`. Added partial unique index for NULL scenarioId (base scenario).

### PB-044: Add date range guard to GET /api/planning
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** GET /api/planning now returns 400 if neither `dates` nor `driverId` parameter is provided. Dutch error message. All existing callers unaffected.

### PB-045: Memoize filteredDrivers in PlanningGrid
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped `filteredDrivers` in `useMemo` with `[localData, filter]` deps. Eliminates unnecessary re-computation of `sortedDrivers` on every render. Reduced ESLint warnings from 2 to 1 (the remaining one is `handleDragEnd` in useEffect).

### PB-046: Remove dead code batch
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed `patchBody()` from `api.ts`, `isDriverActiveByEmployment` from `api-helpers.ts`, misleading `userId` param from `preferences.get/set`, and redundant `deleteMany` calls before cascade-covered deletes in driver and skill deletion routes.

### PB-042: Remove dead preferences API methods from api.ts
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed unused `getAll()` and `remove()` methods from `preferences` namespace in `api.ts`.

### PB-039: Styled date input wrapper component
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Created `DateInput` component with styled container, calendar icon trigger, and design-token CSS. Replaced all 4 date inputs across RosterAssigner and DriverForm.

### PB-035: Planning grid Phase 3 — cell rendering and status refinement
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Compact cells use dot-indicator + letter chip pattern. Empty cells show subtle midpoint dot. Aggregated view uses same chip pattern. All three phases of the planning grid redesign (ESC-003) are now complete.

---

## Deferred

### PB-018: Add foreign key existence checks before relation creation

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Medium effort — touches several routes. Schedule when capacity allows after higher-priority items.
- **Source:** DE-REC-008.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Completed
- **Completed:** 2026-03-29
- **Implementation note:** Addressed as part of PB-041. StamtabelManager add-form inputs now use the `input-field` CSS class and the add button uses `btn-primary`, matching SkillManager and RosterProfileEditor patterns.
- **Source:** EX-REC-003.

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
