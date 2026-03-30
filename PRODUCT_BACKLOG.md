# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The Scrum Master has signaled a shift toward building out functionality. Two tracks are now active: (1) expanding the connectivity hub from configuration-only to actual CSV import execution, and (2) building an admin panel with user management, which is blocked on an auth approach decision (ESC-005). Additionally, CLAUDE.md needs a rewrite to reflect current application state and incorporate DESIGN.md. The codebase is healthy — 0 ESLint warnings, 0 typecheck errors.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-076: Rewrite CLAUDE.md based on current application state

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** CLAUDE.md was written at project start and has not been updated to reflect the current state of the application. The Scrum Master also wants DESIGN.md content incorporated into CLAUDE.md so there is one steering document.
- **Why this matters now:** Direct Scrum Master request (SMI-007). CLAUDE.md is the primary governance file read by all agents on every run. An outdated steering document causes drift.
- **Scope notes:** Rewrite CLAUDE.md to reflect: current file structure, current design token system, current component patterns, current API route patterns, current build/deploy setup, and incorporate the design system strategy from DESIGN.md as a dedicated section. Keep DESIGN.md in place as a reference until SM confirms removal. Do not change project rules or conventions — update descriptions to match reality.
- **Dependencies:** None.
- **Definition of done:** CLAUDE.md accurately describes the current application. Design system strategy from DESIGN.md is included. `npm run verify` passes. No functional code changes.
- **Implementation note:** Read the full codebase structure, DESIGN.md, and current CLAUDE.md. Produce a clean rewrite. This is documentation only — no code changes.
- **Source:** SMI-007.

### PB-077: CSV file upload and column detection

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** The connectivity hub currently only stores import source configurations. To be useful, it needs to accept actual CSV files, parse them, and detect column names for mapping validation.
- **Why this matters now:** SM directive (SMI-008) to expand connectivity functionality. This is the natural next step after the config-only MVP (PB-015/016).
- **Scope notes:** Add a file upload API endpoint (`POST /api/import-sources/[id]/upload`) that accepts a CSV file, parses the header row, and returns detected column names. Store the uploaded file temporarily (or in-memory) for the subsequent import step. Add basic validation: file size limit, CSV format check, encoding handling. No data import execution yet — that is PB-078.
- **Dependencies:** PB-015, PB-016 (both completed).
- **Definition of done:** API endpoint accepts CSV upload, returns detected columns. Frontend shows upload interface on import source detail. `npm run verify` passes.
- **Implementation note:** Use a simple CSV parser (built-in or lightweight). Do not add heavy dependencies. Consider a `papaparse`-style approach or Node.js built-in stream parsing. The upload UI should be added to the existing Connectiviteit tab.
- **Source:** SMI-008.

### PB-078: CSV import execution — apply field mappings and insert data

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** After uploading a CSV and detecting columns (PB-077), the system needs to actually execute the import: apply the configured field mappings, validate rows, and insert data into the target entity table.
- **Why this matters now:** SM directive (SMI-008). This completes the connectivity hub's core value proposition — going from configuration to actual data import.
- **Scope notes:** Add an import execution endpoint that: reads the uploaded CSV, applies field mappings from the ImportSource config, validates each row against the target entity's required fields, inserts valid rows using `createMany`, and returns a summary (rows imported, rows skipped, errors). Target entities: chauffeurs, werkgevers, afdelingen, standplaatsen. Add an import history/log so users can see what was imported and when.
- **Dependencies:** PB-077 (CSV upload).
- **Definition of done:** Users can upload a CSV, preview the mapping, execute the import, and see results. Import history is visible. `npm run verify` passes.
- **Implementation note:** Use `prisma.$transaction` for the batch insert. Validate all rows before inserting (fail-fast on structural errors, skip individual bad rows with error log). Consider adding an ImportLog model to track imports.
- **Source:** SMI-008.

---

## Blocked / Needs Decision

### PB-079: Admin panel — user management screen

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting on ESC-005)
- **Problem / opportunity:** The Scrum Master wants an admin panel with user management. The User model exists in the database with roles (ADMIN, PLANNER, VIEWER) but no authentication or UI exists.
- **Why this matters now:** Direct SM directive (SMI-008). Required for multi-user operation.
- **Scope notes:** After ESC-005 is decided: build a user list/management screen within the settings page (new "Gebruikers" tab). CRUD for users with role assignment. The scope of this item depends on the chosen auth approach.
- **Dependencies:** ESC-005 (auth approach decision).
- **Definition of done:** Admin users can view, create, edit, and deactivate users with role assignment. Depends on auth infrastructure being in place.
- **Implementation note:** Auth infrastructure will be a separate backlog item created after ESC-005 is decided. This item covers the admin UI only.
- **Source:** SMI-008, ESC-005.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-075: Memoize Map creation in DriverForm.tsx
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Wrapped employer, department, and location Map creations in `useMemo` with appropriate dependency arrays. Consistent with Map-based memoization pattern used in PlanningGrid.

### PB-073: Remove remaining unused utility functions and enum
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed 6 unused functions from `utils.ts` and the unused `StamtabelType` enum from `enums.ts`. Updated documentatie page description.

### PB-074: Add `btn-danger` CSS class and replace inline button styles
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Added `.btn-danger` class to `globals.css`. Replaced inline class strings in `ConfirmDialog.tsx` and `documentatie/page.tsx`. Button system now has complete coverage.

### PB-016: Connectivity hub — admin screen for import source configuration
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Working admin screen for managing CSV import sources with field mapping. Added as "Connectiviteit" tab within settings.

### PB-072: Planning page header subtitle
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Planning page header shows active scenario name as subtitle.

### PB-071: Remove unused utility exports from utils.ts
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed four unused functions from `src/lib/utils.ts`.

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
- **Source:** DE-REC-031.

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Same `.find()` pattern as PB-066 but in the POC capacity summary component. Depends on whether the POC is promoted or removed.
- **Source:** DE-REC-036.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and usable. Minor visual issue. Defer until higher-priority UX work is complete.
- **Source:** EX-REC-036.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up but needs visual evaluation before broad application.
- **Source:** EX-REC-038.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Card-based or drag-connect interface is a polish item for when the connectivity hub sees regular use.
- **Source:** EX-REC-043.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene. Only worth addressing if PlanningGrid is refactored for other reasons.
- **Source:** EX-REC-042.

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
