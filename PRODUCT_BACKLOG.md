# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction (SMI-004):** The Scrum Master has directed bigger design steps toward DESIGN.md compliance. Design-focused items are elevated in priority. Experience Agent recommendations carry higher weight this cycle.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-031: Apply page header pattern to settings and capacity screens

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** The settings page and capacity comparison page lack composed page headers. They open with content directly, without title context or primary action structure. This is inconsistent with the now-improved driver list and planning screen, and conflicts with DESIGN.md section 7.1 (page headers) and 2.5 (composed screens).
- **Why this matters now:** The page header pattern (`.page-header`, `.page-header-row`, `.page-header-context`, `.count-badge`) is already established from PB-029. Applying it broadly is low-effort, high-consistency value, and directly responds to SMI-004 (bigger design steps).
- **Scope notes:** Apply `.page-header` pattern to: (1) settings page — add title, contextual subtitle, section context; (2) capacity/comparison screen — add title, scenario context, action zones. Use existing CSS classes. Do not redesign page content structure, only add proper headers.
- **Dependencies:** None. Pattern already exists.
- **Definition of done:** Settings and capacity screens have composed page headers with title, context, and action zones. Consistent with driver list page. Passes `npm run verify`.
- **Implementation note:** Review the settings page — PB-026 already added section grouping with headings, so the page header should complement that structure, not duplicate it.
- **Source:** EX-REC-015, SMI-004.

### PB-020: Replace window.confirm with custom ConfirmDialog component

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready (upgraded from P4 Deferred)
- **Problem / opportunity:** All delete confirmation dialogs use `window.confirm()` (found in SubTable, ScenarioSelector, SkillManager, RosterProfileEditor, StamtabelManager). This renders browser-native dialogs that cannot be styled, do not match the application's design, and vary across browsers. This is one of the most visible UX inconsistencies and conflicts with DESIGN.md's product-grade quality bar.
- **Why this matters now:** SMI-004 directs bigger design improvements. PB-019 (dialog accessibility) is completed, providing the semantic foundation. This is the most visible UX inconsistency remaining and directly improves the perceived quality of the product.
- **Scope notes:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens. Include `role="dialog"`, `aria-modal="true"`, focus trap from the start. Replace all 5 `window.confirm()` call sites. Each confirmation must show what will be deleted (name, not "dit record").
- **Dependencies:** PB-019 (completed).
- **Definition of done:** All `window.confirm()` calls replaced. Custom dialog uses design tokens, is accessible, shows specific context. Passes `npm run verify`.
- **Implementation note:** If EX-REC-014 (focus trap) is done first, reuse that utility. If not, implement a minimal focus trap within the ConfirmDialog component.
- **Source:** EX-REC-009, PB-020 (upgraded), SMI-004.

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

### PB-033: Add focus trap to modal overlays

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Modal overlays now have semantic dialog attributes (PB-019 done) but do not trap focus. Users can tab out of the modal and interact with background content, breaking the expected modal interaction pattern.
- **Why this matters now:** Natural next step after PB-019. Without focus trap, dialog semantics are incomplete. Also needed as foundation for PB-020 (ConfirmDialog).
- **Scope notes:** Create a lightweight focus trap utility or hook. Apply to the 4 true modals (ScenarioSelector, RosterAssigner, bulk selector, DayCell selector). The column picker is a dropdown, not a true modal — focus trap is not appropriate there.
- **Dependencies:** PB-019 (completed).
- **Definition of done:** Focus is trapped within open modals. Tab/Shift+Tab cycle within the modal. Focus returns to trigger element on close. Passes `npm run verify`.
- **Implementation note:** Consider implementing this before or alongside PB-020 so the ConfirmDialog can reuse the same utility.
- **Source:** EX-REC-014.

---

## Blocked / Needs Decision

### PB-032: Planning grid visual redesign toward DESIGN.md standard

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting for ESC-003 decision)
- **Problem / opportunity:** The planning grid uses dense 1px borders for all structure (cells, headers, columns). This conflicts with DESIGN.md section 4.1 (No-Line Rule) and section 7.4 (planning grid is a product surface, not a spreadsheet). Row composition combines name, metadata, and planning cells in a flat table structure without clear tonal hierarchy. The planning grid is the core product surface and the largest remaining gap between the current UI and the DESIGN.md standard.
- **Why this matters now:** SMI-004 directs bigger design steps. The toolbar is now grouped (PB-028). The grid visual structure is the next and most impactful design improvement.
- **Scope notes:** Scope depends on ESC-003 decision. Options range from full single-cycle redesign to phased approach across 2-3 cycles.
- **Dependencies:** ESC-003 decision required. Should be done in isolation without concurrent PlanningGrid changes.
- **Definition of done:** Depends on chosen scope. At minimum: border-heavy structure replaced with tonal contrast, header/data/group/totals rows visually differentiated.
- **Source:** EX-REC-016, SMI-004, ESC-003.

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
- **Summary:** Restructured PlanningGrid toolbar into visually grouped control sections. Added reusable `.control-group` and `.control-group-label` CSS classes.

### PB-029: Improve driver list page header and action structure
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added composed page header with title, count badge, search icon, and prominent primary action. Added reusable `.page-header`, `.count-badge` CSS classes.

### PB-026: Improve settings page visual hierarchy with section grouping
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Grouped settings into three logical sections with section headings and page introduction.

### PB-019: Add semantic dialog attributes to modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `role="dialog"`, `aria-modal="true"`, and `aria-label` to all 5 modal overlays.

### PB-025: Fix planning grid not showing drivers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed employment-based filter from planning grid API. All drivers now visible.

### PB-022: Wrap employment and function POST handlers in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Both handlers wrapped in `prisma.$transaction()`.

### PB-023: Remove isActive from driver PUT handler
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Removed stale `isActive` write path. Field is now derived from employment records.

### PB-017: Sanitize error logging in API catch blocks
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** All ~45 `console.error` calls sanitized to log only error messages.

### PB-021: Add aria-label to icon-only action buttons
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `aria-label` to all 16 icon-only buttons across 8 components.

### PB-014: Add visible required field indicators to forms
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Red asterisk indicators added to all required fields.

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
- **Reason:** Minor visual inconsistency. Small fix but low impact relative to current design priorities.
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
