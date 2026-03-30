# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Authentication track fully complete (infrastructure, login, admin panel, role enforcement, role-aware UI, setup documentation). Import pipeline operational. API robustness improved (JSON parsing protection). Codebase healthy — 0 ESLint warnings, 0 typecheck errors. No active Ready items — all scheduled work completed. Next focus: deferred items from the backlog or new recommendations.

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

### PB-088: Auth environment setup documentation
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Created `AUTH_SETUP.md` with step-by-step guidance for configuring authentication in Vercel. Covers all required environment variables, `NEXTAUTH_SECRET` generation, Google OAuth setup (Cloud Console), Azure AD setup (Azure Portal), verification steps, role overview, behavior without auth, and troubleshooting. Written in Dutch for the deployment administrator.

### PB-086: JSON body parsing protection
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Added `parseJsonBody()` helper to `api-route-utils.ts` that wraps `request.json()` and returns `{ data, error }`. Applied to all 23 POST/PUT API routes. Malformed JSON now returns 400 with `{ error: "Ongeldige JSON in verzoek" }` instead of a generic 500 error.

### PB-084: Frontend role-aware UI
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Created `useUserRole()` hook exposing role-based permissions. VIEWER users no longer see create/edit/delete buttons on planning, drivers, or scenarios. Non-ADMIN users cannot see settings write controls or the "Gebruikers" tab. All actions remain visible when auth is not configured (development mode).

### PB-085: Settings tab bar responsive treatment
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Added horizontal scroll with hidden scrollbar to `.settings-tabs` for narrow viewports. Tabs no longer wrap or clip on screens down to 768px.

### PB-087: Fix server error — conditional auth middleware
- **Completed:** 2026-03-30
- **Owner:** Product Owner Agent (corrective fix)
- **Summary:** The NextAuth middleware unconditionally required `NEXTAUTH_SECRET`, causing a server error on all dashboard routes when auth was not configured. Fixed by making the middleware conditional.

### PB-082: Role enforcement middleware
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** `requireRole()` helper enforces VIEWER < PLANNER < ADMIN hierarchy on all write API routes.

### PB-083: Validate fieldMappings structure in import-sources API
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** `validateFieldMappings()` validates structure and target fields per entity.

### PB-079: Admin panel — user management screen
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** "Gebruikers" tab in settings with user list, role badges, and role change functionality.

### PB-081: Login page and session UI
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Login page with split-panel layout, provider buttons, route protection middleware, session indicator in header.

### PB-078: CSV import execution
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Full import pipeline with upload, preview, validate, execute, results summary, and import history.

### PB-080: Auth infrastructure — NextAuth.js
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** NextAuth.js v4 with Prisma adapter, Google and Azure AD providers, database sessions.

---

## Deferred

### EX-REC-044: Add user identity to sidebar bottom section

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Good idea aligned with DESIGN.md section 7.8. Auth is confirmed needed. Can be picked up as a quick win once PB-084 (role-aware UI) is complete.
- **Source:** EX-REC-044.

### DE-REC-042: Extend import execution with upsert mode

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Valuable for ongoing data synchronization, but initial import (create-only) is sufficient for MVP. Revisit when users report needing update capability.
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
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
