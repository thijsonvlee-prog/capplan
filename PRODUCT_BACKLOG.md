# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major redesign work is complete. API validation is hardened. ESLint is clean (0 warnings). Focus now shifts to: (1) CLAUDE.md compliance — translating remaining English API error messages (PB-055), (2) data consistency — transaction wrapping on PUT routes (PB-056), (3) remaining visual consistency gaps (PB-047, PB-040), and (4) connectivity hub (PB-015/016) when capacity allows.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-055: Translate remaining English error messages across all API routes

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** ~24 English error messages remain across API routes after PB-054 fixed the settings routes. Messages like "Record not found", "Driver not found", "code is required", "firstName is required", "Maximum 90 dates allowed per request" violate CLAUDE.md's requirement that all user-facing text is Dutch.
- **Scope notes:** Audit all API routes in `src/app/api/`. Translate every English error message to Dutch. Standardize patterns: "niet gevonden" for 404s, "is verplicht" for required fields, "Maximaal X per verzoek" for limits.
- **Dependencies:** None.
- **Definition of done:** Zero English error messages in API routes. Consistent Dutch error patterns. Passes `npm run verify`.
- **Implementation note:** String-only changes, no logic modification. ~12 files affected.
- **Source:** DE-REC-028.

### PB-056: Wrap find-then-update PUT routes in transactions

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The PUT routes for employment, functions, and roster assignments each do a `findFirst` followed by a separate `update` without a transaction. Race conditions on concurrent edits are possible. POST routes already use transactions.
- **Scope notes:** Wrap the find + update in `prisma.$transaction` in all 3 sub-record PUT routes.
- **Dependencies:** None.
- **Definition of done:** All 3 PUT routes use `prisma.$transaction`. Passes `npm run verify`.
- **Implementation note:** Small change — wrap existing code blocks. Same pattern as POST routes.
- **Source:** DE-REC-029.

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
- **Problem / opportunity:** The RosterAssigner modal table uses dense cell borders, conflicting with DESIGN.md and visually inconsistent with the planning grid, drivers table, and SubTable.
- **Scope notes:** Apply tonal separator approach: remove cell borders, use subtle row separators, keep header bottom edge.
- **Dependencies:** None.
- **Definition of done:** RosterAssigner table uses tonal separators. Passes `npm run verify`.
- **Source:** EX-REC-018.

### PB-057: RosterProfileEditor status dot indicators

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The RosterProfileEditor grid uses bare `STATUS_COLORS` for cell backgrounds without the compact dot indicators used in the planning grid. Minor visual inconsistency in the settings flow.
- **Scope notes:** Add small status dots to RosterProfileEditor grid cells, matching the planning grid pattern.
- **Dependencies:** None.
- **Definition of done:** RosterProfileEditor grid cells show status dots consistent with the planning grid. Passes `npm run verify`.
- **Source:** EX-REC-024.

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

### PB-053: Add date validation to POST sub-record routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `endDate >= startDate` validation to POST routes for employment, functions, and roster assignments.

### PB-054: Fix English error messages in settings API routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Translated "Unknown settings type" to "Onbekend instellingentype" in all settings API routes.

### PB-052: SubTable tonal separator consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced dense cell borders with tonal row separators, alternating backgrounds, card surface, and consistent header styling.

### PB-049: Fix handleDragEnd stale closure in PlanningGrid useEffect
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Eliminated the last ESLint warning. Codebase now has 0 ESLint warnings.

### PB-050: Add date logic validation to sub-record PUT routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `endDate >= startDate` validation to PUT routes for employment, functions, and roster assignments.

### PB-051: Validate source scenario exists before duplication
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added 404 guard when source scenario ID is invalid.

### PB-048: Drivers page header and layout composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Redesigned drivers page: composed header, tonal row alternation, "Achternaam, Voornaam" format, form section headers.

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
- Completed items should be moved out of active execution sections.
- Stale or superseded items should be removed or deferred.
- Overlapping items should be merged.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
