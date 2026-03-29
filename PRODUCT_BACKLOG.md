# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major redesign work, API validation hardening, and performance optimizations are complete. ESLint is clean (0 warnings). The connectivity hub data model and API (PB-015) are shipped; the next phase is the admin UI (PB-016, Experience Agent). The active backlog is empty — new work should come from recommendations or the Scrum Master.

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

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen for CSV import source configuration with field mapping.
- **Dependencies:** PB-015.
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Follows existing design token system and component patterns. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-060: Replace linear .find() lookups with Map-based lookups
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced O(N×M) `.find()` lookups with O(1) Map-based lookups in `api-helpers.ts` (`groupDrivers`, `getComputedFields`) and `PlanningGrid.tsx` (`resolveColumnValue`). Added `buildLookupMaps` helper for pre-building Maps from stamtabel arrays. `DriverList.tsx` now pre-builds maps once before iterating drivers. Follows existing `skillMap` pattern.

### PB-015: Connectivity hub — data model and import source API
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `ImportSource` model to Prisma schema (id, name, type=CSV, targetEntity, fieldMappings as JSONB, description, timestamps). Created migration. Implemented full CRUD API at `/api/import-sources` and `/api/import-sources/[id]` with validation (required fields, valid target entities, CSV-only type constraint, object shape for fieldMappings) and Dutch error messages.

### PB-018: Add foreign key existence checks before relation creation
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `validateForeignKeys` and `validateOptionalForeignKey` helpers. Applied FK existence validation to 10 routes. Invalid references now return 400 with Dutch error messages.

### PB-058: RosterAssigner driver name format consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Changed name format in RosterAssigner to "Achternaam, Voornaam", matching drivers table and planning grid.

### PB-059: Capacity page control bar grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Grouped period/zoom and compare controls into contained toolbar sections with tonal backgrounds and dividers.

### PB-055: Translate remaining English error messages across all API routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Translated ~70 English API error messages to Dutch across 24 route files.

### PB-056: Wrap find-then-update PUT routes in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped findFirst + update in `prisma.$transaction` in employment, functions, and roster assignment PUT routes.

### PB-047: Capacity page status badge consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Status badges replaced with `status-chip-compact` + `status-dot` pattern.

### PB-040: RosterAssigner modal table styling
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Tonal row separators, alternating backgrounds, card surface wrapping.

### PB-057: RosterProfileEditor status dot indicators
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `status-dot` indicators to roster profile editor grid cells.

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
- **Reason:** Low user impact. Includes API magic numbers (DE-REC-030) and chart colors (DE-REC-014). Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `cleanupOldEvents()` in `perf.ts` is defined but never called. Table grows unbounded, but traffic is low. Low urgency.
- **Scope notes:** Either call `cleanupOldEvents()` at the end of `withPerfLogging`, add a periodic cleanup, or remove the perf system if unused.
- **Source:** DE-REC-031.

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
