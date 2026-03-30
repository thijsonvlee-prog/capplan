# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Server-side search (PB-106) and full-dataset capacity totals (PB-108) are now delivered. Next priority is fixing the orphan user issue (PB-107). User groups (PB-104) remain blocked on ESC-008.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-107: Prevent PrismaAdapter from auto-creating orphan User records


- **ID:** PB-107
- **Title:** Stop PrismaAdapter from creating User records for rejected sign-ins
- **Problem / opportunity:** PrismaAdapter creates a User record before the `signIn` callback rejects unknown users (PB-102). This leaves orphan User rows in the database that appear in the admin panel's user list.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Direct follow-up to the P1 login restriction. Orphan users in the admin panel are confusing and undermine the login restriction feature.
- **Scope notes:** Override PrismaAdapter's `createUser` method to check if the user already exists before creating. Alternatively, prevent auto-creation entirely and rely on the existing admin-created user flow. Test carefully — PrismaAdapter internals vary between versions.
- **Dependencies:** PB-102 (completed).
- **Definition of done:** No new User records are created when an unknown Google account attempts to sign in. Existing orphan records are not automatically cleaned (separate concern). Verify passes.
- **Source:** DE-REC-047.

---

## Blocked / Needs Decision

### PB-104: User groups with authorization filters

- **ID:** PB-104
- **Title:** Implement user group management with data visibility filters
- **Problem / opportunity:** The Scrum Master wants user groups where each group has authorization filters that control which data is visible to members (not functionality — that remains role-based). No UserGroup model or group-related code exists yet.
- **Owner:** To be determined after scope decision
- **Priority:** P2 High
- **Status:** Blocked
- **Blocked by:** ESC-008 — scope and phasing decision needed before implementation can start.
- **Why this matters now:** Direct Scrum Master request. Enables multi-tenant-like data separation within the application.
- **Scope notes:** Pending ESC-008 decision. Will be broken into phased backlog items after scope is defined.
- **Dependencies:** ESC-008 decision.
- **Source:** SMI-015.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-106: Planning grid — server-side search for paginated mode

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30
- **Implementation note:** API: added `search` query parameter to `/api/planning/for-range` with case-insensitive matching on firstName, lastName, and employeeNumber. Frontend: replaced client-side filter with debounced (300ms) server-side search. Page resets to 1 on search change.

### PB-108: Capacity summary — full-dataset totals via aggregation API

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30
- **Implementation note:** CapacitySummaryRow now receives pre-aggregated capacity data from `/api/planning/capacity` instead of computing from page-scoped drivers. Shows full-dataset totals regardless of pagination or search.

### PB-102: Restrict Google login to pre-added users only

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-103: Login page — show only Google + 'under construction' text

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-105: Planning grid — integrate paginated data fetching

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-098: Scenario duplication batch processing

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-101: Stamtabellen documentation in masterdata.md

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
- **Reason:** Functional and usable. Lower priority than search and capacity follow-ups.
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
