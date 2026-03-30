# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups with Afdeling-based authorization filters (ESC-008 decided). Phase 1 (data model + API) is ready for the Delivery Agent. Import batch optimization (PB-113) is the next high-priority technical item. Small hardening fixes (PB-114, PB-115, PB-116) can be picked up alongside larger work.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-109: User groups — data model + API routes

- **ID:** PB-109
- **Title:** Create UserGroup data model, migration, and CRUD API routes
- **Problem / opportunity:** ESC-008 decided: implement user groups with single-dimension Afdeling (Department) filtering. This is Phase 1 — the data foundation.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Direct Scrum Master request. Enables data visibility separation between organizational units. Unblocked by ESC-008 decision.
- **Scope notes:**
  - Create Prisma models: `UserGroup` (id, name, createdAt, updatedAt), `UserGroupDepartment` (userGroupId, departmentId — allowed departments for the group), add `userGroupId` field to `User` model (nullable, FK to UserGroup).
  - Create migration.
  - Create API routes: `GET/POST /api/user-groups`, `GET/PUT/DELETE /api/user-groups/[id]`. Include department list and member count in responses.
  - API routes require ADMIN role.
  - All error messages in Dutch.
  - Follow existing API patterns from `api-route-utils.ts`.
- **Dependencies:** None.
- **Definition of done:** Migration created, API routes working with correct role enforcement, `npm run verify` passes.
- **Implementation note:** A user belongs to exactly one group (or no group — ungrouped users see all data). Filter enforcement comes in Phase 3 (PB-111).

### PB-113: Import execute — batch lookups instead of per-row queries

- **ID:** PB-113
- **Title:** Replace sequential per-row findFirst + create/update with batched operations in import execute
- **Problem / opportunity:** Each row in a 500-row import chunk triggers a separate `tx.driver.findFirst()` + `tx.driver.update()`/`create()`. For 500 rows this means 500–1000 sequential round-trips to Neon. At scale (10,000 rows), import takes minutes.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Import is a user-facing feature with 10,000-row capacity. Current performance degrades significantly at scale.
- **Scope notes:**
  - Batch `findFirst` calls into a single `findMany({ where: { employeeNumber: { in: chunkNumbers } } })`.
  - Build a Map of existing drivers.
  - Use `createMany` for new drivers, individual updates for upserts.
  - Preserve per-row error reporting (partial success within a chunk must still work).
- **Dependencies:** None.
- **Definition of done:** Import of 500+ rows completes in under 10 seconds. Error reporting preserved. `npm run verify` passes.
- **Source:** DE-REC-049.

### PB-114: Login page — handle OAuthAccountNotLinked error

- **ID:** PB-114
- **Title:** Add Dutch error message for OAuthAccountNotLinked on login page
- **Problem / opportunity:** The `OAuthAccountNotLinked` error code is not handled on the login page. Users with multiple OAuth providers who hit this edge case see a generic error.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Small fix that completes the login error handling story. Quick win.
- **Scope notes:** Add `OAuthAccountNotLinked` to the login page error message map with Dutch text.
- **Dependencies:** None.
- **Definition of done:** Login page shows clear Dutch message for this error type. `npm run verify` passes.
- **Source:** DE-REC-048.

### PB-115: PlanningGrid — memoize groupDrivers call

- **ID:** PB-115
- **Title:** Wrap groupDrivers() in useMemo in PlanningGrid
- **Problem / opportunity:** `groupDrivers()` is called on every render without memoization. Builds new Map instances and iterates all drivers on each render, including during scroll.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Easy win, directly improves scroll performance for large driver lists. Same memoization pattern already used elsewhere in PlanningGrid.
- **Scope notes:** Wrap in `useMemo` with dependencies `[sortedDrivers, groupBy, employers, departments, locations]`.
- **Dependencies:** None.
- **Definition of done:** `groupDrivers` is memoized. No visual or functional regressions. `npm run verify` passes.
- **Source:** DE-REC-050.

### PB-116: Capacity endpoint — add date validation and length limit

- **ID:** PB-116
- **Title:** Add date format validation and length cap to /api/planning/capacity
- **Problem / opportunity:** The capacity endpoint accepts comma-separated dates without format validation or length limit, unlike the `for-range` endpoint which has both.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Small fix that closes a validation gap between related endpoints. Prevents oversized queries.
- **Scope notes:** Add `validateDateFormats(dateList)` and `dateList.length > 366` check, consistent with `for-range` pattern.
- **Dependencies:** None.
- **Definition of done:** Invalid dates and oversized requests return 400 with Dutch error message. `npm run verify` passes.
- **Source:** DE-REC-051.

---

## Blocked / Needs Decision

### PB-110: User groups — admin UI in settings

- **ID:** PB-110
- **Title:** Create Gebruikersgroepen tab in settings for group management
- **Problem / opportunity:** Phase 2 of user groups. Admin needs a UI to create groups, assign departments, and assign users to groups.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked
- **Blocked by:** PB-109 (data model + API must exist first).
- **Why this matters now:** Required for user groups feature. Scrum Master request.
- **Scope notes:**
  - New "Gebruikersgroepen" tab in settings (admin only).
  - Create/edit/delete groups.
  - Multi-select departments per group.
  - Assign users to groups.
  - Follow existing settings tab patterns (StamtabelManager-style or custom).
- **Dependencies:** PB-109.
- **Definition of done:** Admin can manage user groups via the settings UI. All interactions have toast notifications and confirm dialogs for destructive actions. `npm run verify` passes.

### PB-111: User groups — enforcement on data routes

- **ID:** PB-111
- **Title:** Enforce Afdeling-based data filtering on drivers, planning, and capacity API routes
- **Problem / opportunity:** Phase 3 of user groups. Once groups exist and have department assignments, data routes must filter results based on the logged-in user's group.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Blocked
- **Blocked by:** PB-110 (admin UI needed so groups can actually be configured and tested).
- **Why this matters now:** The enforcement phase is what delivers the actual authorization filtering value.
- **Scope notes:**
  - Read the current user's group and allowed department IDs from the session/database.
  - Apply department filter to drivers, planning entries, and capacity queries.
  - Users with no group see all data (backward compatible).
  - Settings/stamtabellen remain unfiltered.
- **Dependencies:** PB-109, PB-110.
- **Definition of done:** Users in a group only see drivers/planning/capacity for their group's departments. Ungrouped users see everything. `npm run verify` passes.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-107: Prevent PrismaAdapter from auto-creating orphan User records

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-106: Planning grid — server-side search for paginated mode

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-108: Capacity summary — full-dataset totals via aggregation API

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

---

## Deferred

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014 and DE-REC-030. Schedule when capacity allows.
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
- **Reason:** Functional and usable. Lower priority than user groups feature.
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
