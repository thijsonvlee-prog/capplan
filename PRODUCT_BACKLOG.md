# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major screens are now at product-grade visual quality. Authorization model is complete. The active backlog focuses on production correctness fixes for multi-user deployments (per-user scenario state, error visibility) and one pending Scrum Master decision (ESC-009 POC). After these, the remaining backlog is P4 polish and deferred items.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-132: Make active scenario selection per-user

- **ID:** PB-132
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Problem / opportunity:** `GET/PUT /api/scenarios/active` uses `userId = "default"` for all users. Changing the active scenario in one browser session affects all other users. The preferences API already supports per-user keys, so this is an inconsistency that causes cross-user interference in multi-user deployments.
- **Why this matters now:** Multi-user auth is deployed and in use. This is a production correctness bug.
- **Scope notes:** Use `getServerSession` to read the session user ID. Store/retrieve active scenario per user. Fall back to `"default"` when auth is not configured (`NEXTAUTH_SECRET` not set). Small, contained change in `src/app/api/scenarios/active/route.ts`.
- **Dependencies:** None.
- **Definition of done:** Active scenario is stored per authenticated user. Unauthenticated/dev mode falls back to `"default"`. `npm run verify` passes.
- **Source:** DE-REC-043.

### PB-133: Add error state to useApiData / useApiDataWithLoading hooks

- **ID:** PB-133
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Fetch errors are caught and logged to `console.error` only. No error state is returned to callers, so failed fetches are invisible in the UI — components silently show stale default data with no failure indication.
- **Why this matters now:** All data access goes through these hooks. Silent failures are a reliability blind spot. Users may see stale data without knowing a fetch failed.
- **Scope notes:** Add an `error` return field to both hooks. This is an additive change — existing callers can ignore the new field initially. Components can optionally show error states. Do not require all callers to handle errors in the same cycle.
- **Dependencies:** None.
- **Definition of done:** Both hooks return an `error` field. At least one high-value consumer (e.g., PlanningGrid or drivers page) shows an error state on fetch failure. `npm run verify` passes.
- **Source:** DE-REC-044.

---

## Blocked / Needs Decision

### PB-129: POC capacity summary row — promote or remove

- **ID:** PB-129
- **Owner:** Product Owner (pending Scrum Master decision)
- **Priority:** P3 Medium
- **Status:** Blocked (ESC-009)
- **Problem / opportunity:** `PlanningGrid.tsx` has a `showCapacitySummary` state marked as "POC". The CapacitySummaryRow component and its integration add maintenance cost. Either it should be promoted to a proper feature or the code should be removed.
- **Why this matters now:** The planning grid just received visual updates. Good time to settle the POC's status before further grid changes.
- **Scope notes:** Depends on Scrum Master decision. If promote: remove POC label, ensure styling matches new grid design. If remove: delete CapacitySummaryRow component and related code from PlanningGrid.
- **Dependencies:** ESC-009 decision.
- **Definition of done:** POC label removed (promoted) or code deleted (removed). `npm run verify` passes.
- **Source:** DE-REC-038.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-130: Extend P2025 handling to remaining DELETE routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added P2025 error detection to `roster-profiles/[id]`, `settings/[type]/[id]`, `settings/skills/[id]`, and `user-groups/[id]` DELETE routes. All now return 404 with Dutch "niet gevonden" messages for non-existent records. Also extended P2025 handling to PUT routes for settings and skills. Fixed empty department list bug in `getAllowedDepartmentIds` (groups with no departments now fall back to unrestricted access). Added missing `requireRole("ADMIN")` to import logs endpoint.

### PB-131: Capacity page — visual identity lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Added KPI summary module (5 metric cards: gem. beschikbaar, gem. totaal, gem. verlof, gem. ziek, bezettingsgraad). Toolbar moved into page header using control-group pattern. Chart/table wrapped in named sections with section titles. Removed outer borders from chart/table cards (No-Line Rule).

---

## Deferred

### DE-REC-045: Add length cap on planning dates parameter

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick defensive fix but low urgency. The `/capacity` and `/for-range` routes already cap at 366/90. The base planning endpoint is only called with grid-visible dates (max ~90). Defer until capacity allows.
- **Source:** DE-REC-045.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is now structurally aligned. Custom tooltip would complete the integration but is cosmetic.
- **Source:** EX-REC-049.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.
- **Source:** EX-REC-048.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact. Schedule when capacity allows.
- **Source:** DE-REC-041.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes (< 20 users). Only relevant if user counts grow significantly.
- **Source:** EX-REC-044.

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
- **Reason:** Depends on POC decision (ESC-009/PB-129). Will be actionable after that decision.
- **Source:** DE-REC-036.

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
