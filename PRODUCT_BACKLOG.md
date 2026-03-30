# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Scaling initiative (SMI-011). Phase 1 (backend pagination + index) is complete. Phase 2 (frontend virtual scrolling + pagination UI) is the primary work for the next cycle — assigned to the Experience Agent. The Delivery Agent picks up reliability improvements (import chunking, date validation) that complement the scaling work.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-096: Planning grid virtual scrolling

- **ID:** PB-096
- **Title:** Implement virtual scrolling in PlanningGrid using react-window
- **Problem / opportunity:** PlanningGrid renders all driver rows in the DOM simultaneously. At 1000 drivers this means 6000-8000+ DOM nodes, causing scroll jank, 1-3 second render delays, and high memory usage. This is the single biggest frontend scaling bottleneck.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Without virtual scrolling, the planning grid will be unusable at 1000 drivers regardless of backend pagination.
- **Scope notes:** Implement virtual scrolling using `react-window` (approved via ESC-007, Option A) so only visible rows (~30-50) are in the DOM. Must preserve sticky header, group row headers, and horizontal scroll behavior. Must work with paginated data from PB-093.
- **Dependencies:** None (PB-093 completed).
- **Definition of done:** Planning grid renders smoothly with 1000+ drivers. Scroll performance is consistent. All existing functionality preserved. Verify with `npm run verify`.
- **Implementation note:** Use `react-window` FixedSizeList or VariableSizeList. The library is ~6KB gzipped. Integrate with the existing PlanningGrid table structure. Group rows (employer/department headers) may require VariableSizeList to handle different row heights. Test with sticky columns and horizontal scrolling. Use `api.planning.getForRange(dates, scenarioId, { page, pageSize })` for paginated data fetching.
- **Source:** SMI-011, ESC-007 (Option A approved).

### PB-097: Drivers page pagination UI

- **ID:** PB-097
- **Title:** Add pagination controls and server-side search to drivers page
- **Problem / opportunity:** The drivers page loads and renders all drivers at once. At 1000 drivers the page will be slow to load and scroll.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Second highest-frequency screen after planning. Must remain fast at scale.
- **Scope notes:** Add pagination controls (page selector, page size). Move search/filter to server-side (leverage PB-094 search parameter). Show total count. Maintain current table layout and interaction patterns.
- **Dependencies:** None (PB-094 completed).
- **Definition of done:** Drivers page loads and navigates smoothly with 1000+ drivers. Search is responsive. Pagination controls are clear and Dutch-labeled.
- **Implementation note:** Use `api.drivers.listPaginated({ search, page, pageSize })` for paginated fetching. Add a pagination component (page buttons, total indicator). Debounce search input for server-side filtering. The backend also supports `employeeNumber` search in addition to firstName/lastName.
- **Source:** SMI-011.

### PB-099: Batch import transactions into chunks

- **ID:** PB-099
- **Title:** Chunk large CSV import transactions to prevent connection timeouts
- **Problem / opportunity:** The import execute endpoint processes all rows inside a single `prisma.$transaction`. At 10,000 rows (the PB-092 limit), this creates 10,000+ individual queries in one transaction. Neon serverless connections have timeout limits that could cause partial imports to fail silently.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** PB-092 introduced the 10K row ceiling. The single-transaction approach is now the reliability bottleneck for large imports.
- **Scope notes:** Split the transaction into chunks of 500-1000 rows, committing each chunk separately. Track progress across chunks and report partial results if a chunk fails. Preserve the existing import result summary (created/updated/skipped counts).
- **Dependencies:** None.
- **Definition of done:** Import of 10,000 rows completes reliably without timeout. Partial failures report which chunk failed. Verify with `npm run verify`.
- **Implementation note:** Process rows in batches within a loop, committing each batch. Accumulate results across batches. If a batch fails, return partial results with error details.
- **Source:** DE-REC-044.

### PB-100: Add date format validation to planning endpoints

- **ID:** PB-100
- **Title:** Validate YYYY-MM-DD format on date parameters in planning routes
- **Problem / opportunity:** `/api/planning/for-range`, `/api/planning/bulk`, and `/api/planning` accept date strings without format validation. Invalid dates like "2025-99-99" or "abc" silently produce empty results or unexpected behavior.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Planning endpoints are the highest-traffic routes. Basic input validation prevents silent data corruption.
- **Scope notes:** Add a shared date format validator (`/^\d{4}-\d{2}-\d{2}$/`) to `api-route-utils.ts`. Apply it on all date-accepting planning endpoints. Return a clear Dutch error message for invalid dates.
- **Dependencies:** None.
- **Definition of done:** Invalid date inputs return a 400 error with Dutch message. Valid dates work unchanged. Verify with `npm run verify`.
- **Implementation note:** Add `validateDateFormat()` to `api-route-utils.ts`. Apply to `startDate`/`endDate` in for-range, date arrays in bulk, and `date` in the base planning route.
- **Source:** DE-REC-045.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

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

### PB-098: Scenario duplication batch processing

- **ID:** PB-098
- **Title:** Batch scenario duplication to reduce memory pressure at scale
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Existing 50,000 entry safeguard prevents worst case. Address after core scaling work (PB-096, PB-097) is done.
- **Source:** SMI-011.

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
- **Reason:** Functional and usable. Lower priority than scaling work.
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
