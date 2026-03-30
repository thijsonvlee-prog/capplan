# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups all 3 phases (PB-109, PB-110, PB-111) are complete. Stamtabel batch optimization (PB-117), preferences user-scoping (PB-118), and planning validation (PB-119, PB-120) are all shipped. No active Delivery Agent tasks remain — see Recommendations for next priorities.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-110: User groups — admin UI in settings

- **ID:** PB-110
- **Title:** Create Gebruikersgroepen tab in settings for group management
- **Problem / opportunity:** Phase 2 of user groups. Admin needs a UI to create groups, assign departments, and assign users to groups.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Why this matters now:** Unblocked by PB-109 (completed 2026-03-30). Required for user groups feature. Scrum Master request (SMI-015).
- **Scope notes:**
  - New "Gebruikersgroepen" tab in settings (admin only).
  - Create/edit/delete groups.
  - Multi-select departments per group.
  - Assign users to groups.
  - Follow existing settings tab patterns (StamtabelManager-style or custom).
- **Dependencies:** PB-109 (completed).
- **Definition of done:** Admin can manage user groups via the settings UI. All interactions have toast notifications and confirm dialogs for destructive actions. `npm run verify` passes.

_No items ready for next cycle._

---

## Blocked / Needs Decision

_No blocked items._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-111: User groups — enforcement on data routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added `getAllowedDepartmentIds()` and `driverDepartmentFilter()` helpers to `api-route-utils.ts`. Applied department-based filtering to GET routes: `/api/drivers`, `/api/planning/for-range`, `/api/planning/capacity`. Users in a group only see drivers with function records matching the group's departments. Ungrouped users and unauthenticated environments see all data (backward compatible).

### PB-117: Stamtabel import upsert — batch lookups

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Replaced per-row `findUnique` + `create`/`update` with batch `findMany` + Map lookup + `createMany` for new records. Same pattern as PB-113 for drivers. Includes fallback to individual creates on batch failure for per-row error reporting.

### PB-118: Preferences endpoint — scope to authenticated user

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added `resolveUserId()` helper that reads user ID from NextAuth session. All three handlers (GET/PUT/DELETE) now use the authenticated user's ID. Falls back to "default" when `NEXTAUTH_SECRET` is not set. Returns 401 for unauthenticated requests when auth is active.

### PB-119: Planning API — validate status against domain enum

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added status validation against `PlanningStatus` enum values in both `/api/planning` POST and `/api/planning/bulk` POST. Returns 400 with Dutch error message listing valid statuses.

### PB-120: Planning API — sickPercentage range validation

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added 0–100 range check for `sickPercentage` in both `/api/planning` POST and `/api/planning/bulk` POST. Returns 400 with Dutch error message.

### PB-110: User groups — admin UI in settings

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30
- **Implementation note:** New "Gebruikersgroepen" tab in settings (admin only). Card-based group list with expandable detail panels showing departments and members. Modal editor for create/edit with department multi-select and user assignment. Users API extended to support `userGroupId` updates. All interactions have toast notifications and confirm dialogs.

### PB-109: User groups — data model + API routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-113: Import execute — batch lookups instead of per-row queries

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-114: Login page — handle OAuthAccountNotLinked error

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-115: PlanningGrid — memoize groupDrivers call

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-116: Capacity endpoint — date validation and length limit

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

### PB-107: Prevent PrismaAdapter from auto-creating orphan User records

- **Status:** Completed
- **Owner:** Delivery Agent
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
