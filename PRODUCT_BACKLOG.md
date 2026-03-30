# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Two functional tracks are active: (1) connectivity hub — expanding from configuration to actual CSV import, and (2) authentication + user management — ESC-005 decided: NextAuth.js with Google/Microsoft provider. CLAUDE.md rewrite is also due (SMI-007). Codebase is healthy — 0 ESLint warnings, 0 typecheck errors.

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

### PB-080: Auth infrastructure — NextAuth.js with Google/Microsoft provider

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** No authentication exists. The Scrum Master chose NextAuth.js with external provider (Google/Microsoft) via ESC-005 Option B. This is the foundation for user management and role enforcement.
- **Why this matters now:** Unblocks the entire user management track (PB-081, PB-079, PB-082). Direct SM directive (SMI-008).
- **Scope notes:** Install and configure NextAuth.js (Auth.js) for Next.js App Router. Set up Google and/or Microsoft as identity providers. Connect to the existing User model in the database (adapter or manual sync). Configure session handling (JWT or database sessions). Add environment variables for provider credentials. Do NOT add role enforcement yet — that is PB-082.
- **Dependencies:** None.
- **Definition of done:** Users can log in via Google or Microsoft. Session is persisted. User record is created/matched in the database. `npm run verify` passes.
- **Implementation note:** Use the `next-auth` package (v5/Auth.js if stable, v4 if more reliable). The existing User model has `email`, `name`, `role` fields. Map provider profile to these. Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (and/or Microsoft equivalents) as env vars. Add a Prisma adapter or manual user upsert on sign-in.
- **Source:** ESC-005 (Option B chosen), SMI-008.

---

## Blocked / Needs Decision

### PB-081: Login page and session UI

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting on PB-080)
- **Problem / opportunity:** Users need a login screen and visual session state (logged-in user display, logout button). No login UI exists.
- **Why this matters now:** Required for multi-user operation. Depends on auth infrastructure being in place.
- **Scope notes:** Build a login page (`/login`) with provider sign-in buttons (Google, Microsoft). Add session indicator in the app header showing the logged-in user name and a logout action. Redirect unauthenticated users to login. All text in Dutch.
- **Dependencies:** PB-080 (auth infrastructure).
- **Definition of done:** Login page renders with provider buttons. Successful login redirects to the app. Header shows logged-in user. Logout works. `npm run verify` passes.
- **Implementation note:** Use NextAuth.js client hooks (`useSession`, `signIn`, `signOut`). Style with existing design tokens. Login page should feel consistent with the app's visual identity.
- **Source:** ESC-005, SMI-008.

### PB-079: Admin panel — user management screen

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting on PB-080, PB-081)
- **Problem / opportunity:** The Scrum Master wants an admin panel with user management. The User model exists in the database with roles (ADMIN, PLANNER, VIEWER) but no management UI exists.
- **Why this matters now:** Direct SM directive (SMI-008). Required for multi-user operation.
- **Scope notes:** Build a user list/management screen within the settings page (new "Gebruikers" tab). Show all users with name, email, role, last login. Allow admins to change user roles. Consider whether user deactivation is needed.
- **Dependencies:** PB-080 (auth infrastructure), PB-081 (login page).
- **Definition of done:** Admin users can view all users and assign roles. `npm run verify` passes.
- **Implementation note:** Add as a new tab in the settings page, following the existing tab pattern. Use the existing User model fields.
- **Source:** SMI-008, ESC-005.

### PB-078: CSV import execution — apply field mappings and insert data

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting on PB-077)
- **Problem / opportunity:** After uploading a CSV and detecting columns (PB-077), the system needs to actually execute the import: apply the configured field mappings, validate rows, and insert data into the target entity table.
- **Why this matters now:** SM directive (SMI-008). This completes the connectivity hub's core value proposition.
- **Scope notes:** Add an import execution endpoint that: reads the uploaded CSV, applies field mappings from the ImportSource config, validates each row against the target entity's required fields, inserts valid rows using `createMany`, and returns a summary (rows imported, rows skipped, errors). Target entities: chauffeurs, werkgevers, afdelingen, standplaatsen. Add an import history/log so users can see what was imported and when.
- **Dependencies:** PB-077 (CSV upload).
- **Definition of done:** Users can upload a CSV, preview the mapping, execute the import, and see results. Import history is visible. `npm run verify` passes.
- **Implementation note:** Use `prisma.$transaction` for the batch insert. Validate all rows before inserting (fail-fast on structural errors, skip individual bad rows with error log). Consider adding an ImportLog model to track imports.
- **Source:** SMI-008.

### PB-082: Role enforcement middleware

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Blocked (waiting on PB-080)
- **Problem / opportunity:** The User model has roles (ADMIN, PLANNER, VIEWER) but they are not enforced. Once auth is in place, API routes and pages need role-based access control.
- **Why this matters now:** Completes the user management feature set. Without enforcement, roles are decorative.
- **Scope notes:** Add middleware or route-level checks that enforce role permissions. Define a permission matrix (e.g., VIEWER = read-only, PLANNER = read + write planning, ADMIN = full access). Apply to API routes and page navigation.
- **Dependencies:** PB-080 (auth infrastructure).
- **Definition of done:** API routes reject unauthorized requests with appropriate error. Pages redirect unauthorized users. Permission matrix documented. `npm run verify` passes.
- **Implementation note:** Start with a simple helper function that checks session role against required role. Apply progressively to routes. Do not over-engineer — a simple role check per route is sufficient.
- **Source:** ESC-005, SMI-008.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-075: Memoize Map creation in DriverForm.tsx
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Wrapped employer, department, and location Map creations in `useMemo` with appropriate dependency arrays.

### PB-073: Remove remaining unused utility functions and enum
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed 6 unused functions from `utils.ts` and the unused `StamtabelType` enum from `enums.ts`.

### PB-074: Add `btn-danger` CSS class and replace inline button styles
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Added `.btn-danger` class to `globals.css`. Replaced inline class strings in `ConfirmDialog.tsx` and `documentatie/page.tsx`.

### PB-016: Connectivity hub — admin screen for import source configuration
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Working admin screen for managing CSV import sources with field mapping.

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
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Stale or superseded items should be removed or deferred.
- Overlapping items should be merged.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
