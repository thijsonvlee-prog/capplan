# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All three planning grid redesign phases and DayCell popup redesign are complete. Styled date input wrapper is deployed. Settings page (PB-041) now uses tab-based navigation with stronger hierarchy. Input styling standardized (PB-010). Focus shifts to: (1) fixing the planning upsert race condition (PB-043), (2) small quality/safety improvements to API routes, and (3) remaining design gaps (RosterAssigner modal PB-040, capacity page badges). The connectivity hub (PB-015/016) remains planned for a future cycle.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-043: Fix TOCTOU race condition in POST /api/planning upsert

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** `POST /api/planning` does a `findFirst` then either `update` or `create` without a transaction. Concurrent requests for the same `(driverId, date, scenarioId)` can both find no existing record and both attempt `create`, causing a unique-constraint violation (500 error). The schema also lacks a `@@unique([driverId, date, scenarioId])` constraint.
- **Why this matters now:** This is a real data integrity risk. Multi-user scenarios or fast double-clicks can trigger it. Highest-priority technical issue.
- **Scope notes:** Add `@@unique([driverId, date, scenarioId])` to `PlanningEntry` in the Prisma schema. Replace the `findFirst`+`create`/`update` pattern with Prisma `upsert` using the composite key. Requires a migration. Verify no duplicate rows exist before adding the constraint.
- **Dependencies:** None.
- **Definition of done:** Migration applied. `POST /api/planning` uses `upsert`. No duplicate rows possible. Passes `npm run verify`.
- **Implementation note:** Check for existing duplicate `(driverId, date, scenarioId)` rows before migration. If duplicates exist, deduplicate first.
- **Source:** DE-REC-016.

### PB-041: Settings page layout composition

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Completed:** 2026-03-29
- **Problem / opportunity:** The settings page (stamtabellen) is functional but uses a generic list-of-cards layout without strong grouping, hierarchy, or visual rhythm. It reads as a standard admin panel rather than a designed product screen.
- **Implementation note:** Replaced flat vertical scroll layout with tab-based navigation (Stamgegevens / Competenties / Roosters). Each tab has a section header with title and contextual description. Stamgegevens tab shows a count badge. Layout widened from `max-w-2xl` to `max-w-3xl`. New CSS classes added to `globals.css` for tabs, tab badges, and section intros. Page subtitle made more concise. Also fixed PB-010 in the same pass.
- **Source:** EX-REC-020.

### PB-044: Add date range guard to GET /api/planning

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `GET /api/planning` returns all planning entries for a scenario when no `dates` parameter is provided. With growing data, this can return the entire table with no LIMIT, causing potential OOM or timeouts on serverless.
- **Why this matters now:** Cheap safety guard against a latent scalability issue. All current callers pass dates, but the API itself is unguarded.
- **Scope notes:** Require `dates` or `driverId` parameter. Return 400 with Dutch error message if neither is provided. Verify all frontend callers pass the required parameters.
- **Dependencies:** None.
- **Definition of done:** GET /api/planning returns 400 when called without `dates` or `driverId`. Existing callers unaffected. Passes `npm run verify`.
- **Source:** DE-REC-017.

### PB-045: Memoize filteredDrivers in PlanningGrid

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `filteredDrivers` in `PlanningGrid.tsx` is an inline `.filter()` that creates a new array reference on every render. The downstream `sortedDrivers` useMemo depends on it, causing unnecessary re-computation. This is also the root cause of one of the two pre-existing ESLint warnings.
- **Why this matters now:** Addresses a real performance gap in the most complex component and fixes an ESLint warning.
- **Scope notes:** Wrap `filteredDrivers` in `useMemo` with `[localData, filter]` as deps. Handle with extreme care — PlanningGrid is sensitive.
- **Dependencies:** None.
- **Definition of done:** `filteredDrivers` wrapped in `useMemo`. ESLint warning resolved. No behavioral regression. Passes `npm run verify`.
- **Implementation note:** PlanningGrid.tsx is ~650 lines and the most complex component. Test carefully after change.
- **Source:** DE-REC-022.

### PB-046: Remove dead code batch (patchBody, isDriverActiveByEmployment, misleading userId params, redundant cascade deletes)

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** Several small dead code / misleading code items identified:
  1. `patchBody()` in `api.ts` — no PATCH endpoints exist, zero callers.
  2. `isDriverActiveByEmployment` in `api-helpers.ts` — exported but zero callers, logic duplicated in `transformDriver`.
  3. `userId` parameter in `preferences.get()` and `preferences.set()` — server ignores it (hardcoded to "default"), creates false impression of multi-user support.
  4. Redundant `deleteMany` before cascade-covered deletes in driver and skill deletion routes.
- **Why this matters now:** Quick batch cleanup. Each item is small, together they meaningfully reduce dead/misleading code.
- **Scope notes:** Delete `patchBody`. Delete `isDriverActiveByEmployment`. Remove `userId` param from preferences methods (verify callers). Remove redundant `deleteMany` calls (verify cascade is correctly defined in schema first).
- **Dependencies:** None.
- **Definition of done:** All four items removed. No callers broken. Passes `npm run verify`.
- **Source:** DE-REC-018, DE-REC-019, DE-REC-020, DE-REC-021.

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
