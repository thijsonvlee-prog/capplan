# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Authentication track fully complete (infrastructure, login, admin panel, role enforcement, role-aware UI, setup documentation). Import pipeline operational. Codebase healthy — 0 ESLint warnings, 0 typecheck errors. Next focus: polish auth experience (sidebar user identity), optimize auth performance (session role caching), and extend import capabilities (upsert mode). No new code items this cycle — latest Scrum Master input (SMI-010: Google OAuth redirect_uri_mismatch) was a configuration issue resolved via existing documentation.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-090: Cache user role in NextAuth session to avoid per-request DB query

- **ID:** PB-090
- **Title:** Optimize session callback to eliminate extra role lookup query
- **Problem / opportunity:** The NextAuth session callback in `src/lib/auth.ts` queries the database for the user's role on every session access. With role enforcement active on all write routes (`requireRole()`), this adds one extra `findUnique` query per authenticated mutation request.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Role enforcement is now active on all write routes. Every authenticated write request triggers an extra DB query. While acceptable at current scale, this is a straightforward optimization that improves request latency.
- **Scope notes:** Either store the role in the JWT/session token so it doesn't need to be re-fetched, or extend the Prisma adapter's user response to include role. Ensure role changes (from the admin panel) are reflected within a reasonable timeframe — a session refresh or next login is acceptable.
- **Dependencies:** None.
- **Definition of done:** Authenticated API requests no longer trigger a separate `findUnique` for role lookup. Role is still available in the session. Role changes take effect on next session refresh. Passes `npm run verify`.
- **Implementation note:** The simplest approach is likely to include `role` in the JWT callback and pass it through to the session callback. This avoids a DB hit per request while still being refreshed on token rotation.
- **Source:** DE-REC-040.

### PB-091: Add upsert mode to CSV import execution

- **ID:** PB-091
- **Title:** Allow CSV imports to update existing records (upsert mode)
- **Problem / opportunity:** The current import execution only creates new records. For stamtabel entities, `skipDuplicates` silently skips rows with existing codes. Users who maintain external data sources need to update existing records via CSV import (e.g., changing a department description).
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Natural follow-up to the import pipeline (PB-078). Users who regularly sync data from external systems will need this capability quickly.
- **Scope notes:** Add an optional `mode` parameter to the execute endpoint: `"create"` (current default behavior) and `"upsert"` (update existing records matched by unique key — typically `code` for stamtabellen, `employeeNumber` for drivers). The UI should offer a toggle or dropdown to select the mode before executing. Import log should distinguish created vs. updated rows in the summary.
- **Dependencies:** PB-078 (completed).
- **Definition of done:** Users can choose between create-only and upsert mode when executing an import. Upsert correctly matches existing records by unique key and updates fields. Import log shows created/updated/skipped counts. Passes `npm run verify`.
- **Implementation note:** Upsert logic per entity: stamtabellen match on `code`, drivers match on `employeeNumber`. Use Prisma `upsert` or a find-then-update pattern within the transaction. Be careful with the driver entity — upsert should only update mapped fields, not overwrite unmapped fields with defaults.
- **Source:** DE-REC-042.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-089: Add user identity to sidebar bottom section
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Sidebar bottom section now shows logged-in user's name (or email), role icon+label, and version text. When auth is not configured, shows version only. Uses `useSession()` with role config consistent with UserManager.

### PB-088: Auth environment setup documentation
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Created `AUTH_SETUP.md` with step-by-step guidance for configuring authentication in Vercel.

### PB-086: JSON body parsing protection
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Added `parseJsonBody()` helper applied to all 23 POST/PUT routes.

### PB-084: Frontend role-aware UI
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Created `useUserRole()` hook. VIEWER users see no write controls. Non-ADMIN users cannot see settings write controls.

### PB-085: Settings tab bar responsive treatment
- **Completed:** 2026-03-30
- **Owner:** Experience Agent
- **Summary:** Horizontal scroll on settings tabs for narrow viewports.

### PB-087: Fix server error — conditional auth middleware
- **Completed:** 2026-03-30
- **Owner:** Product Owner Agent (corrective fix)
- **Summary:** Made middleware conditional on `NEXTAUTH_SECRET` presence.

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
