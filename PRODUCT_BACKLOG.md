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
- **Problem / opportunity:** Currently, PrismaAdapter auto-creates a new User record on first Google login with default PLANNER role. Anyone with a Google account can access the application. Only users explicitly added by an admin should be allowed to log in.
- **Owner:** Delivery Agent
- **Priority:** P1 Critical
- **Status:** Ready
- **Why this matters now:** Security gap — unauthorized users can gain PLANNER access by simply logging in with any Google account.
- **Scope notes:** Add a `signIn` callback in `src/lib/auth.ts` that checks whether the user's email already exists in the User table. If not, reject the sign-in with a clear message. The admin must first create the user record via the admin panel before they can log in. Do not auto-create User records on first login. Ensure the error is visible to the rejected user (NextAuth error page or redirect with message).
- **Dependencies:** None.
- **Definition of done:** Only pre-existing users (added via admin panel) can successfully authenticate via Google. New unknown Google accounts are rejected with a Dutch error message. Verify passes.
- **Implementation note:** Add `signIn` callback to NextAuth options in `src/lib/auth.ts`. Check `prisma.user.findUnique({ where: { email } })`. Return `false` or an error URL if user not found. Test with both existing and non-existing users.
- **Source:** SMI-014.

### PB-103: Login page — show only Google + 'under construction' text

- **ID:** PB-103
- **Title:** Simplify login page to Google-only with under construction notice
- **Problem / opportunity:** The login page currently shows both Google and Microsoft login buttons. The Scrum Master wants only Google visible, and a visible 'under construction' text on the page.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Direct Scrum Master request. Quick UI change that aligns the login page with current product state.
- **Scope notes:** Hide the Microsoft/Azure AD login button from the login page UI (keep the backend provider config intact for future use). Add a visible "Under construction" text/banner on the login page. All text in Dutch. Keep the existing visual design.
- **Dependencies:** None.
- **Definition of done:** Login page shows only Google button. "Under construction" text is visible. Microsoft button is hidden. Verify passes.
- **Implementation note:** Modify `src/app/login/page.tsx`. Conditionally hide Microsoft button or hardcode Google-only for now. Add a Dutch "Under construction" notice (e.g., "Deze applicatie is in ontwikkeling" or simply "Under construction" if the SM prefers English for this label).
- **Source:** SMI-016.

### PB-101: Stamtabellen documentation in masterdata.md

- **ID:** PB-101
- **Title:** Create masterdata.md with stamtabel field descriptions and relationships
- **Problem / opportunity:** No central documentation exists describing all stamtabellen (master data tables), their fields, field specifications, and relationships between them. This makes onboarding and data governance harder.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Direct Scrum Master request. Supports data governance and developer onboarding.
- **Scope notes:** Create `masterdata.md` in the project root. Document all stamtabellen (Employer, Department, Location, LeaveType, Skill, RosterProfile, Function) with: table name, all fields with types and constraints, relationships to other tables, and any business rules. Also document the core entities (Driver, Employment, PlanningEntry, Scenario) and their relationships. Use the Prisma schema as the source of truth. Write in Dutch where appropriate (field descriptions), but technical field names in English as they appear in the schema.
- **Dependencies:** None.
- **Definition of done:** `masterdata.md` exists with complete field-level documentation for all stamtabellen and their relationships. Accurate to current Prisma schema.
- **Implementation note:** Read `prisma/schema.prisma` and document each model systematically.
- **Source:** SMI-012.

### PB-105: Planning grid — integrate paginated data fetching

- **ID:** PB-105
- **Title:** Connect planning grid to paginated API for large driver sets
- **Problem / opportunity:** The planning grid loads all drivers in a single request. Virtual scrolling (PB-096) handles DOM performance, but the data transfer and memory cost remains. At 1000+ drivers, initial load time will be significant.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Completes the 1000-driver scaling story (SMI-011). Virtual scrolling handles rendering; this handles data transfer.
- **Scope notes:** Integrate `api.planning.getForRange()` paginated endpoint into the planning grid. Load drivers in pages (e.g., 100 per page). Add pagination controls or infinite scroll to the grid. The capacity summary row may need a separate aggregation API call rather than client-side computation. Preserve all existing functionality (drag-select, group headers, sticky columns).
- **Dependencies:** PB-096 (completed), PB-093 (completed).
- **Definition of done:** Planning grid fetches drivers in pages. Initial load is fast regardless of total driver count. All existing interactions preserved. Verify passes.
- **Implementation note:** See EX-REC-044 for detailed proposal.
- **Source:** EX-REC-044, SMI-011.

### PB-098: Scenario duplication batch processing

- **ID:** PB-098
- **Title:** Batch scenario duplication to reduce memory pressure at scale
- **Problem / opportunity:** `POST /api/scenarios/[id]/duplicate` loads all planning entries (up to 50,000) into Node.js memory at once, then creates them in a single `createMany`. Near the 50K ceiling, this creates memory spikes and risks timeouts.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** All Phase 1+2 scaling items are complete. This is the last known reliability bottleneck for large datasets. Same chunking pattern already proven in PB-099 (import chunking).
- **Scope notes:** Fetch and create entries in chunks of 5,000. Keep memory usage constant regardless of total entries.
- **Dependencies:** None.
- **Definition of done:** Scenario duplication works reliably at 50K entries without memory spikes. Verify passes.
- **Implementation note:** Apply same chunking pattern as PB-099. See DE-REC-046.
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
