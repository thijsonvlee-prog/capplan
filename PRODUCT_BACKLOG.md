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

---

## Ready for Next Cycle

### PB-011: Wrap remaining multi-step mutations in transactions

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Five API routes perform multiple sequential database operations without `$transaction`: driver update (PUT), roster profile update (PUT), scenario duplicate (POST), scenario delete (DELETE), and skill delete (DELETE). Partial failures can corrupt data — e.g., the driver update handler deletes all skill associations before recreating them, so a failure between delete and create loses all driver skills.
- **Why this matters now:** The pattern is established from PB-004 (roster assignment). These are the remaining unprotected multi-step mutations. The driver update handler is particularly risky.
- **Scope notes:** Wrap each handler's database operations in `prisma.$transaction()` following the roster assignment pattern. Five files, mechanical change. Keep each route self-contained.
- **Dependencies:** None.
- **Definition of done:** All five handlers use `$transaction`. Passes `npm run verify`. No behavioral changes beyond atomicity.
- **Implementation note:** Files: `src/app/api/drivers/[id]/route.ts` (PUT), `src/app/api/roster-profiles/[id]/route.ts` (PUT), `src/app/api/scenarios/[id]/duplicate/route.ts` (POST), `src/app/api/scenarios/[id]/route.ts` (DELETE), `src/app/api/settings/skills/[id]/route.ts` (DELETE).
- **Source:** DE-REC-006.

### PB-003: Consolidate driver status logic between planning grid and driver list

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Driver active/inactive status is computed differently in the planning grid vs. the driver list page, leading to inconsistent counts. ESC-002 has been decided: employment-based status (planning grid logic) is authoritative.
- **Why this matters now:** Planners see different driver counts depending on which screen they use. Decision is now made — employment-based status using active employment records with date overlap is the single source of truth.
- **Scope notes:** Create a shared utility in `src/lib/` for employment-based status computation. Update the driver list page to use it. The `isActive` field on Driver may become a derived/computed value. Do not remove the field from the schema yet — just stop using it as the primary status indicator in the driver list.
- **Dependencies:** None (ESC-002 decided).
- **Definition of done:** Single source of truth for driver status. Both views show identical counts. Passes `npm run verify`.
- **Implementation note:** Check `api-route-utils.ts` for existing status logic before creating new utilities. The planning grid already uses employment-based logic — extract and share it.
- **Source:** ESC-002 decision (Option A).

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Planned (Future Cycles)

### PB-014: Add visible required field indicators to forms

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** No form visually marks required fields before submission. Users must submit and encounter errors to learn which fields are mandatory.
- **Scope notes:** Add red asterisk (`*`) after required field labels using `text-danger-600`. Apply across DriverForm, StamtabelManager, SkillManager, RosterProfileEditor, ScenarioSelector, and sub-table forms.
- **Dependencies:** None.
- **Definition of done:** All required fields have visual indicators. Passes `npm run verify`.
- **Source:** EX-REC-006.

### PB-015: Connectivity hub — data model and import source API

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** CapPlan operates standalone. The Scrum Master wants a connectivity hub for external data sources (SMI-001). ESC-001 decided: Option A — Configuration-first MVP (CSV only, field mapping UI, no scheduled execution).
- **Why this matters now:** First phase of the connectivity hub. Must establish the data model before the UI can be built.
- **Scope notes:** Design and implement Prisma schema additions for import source configuration (source name, file type, field mappings). Create API routes for CRUD operations on import sources. No UI in this item. No import execution logic.
- **Dependencies:** None.
- **Definition of done:** Prisma migration for import source tables. API routes for CRUD. Passes `npm run verify`.
- **Implementation note:** Keep schema minimal: ImportSource (id, name, type=CSV, fieldMappings as JSON, createdAt, updatedAt). Migration required.
- **Source:** ESC-001 decision (Option A), SMI-001.

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen to create, edit, and delete CSV import sources with field mapping.
- **Scope notes:** New page in the application for configuring import sources. Follow existing patterns (StamtabelManager-style CRUD). Field mapping UI to map CSV columns to CapPlan entity fields. Dutch-language UI throughout.
- **Dependencies:** PB-015 (data model and API must exist first).
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

### PB-017: Sanitize error logging in API catch blocks

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** All API route catch blocks log the full error object. Prisma errors can contain connection strings and SQL details in server logs.
- **Scope notes:** Log only `error.message` (or "Unknown error") in catch blocks. Optionally log `error.code` for Prisma errors. Mechanical change across ~20 route files.
- **Dependencies:** None.
- **Definition of done:** No full error objects logged. Only message + code. Passes `npm run verify`.
- **Source:** DE-REC-007.

---

## Completed Recently

### PB-012: Make toast notifications accessible to screen readers
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `role="status"` and `aria-live="polite"` to the toast container in `Toast.tsx`. Screen readers now announce toast messages.

### PB-013: Extend loading state pattern to SkillManager and RosterProfileEditor
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced `useApiData` with `useApiDataWithLoading` in both components. Added spinner during initial load, guarded list and empty state rendering behind `!loading`. Matches StamtabelManager pattern.

### PB-004: Wrap roster assignment creation in a database transaction
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped all 7 database operations in the roster assignment POST handler in `prisma.$transaction()`.

### PB-007: Add input validation to API route POST/PUT handlers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `validateRequired()` helper and applied validation to 12 POST/PUT handlers across 10 route files.

### PB-008: Improve delete confirmation dialogs with specific context
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `entityName` prop to SubTable for contextual delete confirmation text.

### PB-006: Show loading spinners while settings page data loads
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `useApiDataWithLoading` hook and loading spinners to StamtabelManager.

### PB-005: Add inline validation feedback to driver creation form
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `showValidation` pattern to DriverForm with inline Dutch error messages.

### PB-002: Add composite database indexes for planning grid queries
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added composite index on DriverRosterAssignment (driverId, startDate, endDate).

### PB-001: Improve empty state guidance across stamtabel managers
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** All four stamtabel managers show actionable Dutch-language empty states.

### PB-000: Implement toast notifications for all CRUD operations
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** All create/update/delete flows show Dutch-language toast notifications.

---

## Deferred

### PB-018: Add foreign key existence checks before relation creation

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Depends on PB-011 (transaction wrapping) being completed first so validation + creation are atomic. Schedule after PB-011.
- **Source:** DE-REC-008.

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness under real data volumes.
- **Source:** DE-REC-005.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor visual inconsistency. Can be done opportunistically alongside other settings page work.
- **Source:** EX-REC-003.

### PB-019: Add semantic dialog attributes to modal overlays

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Low effort but lower priority than toast accessibility (PB-012). Schedule after PB-012.
- **Source:** EX-REC-008.

### PB-020: Replace window.confirm with custom confirmation component

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `window.confirm` works. This is the most visible UX inconsistency but requires a new component + 6 migration points. Schedule when higher-priority work is done.
- **Source:** EX-REC-009.

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
