# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The product is stable and all major screens are at product-grade quality. Authorization is complete. The next priorities are input validation hardening: enum validation on employment type, length caps on remaining text fields, and duplicate skill prevention. One blocked item (sickPercentage domain inconsistency) awaits Scrum Master decision. All Experience Agent work is P4 polish.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready._

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

### PB-140: Validate employmentType against domain enum

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Employment POST and PUT routes now validate `employmentType` against the `EmploymentType` enum (FULLTIME, PARTTIME, ONCALL, TEMPORARY, CHARTER). Invalid values return a Dutch error message listing valid options.

### PB-141: Add maxLength validation on description and text fields

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added length caps: stamtabel `description` (500 chars) on POST/PUT, stamtabel `code` (100 chars) on PUT (matching POST), function `position`/`manager` (200 chars) on POST/PUT, skill `name` (200 chars) on POST/PUT. All return Dutch error messages.

### PB-142: Prevent duplicate skill names

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Skills POST and PUT now check for existing skill names (case-insensitive). Returns Dutch error message with the existing skill name if a duplicate is found. Uses HTTP 409 Conflict status.

### PB-136: Enforce department scope on planning write endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** POST `/api/planning` and POST `/api/planning/bulk` now check `getAllowedDepartmentIds` + `driverDepartmentFilter` before processing mutations. Returns 403 with Dutch error message when a driver is outside the caller's department scope.

### PB-137: Surface API error messages in fetchJson

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** `fetchJson` in `src/lib/api.ts` now parses the JSON response body on error and surfaces the server's `error` field in the thrown Error. All 29 route files' Dutch error messages are now user-visible in toasts.

### PB-138: Add server-side length cap on planning notes field

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Both `POST /api/planning` and `POST /api/planning/bulk` reject notes longer than 500 characters with Dutch error message.

### PB-135: Add length cap on planning dates parameter

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added 366-date cap to `GET /api/planning` matching the existing caps on `/capacity` and `/bulk` routes.

### PB-134: Propagate error state to remaining useApiDataWithLoading consumers

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** All `useApiDataWithLoading` consumers now show Dutch-language error messages when data fetching fails.

### PB-132: Make active scenario selection per-user

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-133: Add error state to useApiData / useApiDataWithLoading hooks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-129: POC capacity summary row — remove

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-130: Extend P2025 handling to remaining DELETE routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-131: Capacity page — visual identity lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

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
