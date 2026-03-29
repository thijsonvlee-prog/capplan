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

### PB-004: Wrap roster assignment creation in a database transaction

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Completed (2026-03-29)
- **Summary:** Wrapped all 7 database operations in the roster assignment POST handler in `prisma.$transaction()`. The transaction client (`tx`) is passed to `autoCloseOpenRecords`, `getNextSequenceNumber`, and all subsequent Prisma calls. Partial failures now roll back cleanly. Single file change.
- **Implementation note:** Utility functions `autoCloseOpenRecords` and `getNextSequenceNumber` already accepted model delegates, so passing `tx.driverRosterAssignment` instead of `prisma.driverRosterAssignment` required no signature changes.

### PB-007: Add input validation to API route POST/PUT handlers

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Completed (2026-03-29)
- **Summary:** Added `validateRequired()` helper in `api-route-utils.ts` that checks for missing/empty required fields and returns Dutch-language error messages. Applied validation to 12 POST/PUT handlers across 10 route files: employment (POST/PUT), functions (POST/PUT), roster-assignments (POST/PUT), roster-profiles (POST/PUT), scenarios (POST), settings (PUT), skills (POST/PUT). Routes that already had validation (drivers POST, planning POST/bulk, settings POST, scenario duplicate POST) were left unchanged.
- **Implementation note:** Shared `validateRequired(body, fields)` helper returns first failing field's Dutch label + "is verplicht", or null if all valid. Consistent 400 response with `{ error: "..." }` shape.

## Blocked / Needs Decision

### PB-003: Consolidate driver status logic between planning grid and driver list

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Blocked
- **Problem / opportunity:** Driver active/inactive status is computed differently in the planning grid vs. the driver list page, leading to inconsistent counts.
- **Why this matters now:** Planners have reported confusion when driver counts differ between views.
- **Scope notes:** Unify status computation into a shared utility in `src/lib/`. Update both consumers.
- **Dependencies:** Needs Scrum Master decision on ESC-002 (which computation is authoritative).
- **Definition of done:** Single source of truth for driver status. Both views show identical counts. Passes `npm run verify`.
- **Implementation note:** Check `api-route-utils.ts` for existing status logic before creating new utilities.

## In Progress

_No items currently in progress._

## Completed Recently

### PB-008: Improve delete confirmation dialogs with specific context

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed (2026-03-29)
- **Summary:** Audited all delete dialogs. SubTable (used for employment, function, and roster sub-tables in driver editing) was the only component with generic text. Added `entityName` prop so each usage specifies what is being deleted (e.g., "het dienstverband vanaf 2026-01-01"). All other dialogs (StamtabelManager, SkillManager, RosterProfileEditor, RosterAssigner, ScenarioSelector) already had specific context.

### PB-006: Show loading spinners while settings page data loads

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed (2026-03-29)
- **Summary:** Added backward-compatible `useApiDataWithLoading` hook that returns `[data, loading]` tuple. Added optional `loading` prop to StamtabelManager. Settings page now shows spinners during initial data fetch; empty states only appear when data is genuinely empty.

### PB-005: Add inline validation feedback to driver creation form

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed (2026-03-29)
- **Summary:** Added `showValidation` pattern to DriverForm matching existing StamtabelManager/SkillManager/RosterProfileEditor pattern. Voornaam and achternaam fields show inline Dutch error messages and red border on validation failure. Errors clear as user types.

### PB-002: Add composite database indexes for planning grid queries

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Completed (2026-03-29)
- **Summary:** Added composite index on DriverRosterAssignment (driverId, startDate, endDate). PlanningEntry already had adequate composite indexes.

### PB-001: Improve empty state guidance across stamtabel managers

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed (2026-03-29)
- **Summary:** All four stamtabel managers now show actionable Dutch-language empty states via the shared StamtabelManager component.

### PB-000: Implement toast notifications for all CRUD operations

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed (2026-03-29)
- **Summary:** All create/update/delete flows now show Dutch-language toast notifications via the existing Toast component.

## Deferred

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness under real data volumes.
- **Scope notes:** Add composite index `@@index([scenarioId, date, status])` on PlanningEntry.
- **Source:** DE-REC-005.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor visual inconsistency. Can be done opportunistically alongside other settings page work.
- **Scope notes:** Migrate StamtabelManager form inputs to use the `input-field` CSS class for consistency with SkillManager.
- **Source:** EX-REC-003.

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
