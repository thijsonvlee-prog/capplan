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

### PB-024: Consolidate /drivers/[id]/computed into main driver transform

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The `/api/drivers/[id]/computed` endpoint makes 3 separate `findFirst()` queries that are redundant with the main driver endpoint. The frontend never calls this endpoint — `getComputedFields()` in `api-helpers.ts` computes the same fields from the main response. The `api.ts` wrapper method has zero callers.
- **Why this matters now:** Low effort cleanup. Dead code creates confusion for agents and developers.
- **Scope notes:** Delete `src/app/api/drivers/[id]/computed/route.ts`. Remove `drivers.getComputedFields()` from `api.ts`. Verify no frontend code references the endpoint.
- **Dependencies:** None.
- **Definition of done:** Computed endpoint removed. No regressions. Passes `npm run verify`.
- **Source:** DE-REC-012.

### PB-027: Add input validation to preferences and active-scenario PUT handlers

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `src/app/api/preferences/route.ts` (PUT) and `src/app/api/scenarios/active/route.ts` (PUT) accept request bodies without `validateRequired()` checks. Missing fields cause unclear errors downstream.
- **Why this matters now:** Small gap in otherwise complete validation coverage. Quick fix, consistent with all other POST/PUT routes.
- **Scope notes:** Add `validateRequired()` calls to both handlers (~5 lines per file). Use the existing pattern from `api-route-utils.ts`.
- **Dependencies:** None.
- **Definition of done:** Both PUT handlers validate required fields. Invalid requests return clear 400 responses. Passes `npm run verify`.
- **Source:** DE-REC-013.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

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
- **Implementation note:** Keep schema minimal: ImportSource (id, name, type=CSV, fieldMappings as JSON, createdAt, updatedAt). Migration required.
- **Source:** ESC-001 decision (Option A), SMI-001.

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen for CSV import source configuration with field mapping.
- **Dependencies:** PB-015 (data model and API must exist first).
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

---

## Completed Recently

### PB-028: Group planning screen controls into logical sections
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Restructured PlanningGrid toolbar into visually grouped control sections using new `.control-group` CSS class. Row 1: Period group (PeriodSelector + ZoomSelector) and View group (density + scenario). Row 2: Search & Filter group (search + grouper) and Display group (columns + totals). Status legend stays right-aligned. Added `.control-group` and `.control-group-label` to globals.css as reusable patterns.

### PB-029: Improve driver list page header and action structure
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added composed page header with title, driver count badge, and search with icon. Uses new reusable `.page-header`, `.page-header-row`, `.page-header-context`, and `.count-badge` CSS classes. Primary action uses `.btn-primary` class. Search input uses `.input-field` class with search icon.

### PB-026: Improve settings page visual hierarchy with section grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Grouped settings into three logical sections (Stamgegevens, Competenties, Roosters) with section headings and a page introduction. Removed flat list layout.

### PB-019: Add semantic dialog attributes to modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label` to all 5 modal overlays: ScenarioSelector create dialog, RosterAssigner, PlanningGrid column picker, PlanningGrid bulk selector, and DayCell status selector.

### PB-025: Fix planning grid not showing drivers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed `activeDriverWhereClause()` filter from the planning grid API. All drivers now appear regardless of employment status.

### PB-022: Wrap employment and function POST handlers in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped both handlers in `prisma.$transaction()`. All sub-record creation handlers are now transaction-protected.

### PB-023: Remove isActive from driver PUT handler
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed stale `isActive` write path. Field is now read-only/derived from employment records.

### PB-017: Sanitize error logging in API catch blocks
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced all ~45 `console.error` calls to log only error messages, not full error objects.

### PB-021: Add aria-label to icon-only action buttons
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `aria-label` to all 16 icon-only buttons across 8 components.

### PB-014: Add visible required field indicators to forms
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added red asterisk indicators to all required fields across all forms.

### PB-011: Wrap remaining multi-step mutations in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** All multi-step mutations wrapped in `prisma.$transaction()`.

### PB-003: Consolidate driver status logic
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Employment-based active status computation. Regression fixed via PB-025.

### PB-012: Make toast notifications accessible
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `role="status"` and `aria-live="polite"` to toast container.

### PB-013: Loading states for SkillManager and RosterProfileEditor
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added loading spinners during initial data fetch.

---

## Deferred

### PB-018: Add foreign key existence checks before relation creation

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Dependencies resolved (PB-022 done). Can be scheduled when capacity allows. Medium effort — touches several routes.
- **Source:** DE-REC-008.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor visual inconsistency. Can be done opportunistically alongside PB-026 (settings grouping) if convenient.
- **Source:** EX-REC-003.

### PB-020: Replace window.confirm with custom confirmation component

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `window.confirm` works. Should be done after PB-019 (dialog accessibility) so the new component starts accessible.
- **Source:** EX-REC-009.

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
