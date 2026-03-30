# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups Phase 1 (PB-109) is complete. Phase 2 (PB-110, admin UI) is unblocked and ready for the Experience Agent. In parallel, the Delivery Agent should complete the stamtabel batch optimization (PB-117) and preferences user-scoping (PB-118), then pick up the two planning validation fixes (PB-119, PB-120). Phase 3 enforcement (PB-111) remains blocked on PB-110.

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
- **Status:** Ready
- **Why this matters now:** Unblocked by PB-109 (completed 2026-03-30). Required for user groups feature. Scrum Master request (SMI-015).
- **Scope notes:**
  - New "Gebruikersgroepen" tab in settings (admin only).
  - Create/edit/delete groups.
  - Multi-select departments per group.
  - Assign users to groups.
  - Follow existing settings tab patterns (StamtabelManager-style or custom).
- **Dependencies:** PB-109 (completed).
- **Definition of done:** Admin can manage user groups via the settings UI. All interactions have toast notifications and confirm dialogs for destructive actions. `npm run verify` passes.

### PB-117: Stamtabel import upsert — batch lookups instead of per-row queries

- **ID:** PB-117
- **Title:** Apply batch optimization to stamtabel upsert (same pattern as PB-113)
- **Problem / opportunity:** Stamtabel upsert in `src/app/api/import-sources/[id]/execute/route.ts` (lines 449–496) issues per-row `findUnique` + conditional `update`/`create`. For a 500-row chunk this means 500 sequential round-trips.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Direct follow-up to PB-113 (completed). Same code path, same fix pattern, different entity type.
- **Scope notes:**
  - Batch `findUnique` calls into a single `findMany({ where: { code: { in: chunkCodes } } })`.
  - Build a Map for O(1) lookups.
  - Use `createMany` for new records, individual updates for changed descriptions.
- **Dependencies:** None.
- **Definition of done:** Stamtabel upsert uses batch lookups and `createMany`. Same test pattern as PB-113. `npm run verify` passes.
- **Source:** DE-REC-052.

### PB-118: Preferences endpoint — scope to authenticated user

- **ID:** PB-118
- **Title:** Read userId from session instead of hardcoding "default" in preferences API
- **Problem / opportunity:** All GET/PUT/DELETE operations in `/api/preferences/route.ts` use `userId = "default"`. Multiple users share one preference store. No authentication check at all.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Multi-user auth is in place. Preferences are the last endpoint without proper user scoping.
- **Scope notes:**
  - Read userId from the NextAuth session.
  - When auth is not configured, fall back to "default" for backward compatibility.
  - Add session check so unauthenticated callers get 401.
- **Dependencies:** None.
- **Definition of done:** Preferences are per-user when auth is active. Unauthenticated callers get 401. Fallback to "default" when `NEXTAUTH_SECRET` is not set. `npm run verify` passes.
- **Source:** DE-REC-053.

### PB-119: Planning API — validate status against domain enum

- **ID:** PB-119
- **Title:** Add status enum validation to planning POST and bulk endpoints
- **Problem / opportunity:** In planning POST and bulk endpoints, `status` is accepted without validation. Arbitrary strings can be written to the database.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Small fix that closes a validation gap on the most-used write endpoints.
- **Scope notes:**
  - Import `PlanningStatus` from `src/domain/enums.ts`.
  - Validate that provided status is a valid enum value.
  - Return 400 with Dutch error message listing valid statuses.
- **Dependencies:** None.
- **Definition of done:** Invalid status values are rejected with a 400 and Dutch error message. `npm run verify` passes.
- **Source:** DE-REC-054.

### PB-120: Planning API — sickPercentage range validation

- **ID:** PB-120
- **Title:** Add 0–100 range check for sickPercentage on planning endpoints
- **Problem / opportunity:** `sickPercentage` is accepted without range validation. Values like -50 or 9999 will be stored.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Quick validation fix alongside PB-119. Same endpoints, complementary scope.
- **Scope notes:**
  - Add `if (sickPercentage !== undefined && (sickPercentage < 0 || sickPercentage > 100))` check.
  - Return 400 with Dutch error message.
- **Dependencies:** None.
- **Definition of done:** Out-of-range sickPercentage values are rejected with a 400. `npm run verify` passes.
- **Source:** DE-REC-055.

---

## Blocked / Needs Decision

### PB-111: User groups — enforcement on data routes

- **ID:** PB-111
- **Title:** Enforce Afdeling-based data filtering on drivers, planning, and capacity API routes
- **Problem / opportunity:** Phase 3 of user groups. Data routes must filter results based on the logged-in user's group departments.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Blocked
- **Blocked by:** PB-110 (admin UI needed so groups can be configured and tested).
- **Why this matters now:** The enforcement phase delivers the actual authorization filtering value.
- **Scope notes:**
  - Read the current user's group and allowed department IDs from the session/database.
  - Apply department filter to drivers, planning entries, and capacity queries.
  - Users with no group see all data (backward compatible).
  - Settings/stamtabellen remain unfiltered.
- **Dependencies:** PB-109 (completed), PB-110.
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
