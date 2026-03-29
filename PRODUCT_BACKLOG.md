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
- **Status:** Ready
- **Problem / opportunity:** The POST `/api/drivers/[id]/roster-assignments` endpoint performs 4-5 sequential database operations without a `$transaction` wrapper. If any step fails mid-way, the database is left in an inconsistent state with partial roster data.
- **Why this matters now:** This is the highest-impact multi-step mutation in the app (generates up to 364 planning entries). The fix is straightforward and the risk of data corruption grows with usage.
- **Scope notes:** Wrap all database operations in the POST handler in `prisma.$transaction()`. No behavior change on success path.
- **Dependencies:** None.
- **Definition of done:** All database operations in the roster assignment POST handler are wrapped in an interactive transaction. Partial failures roll back cleanly. Passes `npm run verify`.
- **Implementation note:** All existing operations are compatible with interactive transactions. Single file change. Source: DE-REC-003.

### PB-005: Add inline validation feedback to driver creation form

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** When a user submits the driver creation form with missing required fields, no inline error messages appear. The form silently fails or shows a generic error.
- **Why this matters now:** Driver creation is a core daily workflow. Missing validation creates frustration for new planners. The `showValidation` pattern already exists in StamtabelManager and SkillManager.
- **Scope notes:** Add field-level validation messages (in Dutch) that appear when the user leaves a required field empty. Use the existing `showValidation` pattern.
- **Dependencies:** None.
- **Definition of done:** All required fields on the driver creation form show inline Dutch-language error messages on validation failure. Passes `npm run verify`.
- **Implementation note:** Follow the existing `showValidation` pattern in StamtabelManager and SkillManager. Source: EX-REC-001.

### PB-006: Show loading spinners while settings page data loads

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** When the settings page loads, each stamtabel section briefly shows "Nog geen [type] toegevoegd" before data arrives, causing a misleading flash of empty state.
- **Why this matters now:** The improved empty states from PB-001 make this flash more noticeable. Worth addressing to prevent user confusion.
- **Scope notes:** Add a loading state using the `.spinner` CSS class that displays while `useApiData` is fetching. Show the empty state only after loading completes and records are genuinely empty.
- **Dependencies:** May need changes to the `useApiData` hook to expose loading state — must be backward-compatible.
- **Definition of done:** Settings page shows loading spinners during data fetch. Empty state text only appears when data has loaded and is genuinely empty. Passes `npm run verify`.
- **Implementation note:** Check whether `useApiData` already exposes a loading state before adding one. Source: EX-REC-004.

### PB-007: Add input validation to API route POST/PUT handlers

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Several API routes accept POST/PUT bodies without validating required fields. Missing fields result in cryptic Prisma constraint errors rather than clear user-facing messages.
- **Why this matters now:** Security hygiene and UX quality item. Low risk, broad defensive value. Aligns with CLAUDE.md input sanitization guidelines.
- **Scope notes:** Add validation checks at the top of each POST/PUT handler for required fields. Return `{ error: "..." }` with status 400 and a Dutch-language message. Use a shared helper in `api-route-utils.ts`.
- **Dependencies:** None.
- **Definition of done:** All POST/PUT API routes validate required fields and return clear Dutch-language error messages for missing/invalid input. No Prisma constraint errors leak to the frontend. Passes `npm run verify`.
- **Implementation note:** Touches ~10 route files. Add a shared validation helper in `api-route-utils.ts`. Source: DE-REC-004.

### PB-008: Improve delete confirmation dialogs with specific context

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Some delete confirmation dialogs use generic text like "Weet u het zeker?" without specifying what will be deleted.
- **Why this matters now:** Low-effort, high-trust improvement. StamtabelManager and SkillManager already do this correctly — other screens need to be audited and updated.
- **Scope notes:** Audit all delete dialogs outside StamtabelManager/SkillManager. Update them to include the name/description of the item being deleted (e.g., "Chauffeur Jan de Vries verwijderen?").
- **Dependencies:** None.
- **Definition of done:** All delete confirmation dialogs across the app show the specific item name/description. All text in Dutch. Passes `npm run verify`.
- **Implementation note:** Source: EX-REC-002.

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
