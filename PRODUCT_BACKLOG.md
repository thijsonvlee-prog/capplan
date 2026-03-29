# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction (SMI-004):** The Scrum Master directs bigger design steps toward DESIGN.md compliance. The planning grid visual redesign has been approved as a phased approach (ESC-003 → Option B). All prerequisite work (page headers, confirm dialogs, focus traps) is complete. Phase 1 (PB-032) is the next major deliverable.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-032: Planning grid Phase 1 — surface layering and row tonal hierarchy

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** The planning grid uses dense 1px borders for all structure (cells, headers, columns). This conflicts with DESIGN.md section 4.1 (No-Line Rule) and section 7.4 (planning grid is a product surface, not a spreadsheet).
- **Why this matters now:** All prerequisite work is complete (PB-028 toolbar grouping, PB-033 focus trap, PB-020 confirm dialogs, PB-031 page headers). The planning grid is the core product surface and the largest remaining gap between the current UI and the DESIGN.md standard. SMI-004 calls for bigger design steps.
- **Scope notes:** Replace border-heavy structure with tonal contrast. Differentiate header, data rows, group rows, and totals rows through surface layering. Use design tokens for surface tiers. Do NOT change row composition or cell rendering in this phase.
- **Dependencies:** None remaining. All prereqs completed.
- **Definition of done:** Border-heavy structure replaced with tonal contrast. Header/data/group/totals rows visually differentiated. Grid reads as a product surface, not a spreadsheet. Passes `npm run verify`.
- **Implementation note:** PlanningGrid.tsx is ~650 lines and the most complex component. Handle with extreme care. Test thoroughly.
- **Source:** EX-REC-016, SMI-004, ESC-003 (Option B Phase 1).

### PB-024: Consolidate /drivers/[id]/computed into main driver transform

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The `/api/drivers/[id]/computed` route file has already been deleted, but the `drivers.getComputedFields()` wrapper in `api.ts` (line 99) still exists and calls a non-existent endpoint. Dead code creates confusion.
- **Why this matters now:** Low effort cleanup. Remove dead API surface.
- **Scope notes:** Remove the `getComputedFields` method from `src/lib/api.ts`. Verify no frontend code calls it (confirmed: only `api-helpers.ts` `getComputedFields` is used, which is a different client-side function).
- **Dependencies:** None.
- **Definition of done:** `drivers.getComputedFields()` removed from `api.ts`. No regressions. Passes `npm run verify`.
- **Source:** DE-REC-012.

### PB-027: Add input validation to preferences and active-scenario PUT handlers

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `src/app/api/preferences/route.ts` (PUT) and `src/app/api/scenarios/active/route.ts` (PUT) accept request bodies without `validateRequired()` checks. Missing fields cause unclear errors downstream.
- **Why this matters now:** Small gap in otherwise complete validation coverage. Quick fix.
- **Scope notes:** Add `validateRequired()` calls to both handlers (~5 lines per file). Use the existing pattern from `api-route-utils.ts`. Preferences PUT needs `key` and `value`. Active-scenario PUT needs `activeId`.
- **Dependencies:** None.
- **Definition of done:** Both PUT handlers validate required fields. Invalid requests return clear 400 responses. Passes `npm run verify`.
- **Source:** DE-REC-013.

### PB-036: Add Escape key handling to remaining modal overlays

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The ConfirmDialog supports Escape key to close, but the other 4 modal overlays (ScenarioSelector create form, RosterAssigner, PlanningGrid bulk selector, DayCell selector) do not have explicit Escape key handling. Users expect Escape to dismiss any modal.
- **Why this matters now:** Simple follow-up to PB-033 (focus trap). Low risk, high consistency value. Completes the modal interaction pattern.
- **Scope notes:** Add `onKeyDown` handler for Escape to the 4 remaining modal overlays, calling the existing close/cancel callback. Small change per component.
- **Dependencies:** PB-033 (completed).
- **Definition of done:** All 4 modal overlays dismiss on Escape key. Passes `npm run verify`.
- **Source:** EX-REC-017.

---

## Planned (Next Cycles)

### PB-034: Planning grid Phase 2 — row composition and identity

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Row composition combines name, metadata, and planning cells in a flat table structure without clear visual hierarchy.
- **Why this matters now:** Phase 2 of ESC-003 Option B. Builds on Phase 1 surface layering.
- **Scope notes:** Improve how driver name, metadata, and planning cells relate within each row. Better row identity composition. Do NOT change cell rendering in this phase.
- **Dependencies:** PB-032 (Phase 1 must be complete first).
- **Definition of done:** Row composition shows clear visual hierarchy between identity, metadata, and planning content. Passes `npm run verify`.
- **Source:** EX-REC-016, ESC-003 (Option B Phase 2).

### PB-035: Planning grid Phase 3 — cell rendering and status refinement

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** DayCell visual output uses basic colored fills. Status representation could be richer with chip/badge treatment, better spacing, and clearer status comprehension.
- **Why this matters now:** Phase 3 of ESC-003 Option B. Final visual refinement after structure and composition are established.
- **Scope notes:** Refine DayCell visual output, spacing, chip treatment. Align status rendering with DESIGN.md standard.
- **Dependencies:** PB-034 (Phase 2 must be complete first).
- **Definition of done:** Cell rendering aligns with DESIGN.md product-grade standard. Status is immediately comprehensible. Passes `npm run verify`.
- **Source:** EX-REC-016, ESC-003 (Option B Phase 3).

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

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-033: Add focus trap to modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Created reusable `useFocusTrap` callback-ref hook. Applied to ScenarioSelector, RosterAssigner, PlanningGrid bulk selector, and DayCell selector.

### PB-020: Replace window.confirm with custom ConfirmDialog component
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Created `ConfirmDialog` component with design tokens, danger styling, focus trap, Escape key support. Replaced all 6 `window.confirm()` calls.

### PB-031: Apply page header pattern to settings and capacity screens
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added composed page headers. Fixed hardcoded orange color classes on capacity page to use design tokens.

### PB-025: Fix planning grid not showing drivers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed employment-based filter from planning grid API. All drivers now visible.

### PB-022: Wrap employment and function POST handlers in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent

### PB-023: Remove isActive from driver PUT handler
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent

### PB-017: Sanitize error logging in API catch blocks
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent

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
- **Reason:** Minor visual inconsistency. Low impact relative to current design priorities (PB-032 takes precedence).
- **Source:** EX-REC-003.

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
