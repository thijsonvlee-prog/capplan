# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups (SMI-015) are fully shipped across all 3 phases. Authorization model is complete for list endpoints. One security gap remains: individual-access routes (`/api/drivers/[id]`, `/api/planning` by driverId) do not enforce group filtering (DE-REC-056). This is the top priority for the next cycle.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-121: User group enforcement — individual-access routes

- **ID:** PB-121
- **Title:** Apply department filtering to planning GET (by driverId) and driver [id] GET routes
- **Problem / opportunity:** PB-111 applied user group filtering to list endpoints (`/api/drivers`, `/api/planning/for-range`, `/api/planning/capacity`). However, `/api/planning` GET (by driverId) and `/api/drivers/[id]` GET do not enforce filtering. A user could access a specific driver's data by ID even if the driver is outside their group's departments.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Security gap. Completes the authorization coverage started in PB-111. Same proven pattern — low risk, small effort.
- **Scope notes:**
  - Apply `getAllowedDepartmentIds()` + `driverDepartmentFilter()` to `/api/drivers/[id]` GET.
  - Apply equivalent check to `/api/planning` GET when queried by driverId.
  - Return 404 (not 403) when the driver exists but is outside the user's scope, to avoid leaking existence information.
- **Dependencies:** None.
- **Definition of done:** Individual-access routes enforce the same department filtering as list routes. `npm run verify` passes.
- **Source:** DE-REC-056.

### PB-122: Capacity endpoint — relation-based user group filtering

- **ID:** PB-122
- **Title:** Optimize capacity endpoint user group filtering to use Prisma relation filter instead of driver ID pre-fetch
- **Problem / opportunity:** The current PB-111 implementation in `/api/planning/capacity` fetches all driver IDs in the user's departments (`findMany` + `select: { id: true }`), then passes them as `driverId: { in: [...] }`. For large organizations this loads thousands of IDs into memory and creates a large IN clause.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Scalability improvement for the capacity endpoint. Low risk — Prisma supports relation filters in `groupBy` where clauses.
- **Scope notes:**
  - Replace the driver ID pre-fetch with a Prisma relation filter: `driver: { functionRecords: { some: { departmentId: { in: allowedDeptIds } } } }` directly in the `groupBy` where clause.
  - Verify query plan with representative data.
- **Dependencies:** None.
- **Definition of done:** Capacity endpoint no longer pre-fetches driver IDs for group filtering. Same results, fewer queries. `npm run verify` passes.
- **Source:** DE-REC-057.

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

### PB-110: User groups — admin UI in settings

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-109: User groups — data model + API routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-117: Stamtabel import upsert — batch lookups

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-118: Preferences endpoint — scope to authenticated user

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-119: Planning API — validate status against domain enum

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-120: Planning API — sickPercentage range validation

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
- **Reason:** Functional and usable. Lower priority than security and scalability work.
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

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes (< 20 users). Only relevant if user counts grow significantly.
- **Source:** EX-REC-044.

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
