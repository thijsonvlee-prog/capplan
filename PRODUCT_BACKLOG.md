# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major redesign work is complete (planning grid 3 phases, DayCell popup, date input, settings tabs, drivers page, SubTable). Input styling standardized. API validation hardened. ESLint clean (0 warnings). Focus now shifts to: (1) remaining visual consistency gaps on other surfaces (PB-047, PB-040), (2) completing API validation coverage (PB-053, PB-054), and (3) connectivity hub (PB-015/016) when capacity allows.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-053: Add date validation to POST sub-record routes

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** PB-050 added `endDate >= startDate` validation to PUT routes for sub-records, but the corresponding POST routes (`/api/drivers/[id]/employment`, `/api/drivers/[id]/functions`, `/api/drivers/[id]/roster-assignments`) also accept date fields without this validation.
- **Scope notes:** Add the same validation guard to the 3 POST routes. Same pattern as PB-050.
- **Dependencies:** None.
- **Definition of done:** All 3 POST routes reject `endDate < startDate` with a Dutch error message. Passes `npm run verify`.
- **Why this matters now:** Complements just-completed PB-050. Same pattern, minimal effort. Closes the validation gap at API boundaries.
- **Implementation note:** Use the same guard and Dutch error message as PB-050: `"Einddatum mag niet voor de startdatum liggen"`.
- **Source:** DE-REC-027.

### PB-054: Fix English error messages in settings API routes

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** `GET /api/settings/[type]` and `PUT /api/settings/[type]/[id]` return `"Unknown settings type"` in English. All other API error messages are in Dutch. This violates CLAUDE.md's requirement that all user-facing text is Dutch.
- **Scope notes:** Change to `"Onbekend instellingentype"` in both routes. Two string changes.
- **Dependencies:** None.
- **Definition of done:** Both settings routes return Dutch error messages. Passes `npm run verify`.
- **Why this matters now:** Quick CLAUDE.md compliance fix. Two lines of code.
- **Source:** DE-REC-026.

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
- **Problem / opportunity:** The RosterAssigner modal table uses dense cell borders, conflicting with DESIGN.md and visually inconsistent with the planning grid.
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

### PB-052: SubTable tonal separator consistency
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced dense per-cell borders with tonal row separators (`border-b border-border-subtle`), tonal row alternation (`bg-surface-secondary/50`), `text-label` header styling, card surface wrapping (`shadow-card`), and `bg-success-50` highlight for active records. Consistent with DriverList and PlanningGrid patterns.

### PB-049: Fix handleDragEnd stale closure in PlanningGrid useEffect
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped `handleDragEnd` in `useCallback` with `[dragState]` dependency and added it to the useEffect dependency array. Eliminates the last ESLint `react-hooks/exhaustive-deps` warning. Codebase now has 0 ESLint warnings.

### PB-050: Add date logic validation to sub-record PUT routes
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `endDate >= startDate` validation to PUT routes for employment, functions, and roster assignments. Returns 400 with Dutch error message.

### PB-051: Validate source scenario exists before duplication
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `findUnique` check before duplicating a scenario. Returns 404 with Dutch error message if the source scenario ID is invalid.

### PB-048: Drivers page header and layout composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Redesigned drivers page: composed header, view-mode state management, tonal row alternation, "Achternaam, Voornaam" format, form section headers, improved empty states.

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
