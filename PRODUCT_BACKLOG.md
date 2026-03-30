# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** New Scrum Master inputs (SMI-012 through SMI-016) introduce auth hardening and user group management as the next initiative. The login restriction (PB-102) is a P1 security fix. Login page cleanup (PB-103) and masterdata documentation (PB-101) are quick wins. User groups (PB-104) is blocked pending scope decision (ESC-008). Scaling follow-ups (PB-105, PB-098) fill remaining capacity.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-102: Restrict Google login to pre-added users only

- **ID:** PB-102
- **Title:** Only allow login for users already added via admin panel
- **Owner:** Delivery Agent
- **Priority:** P1 Critical
- **Status:** Completed
- **Completed:** 2026-03-30
- **Implementation note:** Added `signIn` callback to NextAuth options in `src/lib/auth.ts`. Checks `prisma.user.findUnique({ where: { email } })` for OAuth sign-ins. Returns redirect to `/login?error=NietGeautoriseerd` if user not found, `/login?error=GeenEmailAdres` if no email available. Login page (`src/app/login/page.tsx`) reads error from URL search params and displays a styled Dutch error banner. Non-OAuth callbacks (session checks) pass through. Verify passes.
- **Source:** SMI-014.

### PB-103: Login page — show only Google + 'under construction' text

- **ID:** PB-103
- **Title:** Simplify login page to Google-only with under construction notice
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Completed:** 2026-03-30
- **Implementation note:** Removed Microsoft/Azure AD button from login page UI. Added Dutch "Deze applicatie is in ontwikkeling" notice with warning icon below the Google button. Backend provider config unchanged for future use. Verify passes.
- **Source:** SMI-016.

### PB-101: Stamtabellen documentation in masterdata.md

- **ID:** PB-101
- **Title:** Create masterdata.md with stamtabel field descriptions and relationships
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Completed:** 2026-03-30
- **Implementation note:** Created `masterdata.md` documenting all 22 Prisma models across 5 sections: stamtabellen (Employer, Department, Location, LeaveType, Skill, RosterProfile, RosterProfileDay), kernentiteiten (Driver, DriverSkill, DriverEmploymentRecord, DriverFunctionRecord, DriverRosterAssignment, PlanningEntry, Scenario), gebruikersbeheer (User, Account, Session, UserPreference), connectiviteitshub (ImportSource, ImportLog), plus a relationship diagram and cascade-gedrag overzicht. Dutch field descriptions, English technical names.
- **Source:** SMI-012.

### PB-105: Planning grid — integrate paginated data fetching

- **ID:** PB-105
- **Title:** Connect planning grid to paginated API for large driver sets
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Completed
- **Completed:** 2026-03-30
- **Implementation note:** Planning grid now fetches drivers in pages of 100. Pagination controls (first/prev/next/last) appear below the grid when >1 page exists. Total driver count and page position displayed. Page resets to 1 on scenario or date range change. All existing interactions preserved (virtual scrolling, drag-select, group headers, sticky columns, capacity summary). Capacity summary shows totals for current page only. Client-side name filter works within current page. Verify passes.
- **Follow-up:** Server-side search on for-range endpoint would improve the name filter for large datasets. Capacity summary could use a separate aggregation API for full-dataset totals.
- **Source:** EX-REC-044, SMI-011.

### PB-098: Scenario duplication batch processing

- **ID:** PB-098
- **Title:** Batch scenario duplication to reduce memory pressure at scale
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Completed
- **Completed:** 2026-03-30
- **Implementation note:** Replaced single-transaction bulk load with chunked processing (5,000 entries per chunk). Scenario is created first, then entries are copied in chunks using `skip`/`take` with `select` (only needed fields). If copying fails mid-way, the partially created scenario is cleaned up (cascade delete). Memory usage is now constant regardless of total entry count. Verify passes.
- **Source:** DE-REC-046, SMI-011.

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

### PB-102: Restrict Google login to pre-added users only

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-098: Scenario duplication batch processing

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-101: Stamtabellen documentation in masterdata.md

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-105: Planning grid — integrate paginated data fetching

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-103: Login page — show only Google + 'under construction' text

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-099: Batch import transactions into chunks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-100: Add date format validation to planning endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-096: Planning grid virtual scrolling

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-097: Drivers page pagination UI

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-093: Add server-side pagination to planning for-range API

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-094: Add server-side pagination to drivers list API

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-009: Add covering index for capacity aggregation query

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-092: Add CSV row count limit to import execution

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
- **Reason:** Functional and usable. Lower priority than auth and scaling work.
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
