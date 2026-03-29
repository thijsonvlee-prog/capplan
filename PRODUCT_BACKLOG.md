# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

## Ready for Next Cycle

_No items currently ready._

## Blocked / Needs Decision

### PB-003: Consolidate driver status logic between planning grid and driver list

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Blocked
- **Problem / opportunity:** Driver active/inactive status is computed differently in the planning grid vs. the driver list page, leading to inconsistent counts.
- **Why this matters now:** Planners have reported confusion when driver counts differ between views.
- **Scope notes:** Unify status computation into a shared utility in `src/lib/`. Update both consumers.
- **Dependencies:** Needs Scrum Master decision on which computation is the correct one (see ESC-001).
- **Definition of done:** Single source of truth for driver status. Both views show identical counts. Passes `npm run verify`.
- **Implementation note:** Check `api-route-utils.ts` for existing status logic before creating new utilities.

## In Progress

_No items currently in progress._

## Completed Recently

### PB-002: Add composite database indexes for planning grid queries

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Completed
- **Problem / opportunity:** Planning grid loads slow down as driver count grows because key queries lack composite indexes.
- **Why this matters now:** Completed — DriverRosterAssignment now has a composite index on (driverId, startDate, endDate). PlanningEntry already had composite indexes from a prior migration.
- **Scope notes:** Added composite index on DriverRosterAssignment (driverId, startDate, endDate). PlanningEntry (driverId, date) was already covered by the existing (driverId, date, scenarioId) composite index.
- **Dependencies:** None.
- **Definition of done:** Migration created (`20260329000000_add_roster_assignment_composite_index`). Passes `npm run verify`.
- **Implementation note:** PlanningEntry already had composite indexes `[driverId, date, scenarioId]` and `[scenarioId, date]` from migration `20260328120000`. Only the DriverRosterAssignment index was missing.

### PB-001: Improve empty state guidance across stamtabel managers

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Problem / opportunity:** Stamtabel screens showed minimal empty states without guidance on what the user should do next.
- **Why this matters now:** Completed — all four stamtabel managers now show actionable empty states.
- **Scope notes:** Updated the shared StamtabelManager component.
- **Dependencies:** None.
- **Definition of done:** All four stamtabel managers show actionable Dutch-language empty states with a prompt to add the first item. Passes `npm run verify`.
- **Implementation note:** Modified the shared StamtabelManager component — single change propagates to all four stamtabel types.

### PB-000: Implement toast notifications for all CRUD operations

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Problem / opportunity:** Users received no feedback after saving, updating, or deleting records in several screens.
- **Why this matters now:** Completed — users now see confirmation toasts for all mutations.
- **Scope notes:** Added `showToast()` calls to all create/update/delete flows.
- **Dependencies:** None.
- **Definition of done:** Every mutation shows a Dutch-language toast notification. Verified across all screens.
- **Implementation note:** Used the existing Toast component from `src/components/ui/Toast.tsx`.

## Deferred

_No deferred items._

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
