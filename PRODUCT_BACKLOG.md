# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** SMI-004 drives bigger design steps toward DESIGN.md. Planning grid Phases 1 and 2 are complete. DayCell popup repositioning and visual redesign are complete. ESC-004 (custom date picker) decided: Option B (styled wrapper). PB-039 is now unblocked and ready. Phase 3 cell rendering (PB-035) remains the next major UX deliverable. Settings page layout (PB-041) is a new medium-priority item aligned with SMI-004.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-039: Styled date input wrapper component

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** All date fields use the browser's native date picker, which looks inconsistent with the application's design system. Affects perceived quality across driver management, employment dates, planning period selection, and roster assignments.
- **Why this matters now:** Direct Scrum Master request (SMI-006). ESC-004 decided: Option B (styled wrapper). Aligns with SMI-004 design direction.
- **Scope notes:** Create a custom wrapper component that uses the native `<input type="date">` underneath but adds a styled container, custom trigger button, and consistent typography/spacing aligned with the design system. The calendar popup itself remains native. Replace all date inputs across the app with this wrapper.
- **Dependencies:** None (ESC-004 decided).
- **Definition of done:** All date input fields in the application use the new styled wrapper. Visual styling aligns with design tokens and `input-field` pattern. Calendar popup remains native. Passes `npm run verify`.
- **Implementation note:** Estimated 1 cycle. Keep the wrapper simple — styled container + trigger button + native input. Do not attempt to replace the native calendar popup.
- **Source:** SMI-006, ESC-004 (Option B).

### PB-042: Remove dead preferences API methods from api.ts

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `api.ts` defines `preferences.getAll()` which calls `/api/preferences/all` — a route that does not exist (would 404). Also defines `preferences.remove()` calling DELETE on `/api/preferences`, which is also unused. Neither method has any callers.
- **Why this matters now:** Quick cleanup that removes dead code and a latent bug (404 endpoint reference).
- **Scope notes:** Remove `getAll` and `remove` methods from the `preferences` namespace in `api.ts`. Remove the `UserPreference` type import if no longer needed.
- **Dependencies:** None.
- **Definition of done:** Dead methods removed. No callers broken. Passes `npm run verify`.
- **Implementation note:** ~10 lines removed from `api.ts`. Verify no callers exist before removal.
- **Source:** DE-REC-015.

### PB-035: Planning grid Phase 3 — cell rendering and status refinement

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** DayCell visual output uses basic colored fills. Status representation could be richer with chip/badge treatment, better spacing, and clearer status comprehension.
- **Why this matters now:** Phase 3 of ESC-003 Option B. Final visual refinement after structure (Phase 1) and composition (Phase 2) are complete.
- **Scope notes:** Refine DayCell visual output, spacing, chip treatment. Consider dot/icon approach vs. current code letter for compact cells. Align status rendering with DESIGN.md standard.
- **Dependencies:** PB-032 and PB-034 (both complete).
- **Definition of done:** Cell rendering aligns with DESIGN.md product-grade standard. Status is immediately comprehensible. Passes `npm run verify`.
- **Source:** EX-REC-019, ESC-003 (Option B Phase 3).

---

## Planned (Future Cycles)

### PB-041: Settings page layout composition

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The settings page (stamtabellen) is functional but uses a generic list-of-cards layout without strong grouping, hierarchy, or visual rhythm. It reads as a standard admin panel rather than a designed product screen.
- **Why this matters now:** With the planning grid approaching DESIGN.md alignment, the settings page becomes the most visible screen still at generic admin quality. Aligns with SMI-004 direction.
- **Scope notes:** Group related settings categories visually. Strengthen section headers. Add subtle surface differentiation. Consider sidebar-navigation or tabbed approach for category navigation. Keep changes within existing component patterns.
- **Dependencies:** None.
- **Definition of done:** Settings page has clear category grouping, improved visual hierarchy, and feels designed rather than generic. Passes `npm run verify`.
- **Source:** EX-REC-020.

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

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-024: Remove dead getComputedFields wrapper from api.ts
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Deleted the unused `/api/drivers/[id]/computed` route file and removed the `drivers.getComputedFields()` method from `api.ts`.

### PB-027: Add input validation to preferences and active-scenario PUT handlers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Added `validateRequired()` checks to PUT endpoints. Missing fields return 400 with Dutch error messages.

### PB-037: DayCell popup — reposition near click target
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Popup appears adjacent to clicked cell with viewport boundary detection. Dark backdrop removed.

### PB-038: DayCell popup — visual redesign
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** StatusSelector redesigned with color indicators, check marks, chevrons, refined spacing, and design-token styling.

### PB-034: Planning grid Phase 2 — row composition and identity
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Driver names use semibold last-name-first format. Metadata uses `text-caption`. Sticky columns inherit row tones.

### PB-032: Planning grid Phase 1 — surface layering and row tonal hierarchy
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Replaced border-heavy grid with tonal surface system. Header/data/group/totals rows differentiated through layering.

### PB-036: Add Escape key handling to remaining modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent

### PB-033: Add focus trap to modal overlays
- **Completed:** 2026-03-29
- **Owner:** Experience Agent

### PB-020: Replace window.confirm with custom ConfirmDialog
- **Completed:** 2026-03-29
- **Owner:** Experience Agent

### PB-025: Fix planning grid not showing drivers
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent

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
- **Reason:** Minor visual inconsistency. Low impact relative to current design priorities. May be addressed naturally as part of PB-041 (settings page layout).
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
