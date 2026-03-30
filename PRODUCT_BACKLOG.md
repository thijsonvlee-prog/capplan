# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Authentication track fully complete (infrastructure, login, admin panel, role enforcement, role-aware UI, setup documentation, session optimization). Import pipeline fully operational with upsert support. Codebase healthy — 0 ESLint warnings, 0 typecheck errors. All scheduled items completed. Next focus: codebase quality, performance optimization, and potential new features per Delivery/Experience recommendations.

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

### PB-091: Add upsert mode to CSV import execution
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Import execute endpoint now accepts a `mode` parameter: `"create"` (default, existing behavior) or `"upsert"` (update existing records matched by unique key). Stamtabellen match on `code`, drivers match on `employeeNumber`. UI shows radio toggle for mode selection before executing. Import log and results distinguish created vs. updated vs. skipped counts. Schema migration adds `updatedRows` column to `ImportLog`.

### PB-090: Cache user role in NextAuth session to avoid per-request DB query
- **Completed:** 2026-03-30
- **Owner:** Delivery Agent
- **Summary:** Removed redundant `findUnique` query from the NextAuth session callback. The PrismaAdapter already provides the full user record (including `role`) via `include: { user: true }` — the session callback now reads `role` directly from the adapter-provided user object. Eliminates one DB query per authenticated request.

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
