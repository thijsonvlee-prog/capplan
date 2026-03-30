# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Two functional tracks advancing in parallel: (1) connectivity hub — CSV upload and column detection complete, import execution (PB-078) is next; (2) authentication — infrastructure complete (NextAuth.js + Google/Microsoft), login page (PB-081) is next, followed by admin panel (PB-079) and role enforcement (PB-082). Codebase healthy — 0 ESLint warnings, 0 typecheck errors. Next cycle: Experience Agent takes PB-081, Delivery Agent takes PB-078.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-081: Login page and session UI

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** Users need a login screen and visual session state (logged-in user display, logout button). No login UI exists.
- **Why this matters now:** Required for multi-user operation. Auth infrastructure (PB-080) is complete.
- **Scope notes:** Build a login page (`/login`) with provider sign-in buttons (Google, Microsoft). Add session indicator in the app header showing the logged-in user name and a logout action. Redirect unauthenticated users to login. All text in Dutch.
- **Dependencies:** PB-080 (completed).
- **Definition of done:** Login page renders with provider buttons. Successful login redirects to the app. Header shows logged-in user. Logout works. `npm run verify` passes.
- **Implementation note:** Use NextAuth.js client hooks (`useSession`, `signIn`, `signOut`). Auth config is in `src/lib/auth.ts`. SessionProvider already wraps the app via `AuthProvider` in root layout. Style with existing design tokens. Login page should feel consistent with the app's visual identity.
- **Source:** ESC-005, SMI-008.

### PB-078: CSV import execution — apply field mappings and insert data

- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** After uploading a CSV and detecting columns (PB-077), the system needs to actually execute the import: apply the configured field mappings, validate rows, and insert data into the target entity table.
- **Why this matters now:** SM directive (SMI-008). This completes the connectivity hub's core value proposition.
- **Scope notes:** Add an import execution endpoint that: reads the uploaded CSV, applies field mappings from the ImportSource config, validates each row against the target entity's required fields, inserts valid rows using `createMany`, and returns a summary (rows imported, rows skipped, errors). Target entities: chauffeurs, werkgevers, afdelingen, standplaatsen. Add an import history/log so users can see what was imported and when.
- **Dependencies:** PB-077 (completed).
- **Definition of done:** Users can upload a CSV, preview the mapping, execute the import, and see results. Import history is visible. `npm run verify` passes.
- **Implementation note:** Use `prisma.$transaction` for the batch insert. Validate all rows before inserting (fail-fast on structural errors, skip individual bad rows with error log). The CSV upload endpoint (`POST /api/import-sources/[id]/upload`) already returns parsed data with mapping validation. Consider adding an ImportLog model to track imports. The frontend upload UI in `ImportSourceManager.tsx` already shows preview rows and mapping validation. Per DE-REC-041: ensure (1) all rows are validated before any inserts, (2) clear error report with row-level detail, (3) `prisma.$transaction` wraps the entire import, (4) duplicate detection uses existing unique constraints.
- **Source:** SMI-008, DE-REC-041.

### PB-082: Role enforcement middleware

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The User model has roles (ADMIN, PLANNER, VIEWER) but they are not enforced. Auth infrastructure is in place, so API routes and pages can now enforce role-based access control.
- **Why this matters now:** Completes the user management feature set. Without enforcement, roles are decorative.
- **Scope notes:** Add middleware or route-level checks that enforce role permissions. Define a permission matrix (e.g., VIEWER = read-only, PLANNER = read + write planning, ADMIN = full access). Apply to API routes and page navigation.
- **Dependencies:** PB-080 (completed). Practically should wait until PB-081 (login page) is deployed so users actually have sessions. Schedule for the cycle after PB-081.
- **Definition of done:** API routes reject unauthorized requests with appropriate error. Pages redirect unauthorized users. Permission matrix documented. `npm run verify` passes.
- **Implementation note:** Auth config is in `src/lib/auth.ts`. Session includes `user.id` and `user.role`. Start with a simple helper function that checks session role against required role. Apply progressively to routes.
- **Source:** ESC-005, SMI-008.

---

## Blocked / Needs Decision

### PB-079: Admin panel — user management screen

- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (waiting on PB-081)
- **Problem / opportunity:** The Scrum Master wants an admin panel with user management. The User model exists in the database with roles (ADMIN, PLANNER, VIEWER) but no management UI exists.
- **Why this matters now:** Direct SM directive (SMI-008). Required for multi-user operation.
- **Scope notes:** Build a user list/management screen within the settings page (new "Gebruikers" tab). Show all users with name, email, role, last login. Allow admins to change user roles. Consider whether user deactivation is needed.
- **Dependencies:** PB-081 (login page must be complete first).
- **Definition of done:** Admin users can view all users and assign roles. `npm run verify` passes.
- **Implementation note:** Add as a new tab in the settings page, following the existing tab pattern. Use the existing User model fields. Auth infrastructure (PB-080) is complete.
- **Source:** SMI-008, ESC-005.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-076: Rewrite CLAUDE.md based on current application state
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Full rewrite of CLAUDE.md to reflect current codebase: updated file structure, design system (incorporated from DESIGN.md), auth infrastructure, component inventory, API routes, hooks, and config references. DESIGN.md kept in place as creative reference.

### PB-077: CSV file upload and column detection
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Added `POST /api/import-sources/[id]/upload` endpoint with CSV parsing (supports comma, semicolon, tab separators; quoted fields; BOM handling). Returns detected columns, preview rows, mapping validation, and unmapped columns. Frontend upload UI added to ImportSourceManager with file picker, results display, and mapping validation indicators. Added `CsvUploadResult` type and `api.importSources.upload()` client method. No external dependencies.

### PB-080: Auth infrastructure — NextAuth.js with Google/Microsoft provider
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Installed `next-auth` v4 and `@next-auth/prisma-adapter`. Added Account and Session models to Prisma schema with migration. Created auth config (`src/lib/auth.ts`) with Google and Azure AD providers (conditionally loaded from env vars), database sessions, and session callback that includes user ID and role. Added `AuthProvider` wrapper in root layout. Created NextAuth type augmentation for session.user.role.

### PB-074: Add `btn-danger` CSS class and replace inline button styles
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Added `.btn-danger` class to `globals.css`. Replaced inline class strings in `ConfirmDialog.tsx` and `documentatie/page.tsx`.

### PB-075: Memoize Map creation in DriverForm.tsx
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Wrapped employer, department, and location Map creations in `useMemo` with appropriate dependency arrays.

### PB-073: Remove remaining unused utility functions and enum
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed 6 unused functions from `utils.ts` and the unused `StamtabelType` enum from `enums.ts`.

---

## Deferred

### DE-REC-040: Optimize NextAuth session callback role lookup

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Worth addressing once auth is actively used with concurrent users, but not before the login page (PB-081) exists and is validated. Revisit after auth is in production use.
- **Source:** DE-REC-040.

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
