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

### PB-025: Fix planning grid not showing drivers

- **Owner:** Delivery Agent
- **Priority:** P1 Critical
- **Status:** Ready
- **Problem / opportunity:** After PB-003 introduced employment-based driver status, the planning grid API (`/api/planning/for-range`) uses `activeDriverWhereClause()` to filter drivers. This hides all drivers who have no employment records, or whose employment records don't cover today's date. The driver list shows all drivers without this filter, so users see drivers in the chauffeursoverzicht that are missing from the planningsoverzicht.
- **Why this matters now:** This is a user-reported regression. The planning grid is the core workflow. Drivers that exist in the system must be visible for planning.
- **Scope notes:** Remove the `activeDriverWhereClause()` filter from the planning grid API at `src/app/api/planning/for-range/route.ts` line 41. Replace `where: activeDriverWhereClause()` with `where: {}` (or remove the where clause entirely). The planning grid should show all drivers, regardless of employment status. The employment-based status remains available for display/grouping purposes via `transformDriver()` — this fix only removes the hard filter.
- **Dependencies:** None.
- **Definition of done:** All drivers visible in the driver list also appear in the planning grid. Passes `npm run verify`.
- **Implementation note:** This is a one-line change. Do not add new filtering logic — just remove the existing filter. The `isActive` computed field from `transformDriver()` can still be used by the frontend for visual grouping if desired, but must not prevent drivers from appearing.
- **Source:** Scrum Master input (SMI-003).

### PB-022: Wrap employment and function POST handlers in transactions

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Employment POST and function POST both call `autoCloseOpenRecords()` followed by a create — two separate operations without `$transaction`. A failure between auto-close and create leaves the driver with a closed record and no replacement.
- **Why this matters now:** These are the last two unprotected multi-step creation handlers. Completes the transaction coverage started in PB-004 and PB-011.
- **Scope notes:** Wrap both handlers in `prisma.$transaction()`, passing `tx` to `autoCloseOpenRecords()` and the create call. Files: `src/app/api/drivers/[id]/employment/route.ts` and `src/app/api/drivers/[id]/functions/route.ts`.
- **Dependencies:** None.
- **Definition of done:** Both handlers wrapped in transactions. Passes `npm run verify`.
- **Implementation note:** The roster-assignments route already follows this pattern — use it as reference.
- **Source:** DE-REC-009.

### PB-021: Add aria-label to icon-only action buttons

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Problem / opportunity:** Edit and delete icon-only buttons in SkillManager and RosterProfileEditor lack `aria-label` attributes. CLAUDE.md requires all icon-only buttons to have `aria-label`. Screen reader users cannot identify button actions.
- **Why this matters now:** Compliance gap with codebase rules. Quick fix with broad accessibility impact.
- **Scope notes:** Add `aria-label="Bewerken"` to edit buttons and `aria-label="Verwijderen"` to delete buttons in SkillManager and RosterProfileEditor. Also check SubTable and StamtabelManager for the same gap.
- **Dependencies:** None.
- **Definition of done:** All icon-only buttons in settings components have `aria-label`. Passes `npm run verify`.
- **Source:** EX-REC-010.
- **Implementation note:** Added `aria-label` to all 16 icon-only buttons across SkillManager, RosterProfileEditor, StamtabelManager, SubTable, DriverList, RosterAssigner, PlanningGrid, and WeekSelector. Labels: Bewerken, Verwijderen, Opslaan, Annuleren, Eerder, Later, Vandaag, Roosterprofiel toewijzen.

### PB-014: Add visible required field indicators to forms

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Problem / opportunity:** No form visually marks required fields before submission. Users must submit and encounter errors to learn which fields are mandatory.
- **Scope notes:** Add red asterisk (`*`) after required field labels using `text-danger-600`. Apply across DriverForm, StamtabelManager, SkillManager, RosterProfileEditor, ScenarioSelector, and sub-table forms.
- **Dependencies:** None.
- **Definition of done:** All required fields have visual indicators. Passes `npm run verify`.
- **Source:** EX-REC-006.
- **Implementation note:** Added red asterisk indicators to all required fields: DriverForm (Voornaam, Achternaam), EmploymentForm (Begindatum), PositionForm (Begindatum), RosterForm (Begindatum, Roosterprofiel), RosterAssigner (Roosterprofiel, Ingangsdatum). For placeholder-only forms (StamtabelManager, SkillManager, RosterProfileEditor, ScenarioSelector), updated placeholder text to include `*` suffix since these lack explicit labels.

### PB-023: Remove isActive from driver PUT handler

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The driver PUT handler still allows setting `isActive` directly via the API. After PB-003, `transformDriver` computes `isActive` from employment records, so the stored boolean is ignored on read. Writing it is misleading.
- **Why this matters now:** Cleanup after PB-003. The field is dead on write.
- **Scope notes:** Remove the `isActive` field from the PUT handler's `updateData` object in `src/app/api/drivers/[id]/route.ts`. No migration — the schema field remains but becomes read-only/derived.
- **Dependencies:** None.
- **Definition of done:** `isActive` no longer writable via PUT. Passes `npm run verify`.
- **Implementation note:** Remove ~2 lines. No frontend currently sets isActive via PUT.
- **Source:** DE-REC-010.

### PB-017: Sanitize error logging in API catch blocks

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** All API route catch blocks log the full error object. Prisma errors can contain connection strings and SQL details in server logs.
- **Scope notes:** Log only `error.message` (or "Unknown error") in catch blocks. Optionally log `error.code` for Prisma errors. Mechanical change across ~20 route files.
- **Dependencies:** None.
- **Definition of done:** No full error objects logged. Only message + code. Passes `npm run verify`.
- **Source:** DE-REC-007.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Planned (Future Cycles)

### PB-024: Consolidate /drivers/[id]/computed into main driver transform

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** The computed endpoint makes 3 separate `findFirst()` queries that are redundant with the main driver endpoint. The client-side `getComputedFields()` helper already computes derived fields from the main response.
- **Scope notes:** Remove the separate computed endpoint. Verify no frontend code calls it. Update any callers to use the main driver endpoint.
- **Dependencies:** None.
- **Definition of done:** Computed endpoint removed. No regressions. Passes `npm run verify`.
- **Source:** DE-REC-011.

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

---

## Completed Recently

### PB-011: Wrap remaining multi-step mutations in transactions
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Wrapped all multi-step mutations in `prisma.$transaction()`: driver PUT, driver DELETE, roster profile PUT, scenario duplicate POST, scenario DELETE, skill DELETE.

### PB-003: Consolidate driver status logic between planning grid and driver list
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Created employment-based active status computation. Both views now use the same logic. **Note:** This change introduced a regression (PB-025) where drivers without active employment records are hidden from the planning grid.

### PB-012: Make toast notifications accessible to screen readers
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added `role="status"` and `aria-live="polite"` to the toast container.

### PB-013: Extend loading state pattern to SkillManager and RosterProfileEditor
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added loading spinners during initial data fetch, matching StamtabelManager pattern.

---

## Deferred

### PB-018: Add foreign key existence checks before relation creation

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Should be done after PB-022 (transaction wrapping on employment/function) so validation + creation are atomic. Schedule after PB-022.
- **Source:** DE-REC-008.

### PB-019: Add semantic dialog attributes to modal overlays

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Lower priority than PB-021 (aria-labels, CLAUDE.md compliance gap). Schedule after PB-021.
- **Source:** EX-REC-008.

### PB-010: Standardize input field styling across settings forms

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor visual inconsistency. Can be done opportunistically alongside other settings page work.
- **Source:** EX-REC-003.

### PB-020: Replace window.confirm with custom confirmation component

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `window.confirm` works. Largest remaining UX inconsistency but requires a new component + migration points. Schedule after PB-019 (dialog accessibility).
- **Source:** EX-REC-009.

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness.
- **Source:** DE-REC-005.

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
