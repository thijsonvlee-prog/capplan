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

### PB-001: Improve empty state guidance across stamtabel managers

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Several stamtabel screens show minimal empty states ("Geen gegevens") without guidance on what the user should do next.
- **Why this matters now:** New users encounter these screens during onboarding and get stuck without clear next steps.
- **Scope notes:** Update empty states in werkgevers, afdelingen, locaties, and verloftypes managers. Use the existing StamtabelManager component pattern.
- **Dependencies:** None.
- **Definition of done:** All four stamtabel managers show actionable Dutch-language empty states with a prompt to add the first item. Passes `npm run verify`.
- **Implementation note:** Modify the shared StamtabelManager component if possible; otherwise update each instance individually.

### PB-002: Add composite database indexes for planning grid queries

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Planning grid loads slow down as driver count grows because key queries lack composite indexes.
- **Why this matters now:** Users with 50+ drivers report noticeable delays when switching periods.
- **Scope notes:** Add indexes on PlanningEntry (driverId, date) and RosterAssignment (driverId, startDate, endDate). Create a Prisma migration.
- **Dependencies:** None.
- **Definition of done:** Migration created and tested. Query performance improved (verified with EXPLAIN ANALYZE). Passes `npm run verify`.
- **Implementation note:** Use `npx prisma migrate dev --name add-planning-indexes`. Batch index creation in a single migration.

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
