# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major redesign work is complete. API validation is fully hardened including FK existence checks. ESLint is clean (0 warnings). All API error messages are in Dutch. All sub-record PUT routes use transactions. The active backlog now focuses on: (1) small UX consistency fixes, and (2) connectivity hub (PB-015/016) when higher-priority work is done.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items ready for next cycle._

---

## Planned (Future Cycles)

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

### PB-018: Add foreign key existence checks before relation creation
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `validateForeignKeys` and `validateOptionalForeignKey` helpers to `api-route-utils.ts`. Applied FK existence validation to 10 routes: driver POST (all nested FKs) and PUT (skillIds), employment POST/PUT (employerId), function POST/PUT (locationId, departmentId), roster-assignment POST/PUT (rosterProfileId), planning POST and bulk POST (leaveTypeId). Invalid references now return 400 with a Dutch error message instead of causing 500 FK constraint errors.

### PB-058: RosterAssigner driver name format consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Changed the name format passed to RosterAssigner from "Voornaam Achternaam" to "Achternaam, Voornaam", matching the convention used in the drivers table and planning grid.

### PB-059: Capacity page control bar grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Grouped period/zoom controls and compare controls into contained toolbar sections with `bg-surface-tertiary` backgrounds, tonal dividers, and structured spacing. Compare buttons use elevated pill style with shadow.

### PB-055: Translate remaining English error messages across all API routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Translated ~70 English API response error messages to Dutch across 24 route files.

### PB-056: Wrap find-then-update PUT routes in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped findFirst + update in `prisma.$transaction` in employment, functions, and roster assignment PUT routes.

### PB-047: Capacity page status badge consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced basic inline status badges with `status-chip-compact` + `status-dot` pattern. Tonal separators, alternating rows.

### PB-040: RosterAssigner modal table styling
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Tonal row separators, alternating backgrounds, card surface wrapping. Active records use `bg-success-50`.

### PB-057: RosterProfileEditor status dot indicators
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `status-dot` indicators to roster profile editor grid cells, matching the planning grid pattern.

### PB-053: Add date validation to POST sub-record routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `endDate >= startDate` validation to POST routes for employment, functions, and roster assignments.

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
- **Reason:** Low user impact. Includes both chart colors (DE-REC-014) and API magic numbers (DE-REC-030). Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

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
