# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups Phase 1 (PB-109) is complete — data model, migration, and CRUD API routes are deployed. PB-110 (admin UI) is unblocked and ready for the Experience Agent. Import batch optimization (PB-113) and all hardening fixes (PB-114, PB-115, PB-116) are complete. Stamtabel import upsert batching (DE-REC-052) and preferences authentication (DE-REC-053) are the next high-priority technical items.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready. See Blocked / Needs Decision for upcoming work._

---

## Blocked / Needs Decision

### PB-110: User groups — admin UI in settings

- **ID:** PB-110
- **Title:** Create Gebruikersgroepen tab in settings for group management
- **Problem / opportunity:** Phase 2 of user groups. Admin needs a UI to create groups, assign departments, and assign users to groups.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Unblocked by:** PB-109 (completed 2026-03-30).
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

### PB-109: User groups — data model + API routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Created `UserGroup` and `UserGroupDepartment` Prisma models, added `userGroupId` FK to `User` model. Migration `20260330400000_add_user_groups` created. API routes at `/api/user-groups` and `/api/user-groups/[id]` with GET/POST/PUT/DELETE, all ADMIN-gated. Responses include department IDs and member count. Department FK validation on create/update. DELETE cascades department links and sets user `userGroupId` to null.

### PB-113: Import execute — batch lookups instead of per-row queries

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Replaced per-row `findFirst` with single `findMany` per chunk, building a Map for O(1) lookups. New drivers use `createMany` for batch insert. Falls back to individual creates on batch failure to preserve per-row error reporting. Updates remain individual (different data per row). Reduces round-trips from 500–1000 to ~2 + update count per chunk.

### PB-114: Login page — handle OAuthAccountNotLinked error

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added `OAuthAccountNotLinked` to error message map with Dutch text.

### PB-115: PlanningGrid — memoize groupDrivers call

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Wrapped `groupDrivers()` in `useMemo` with `[sortedDrivers, groupBy, employers, departments, locations]` dependencies.

### PB-116: Capacity endpoint — date validation and length limit

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added `validateDateFormats(dateList)`, empty check, and `dateList.length > 366` cap. Consistent with `for-range` endpoint pattern.

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
