# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Authentication track complete. Role enforcement (PB-082) and fieldMappings validation (PB-083) delivered. Codebase healthy — 0 ESLint warnings, 0 typecheck errors.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready._

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-082: Role enforcement middleware
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** `requireRole()` helper in `api-route-utils.ts` checks session role against a VIEWER < PLANNER < ADMIN hierarchy. Applied to all write API routes: ADMIN required for settings, users, import-sources, roster-profiles; PLANNER required for drivers, planning, scenarios. Returns 401 (not logged in) or 403 (insufficient role) with Dutch error messages. Enforcement skipped when `NEXTAUTH_SECRET` is not set (dev/preview). CLAUDE.md updated to reflect enforcement is live.

### PB-083: Validate fieldMappings structure in import-sources API
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** New `validateFieldMappings()` helper in `api-route-utils.ts` validates that fieldMappings is a non-null, non-array object with non-empty string keys and values. Also validates target fields against a whitelist per entity (drivers: firstName/lastName/employeeNumber/licenseTypes; stamtabellen: code/description). Applied to POST and PUT routes. Clear Dutch error messages for each validation failure.

### PB-079: Admin panel — user management screen
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** New "Gebruikers" tab in the settings page with user list and role management. Shows user avatar, name, email, role badge (Admin/Planner/Kijker), and member-since date. Clickable role badges open a dropdown with confirmation dialog for role changes. API routes: GET /api/users (list), PUT /api/users/[id] (update role). All text in Dutch. Design uses product-grade card layout with semantic role badges.

### PB-081: Login page and session UI
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Login page at `/login` with split-panel layout (brand panel + sign-in panel), Google and Microsoft provider buttons with loading states, NextAuth middleware for route protection, session indicator in header with avatar/initials + name + logout button. All text in Dutch.

### PB-078: CSV import execution — apply field mappings and insert data
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Full import pipeline: upload → preview → validate → execute → results summary → import history. New `ImportLog` model with migration. `prisma.$transaction` for drivers, `createMany` with `skipDuplicates` for stamtabel entities. CSV parser extracted to shared `src/lib/csv-parser.ts`. Frontend: execute button, result display with row-level errors, import history panel per source.

### PB-076: Rewrite CLAUDE.md based on current application state
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Full rewrite of CLAUDE.md to reflect current codebase: updated file structure, design system, auth infrastructure, component inventory, API routes, hooks, and config references.

### PB-080: Auth infrastructure — NextAuth.js with Google/Microsoft provider
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** NextAuth.js v4 with Prisma adapter, Google and Azure AD providers, database sessions, session callback with user ID and role. AuthProvider in root layout.

---

## Deferred

### EX-REC-044: Add user identity to sidebar bottom section

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Good idea aligned with DESIGN.md section 7.8, but not urgent. Can be picked up as a quick win in a future cycle or bundled with other sidebar work.
- **Source:** EX-REC-044.

### DE-REC-042: Extend import execution with upsert mode

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Valuable for ongoing data synchronization, but initial import (create-only) is sufficient for the MVP. Revisit when users report needing update capability.
- **Source:** DE-REC-042.

### DE-REC-040: Optimize NextAuth session callback role lookup

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Worth addressing once auth is actively used with concurrent users. Not a bottleneck at current scale.
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
- **Reason:** Low user impact. Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low. Low urgency.
- **Source:** DE-REC-031.

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Depends on whether the POC capacity summary is promoted or removed.
- **Source:** DE-REC-036.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and usable. Minor visual issue.
- **Source:** EX-REC-036.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up but needs visual evaluation.
- **Source:** EX-REC-038.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Polish item.
- **Source:** EX-REC-043.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.
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
