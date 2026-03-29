# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** SMI-004 drives bigger design steps toward DESIGN.md. Phase 1 of the planning grid redesign (PB-032) is complete. The DayCell popup (SMI-005) and Phase 2 row composition (PB-034) are the next major UX deliverables. The custom date picker (SMI-006) is escalated to ESC-004 awaiting scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-037: DayCell popup — reposition near click target

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** When a user clicks a DayCell in the planning grid, the status selector popup appears in the center of the screen, far from the mouse cursor. This forces unnecessary mouse movement and breaks the user's spatial context within the grid.
- **Why this matters now:** Direct Scrum Master request (SMI-005). Core planning workflow friction. Aligns with SMI-004 bigger design steps.
- **Scope notes:** Reposition the DayCell selector dropdown/popup to appear adjacent to the clicked cell (e.g., below or beside it, with viewport boundary detection to avoid overflow). The popup should feel like a contextual menu, not a modal. Keep the existing status options and behavior — this is a positioning and container change only.
- **Dependencies:** None.
- **Definition of done:** Clicking a DayCell opens the status selector near the clicked cell. The popup stays within viewport bounds. Existing status selection behavior is preserved. Passes `npm run verify`.
- **Implementation note:** The current selector is likely rendered as an absolutely/fixed positioned overlay. Change to position relative to the click target or cell element. Consider using a portal with calculated coordinates based on the cell's bounding rect.
- **Source:** SMI-005.

### PB-038: DayCell popup — visual redesign

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** The DayCell status selector popup has a basic/functional appearance that doesn't match the design quality of the recently improved planning grid surface, confirm dialogs, and page headers.
- **Why this matters now:** Direct Scrum Master request (SMI-005). With PB-037 repositioning the popup near the cell, the visual design should also be elevated to match the rest of the application.
- **Scope notes:** Redesign the popup appearance: use design tokens for surface, border, shadow. Apply card-style container (`shadow-card`, `border-border-subtle`). Status options should be clearly styled items (not plain text). Consider hover states and active state indication. Must remain compact since it now appears inline near the cell.
- **Dependencies:** PB-037 (positioning must be done first so the redesign works with the new contextual positioning).
- **Definition of done:** DayCell popup has refined visual design using design tokens. Status options are clear and interactive. Compact enough for contextual positioning. Passes `npm run verify`.
- **Source:** SMI-005.

### PB-034: Planning grid Phase 2 — row composition and identity

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Row composition combines name, metadata, and planning cells in a flat table structure without clear visual hierarchy. Driver identity (name, employee number) doesn't stand out from the row content.
- **Why this matters now:** Phase 1 surface layering (PB-032) is complete. Row composition is the next structural improvement per ESC-003 Option B phased approach. SMI-004 calls for bigger design steps.
- **Scope notes:** Strengthen driver identity zone: driver name with more confident typography, metadata as subdued supporting text, clearer visual separation between identity columns and planning columns. Do NOT change cell rendering in this phase.
- **Dependencies:** PB-032 (completed).
- **Definition of done:** Row composition shows clear visual hierarchy between identity, metadata, and planning content. Faster driver identification when scanning. Passes `npm run verify`.
- **Source:** EX-REC-016, ESC-003 (Option B Phase 2).

### PB-024: Remove dead getComputedFields wrapper from api.ts

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The `drivers.getComputedFields()` wrapper in `api.ts` calls a non-existent endpoint (route file already deleted). Dead code creates confusion.
- **Why this matters now:** Low effort cleanup. Remove dead API surface.
- **Scope notes:** Remove the `getComputedFields` method from `src/lib/api.ts`. Verify no frontend code calls it.
- **Dependencies:** None.
- **Definition of done:** `drivers.getComputedFields()` removed from `api.ts`. No regressions. Passes `npm run verify`.
- **Source:** DE-REC-012.

### PB-027: Add input validation to preferences and active-scenario PUT handlers

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `src/app/api/preferences/route.ts` (PUT) and `src/app/api/scenarios/active/route.ts` (PUT) accept request bodies without `validateRequired()` checks.
- **Why this matters now:** Small gap in otherwise complete validation coverage. Quick fix.
- **Scope notes:** Add `validateRequired()` calls to both handlers. Preferences PUT needs `key` and `value`. Active-scenario PUT needs `activeId`.
- **Dependencies:** None.
- **Definition of done:** Both PUT handlers validate required fields. Invalid requests return clear 400 responses. Passes `npm run verify`.
- **Source:** DE-REC-013.

---

## Blocked / Needs Decision

### PB-039: Custom date picker component

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (awaiting ESC-004 decision)
- **Problem / opportunity:** All date fields use the browser's native date picker, which looks inconsistent with the application's design system. Affects perceived quality across driver management, employment dates, planning period selection, and roster assignments.
- **Why this matters now:** Direct Scrum Master request (SMI-006). Aligns with SMI-004 design direction.
- **Scope notes:** Depends on ESC-004 scope decision (full custom / styled wrapper / defer).
- **Dependencies:** ESC-004 decision required.
- **Definition of done:** Defined after ESC-004 decision.
- **Source:** SMI-006.

---

## Planned (Future Cycles)

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

### PB-040: RosterAssigner modal table styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The RosterAssigner modal table uses dense `border border-border-default` on every cell, conflicting with DESIGN.md section 4.1 and visually inconsistent with the updated planning grid.
- **Why this matters now:** Low effort consistency fix. The planning grid now uses tonal separators, making the modal table the most visible inconsistency.
- **Scope notes:** Apply the same tonal separator approach used in the planning grid: remove cell borders, use subtle row separators, keep header bottom edge.
- **Dependencies:** None.
- **Definition of done:** RosterAssigner table uses tonal separators instead of cell borders. Passes `npm run verify`.
- **Source:** EX-REC-018.

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

### PB-032: Planning grid Phase 1 — surface layering and row tonal hierarchy
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced border-heavy grid structure with tonal surface system. Header/data/group/totals rows differentiated through surface layering, subtle separators, and alternating row tones.

### PB-036: Add Escape key handling to remaining modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added Escape key dismiss handler to ScenarioSelector, RosterAssigner, bulk selector, and DayCell selector.

### PB-033: Add focus trap to modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Created reusable `useFocusTrap` hook. Applied to all modal overlays.

### PB-020: Replace window.confirm with custom ConfirmDialog
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Created styled `ConfirmDialog` component. Replaced all 6 `window.confirm()` calls.

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
- **Reason:** Dependencies resolved (PB-022 done). Medium effort — touches several routes. Schedule when capacity allows after higher-priority items.
- **Source:** DE-REC-008.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor visual inconsistency. Low impact relative to current design priorities.
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
