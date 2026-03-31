# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The product is stable and all major screens are at product-grade quality. Authorization is complete. A department scope gap on planning write endpoints is the most important open item. After that, surfacing existing API error messages to users and input validation hardening are the next priorities. All remaining Experience Agent work is P4 polish.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-136: Enforce department scope on planning write endpoints

- **ID:** PB-136
- **Title:** Add user group department filter to POST `/api/planning` and POST `/api/planning/bulk`
- **Problem / opportunity:** `GET /api/planning` validates that a `driverId` belongs to the caller's allowed departments. But both write endpoints skip this check. A planner with restricted department scope can write planning entries for any driver by POSTing directly, bypassing user group access control.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** The read enforcement is already in place. The write gap is a real authorization inconsistency that undermines the user group access control model shipped in PB-109/110/111.
- **Scope notes:** Copy the existing `getAllowedDepartmentIds` + `driverDepartmentFilter` validation pattern from the GET handler to both POST handlers. Return 403 with Dutch error message when a driver is outside the caller's scope.
- **Dependencies:** None.
- **Definition of done:** Both planning write endpoints reject mutations for drivers outside the caller's department scope. Existing behavior unchanged when auth is not configured.
- **Implementation note:** Follow the pattern at `route.ts:44-58` in the planning GET handler.
- **Source:** DE-REC-048.

### PB-137: Surface API error messages in fetchJson

- **ID:** PB-137
- **Title:** Parse and display structured error messages from API responses
- **Problem / opportunity:** `fetchJson` in `src/lib/api.ts` throws `new Error(\`API error: ${res.status}\`)`, discarding the response body. All 29 API route files return carefully crafted Dutch error messages in `{ error: "..." }` format, but these are never shown to users. Toasts display generic "Er ging iets mis" messages instead.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** All the error message work across API routes becomes user-visible with a small change in one file. High value-to-effort ratio.
- **Scope notes:** Parse the JSON response body on error and include the `error` field in the thrown Error message. Keep the status code as fallback if body parsing fails.
- **Dependencies:** None.
- **Definition of done:** When an API route returns `{ error: "Chauffeur niet gevonden" }`, the user sees that message in the toast instead of a generic failure.
- **Implementation note:** Change is in `src/lib/api.ts:24`. Must handle cases where response body is not JSON or lacks an `error` field.
- **Source:** DE-REC-050.

### PB-138: Add server-side length cap on planning notes field

- **ID:** PB-138
- **Title:** Cap `notes` field length on planning POST and bulk POST
- **Problem / opportunity:** The `notes` field is an unbounded TEXT column. Neither write endpoint validates its length. Arbitrarily large strings can be submitted, compounding in bulk operations with 366 dates.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Quick defensive fix completing the input validation story on planning write endpoints. Natural companion to PB-136.
- **Scope notes:** Add a 500-character cap with a Dutch error message. Apply to both single POST and bulk POST.
- **Dependencies:** None.
- **Definition of done:** Both planning write endpoints reject notes longer than 500 characters with a Dutch error message.
- **Implementation note:** Follow the existing validation patterns in the planning route handlers.
- **Source:** DE-REC-049.

---

## Blocked / Needs Decision

### PB-139: Resolve sickPercentage domain inconsistency

- **ID:** PB-139
- **Title:** Align sickPercentage max value between API, UI, and domain types
- **Problem / opportunity:** API validates 0–100, UI caps at max 99, domain type comment says "0-99 attendance percentage". The field semantics are unclear: if 100% means "fully present", that contradicts being on SICK status.
- **Owner:** Product Owner (decision) + Delivery Agent (implementation)
- **Priority:** P3 Medium
- **Status:** Blocked — awaiting Scrum Master decision (ESC-010)
- **Why this matters now:** Easy to fix once the correct value is decided. Data inconsistency between API-submitted and UI-submitted values.
- **Scope notes:** Once decided, enforce the chosen max consistently in API validation, UI input, and type documentation.
- **Dependencies:** ESC-010 decision.
- **Definition of done:** API, UI, and type documentation all use the same max value. Existing data outside range is unaffected (no migration needed).
- **Source:** DE-REC-051.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-135: Add length cap on planning dates parameter

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added 366-date cap to `GET /api/planning` matching the existing caps on `/capacity` and `/bulk` routes. Returns Dutch error message "Maximaal 366 datums per verzoek" when exceeded. All planning endpoints now have consistent input length validation.

### PB-134: Propagate error state to remaining useApiDataWithLoading consumers

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** All `useApiDataWithLoading` consumers now show Dutch-language error messages when data fetching fails. Updated: StamtabelManager (new `error` prop), SkillManager, RosterProfileEditor, ImportSourceManager, UserManager, UserGroupManager. Settings page passes per-entity error state. Pattern matches DriverList exactly. Error visibility is now consistent across the entire product.

### PB-132: Make active scenario selection per-user

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Active scenario preference now stored per authenticated user via `getServerSession`. Falls back to `"default"` when auth is not configured. Uses same `resolveUserId()` pattern as the preferences route. Eliminates cross-user interference in multi-user deployments.

### PB-133: Add error state to useApiData / useApiDataWithLoading hooks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** `useApiDataWithLoading` now returns `[data, loading, error]` where `error` is `string | null`. Backward-compatible. DriverList shows a Dutch-language error state when the driver fetch fails.

### PB-129: POC capacity summary row — remove

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Per ESC-009 decision (Option B), deleted `CapacitySummaryRow.tsx` and removed all related code from PlanningGrid.

### PB-130: Extend P2025 handling to remaining DELETE routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** All DELETE and PUT routes now return 404 for non-existent records. Fixed empty department list bug. Added missing `requireRole("ADMIN")` to import logs endpoint.

### PB-131: Capacity page — visual identity lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Added KPI summary module, integrated toolbar, section headers, No-Line Rule applied.

---

## Deferred

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
- **Reason:** Low user impact. Covers DE-REC-014, DE-REC-030, DE-REC-047. Includes hoisting COMPARE_COLORS to module scope and optionally moving to constants.ts with API limits. Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030, DE-REC-047.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low. Low urgency.
- **Source:** DE-REC-031.

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
