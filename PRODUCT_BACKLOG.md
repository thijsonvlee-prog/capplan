# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Scaling initiative (SMI-011). The system must support 1000 drivers without feeling slow. Phase 1 focuses on backend pagination for the two heaviest API endpoints and a covering database index — assigned to the Delivery Agent for this cycle. Phase 2 (frontend virtual scrolling + pagination UI) is now unblocked: ESC-007 decided in favor of `react-window`. Phase 2 items will become ready once their backend dependencies ship.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-093: Add server-side pagination to planning for-range API

- **ID:** PB-093
- **Title:** Paginate the planning for-range endpoint to avoid returning all drivers at once
- **Problem / opportunity:** `/api/planning/for-range` fetches all drivers with 4 relation includes and returns them in a single response. At 1000 drivers this produces a 5-10MB JSON payload with 2-5 second load times.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Core scaling bottleneck. The planning grid is the primary product surface and it calls this endpoint on every load and date range change.
- **Scope notes:** Add `page` and `pageSize` query parameters (default pageSize: 100). Return `{ data, total, page, pageSize }` response shape. Keep backward compatibility — if no pagination params are provided, return all (with a reasonable max). The frontend (`api.ts`) must be updated to support paginated fetching. PlanningGrid will need to handle paginated driver loading (but full virtual scrolling is a separate item PB-096).
- **Dependencies:** None.
- **Definition of done:** The endpoint supports pagination. Response includes total count. Existing callers continue to work. Verify with `npm run verify`.
- **Implementation note:** Add `skip` and `take` to the Prisma `findMany`. Return total via `prisma.driver.count()` in parallel. Keep planning entries query unchanged (it filters by date range already). Update `api.ts` to pass pagination params.
- **Source:** SMI-011.

### PB-094: Add server-side pagination to drivers list API

- **ID:** PB-094
- **Title:** Paginate the drivers list endpoint
- **Problem / opportunity:** `/api/drivers` returns all drivers with all relations in one response. At 1000 drivers this is the same payload size problem as the planning endpoint.
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** The drivers page is a high-frequency screen. Search and filter currently happen client-side after loading everything.
- **Scope notes:** Add `page`, `pageSize`, and `search` query parameters. Move name/search filtering to the database query (Prisma `where` with `contains`). Return `{ data, total, page, pageSize }`. Default pageSize: 50.
- **Dependencies:** None.
- **Definition of done:** The endpoint supports pagination and server-side search. Existing callers continue to work. Verify with `npm run verify`.
- **Implementation note:** Add `where` clause with `OR` on firstName/lastName `contains` for search. Add `skip`/`take` for pagination. Return count in parallel.
- **Source:** SMI-011.

### PB-009: Add covering index for capacity aggregation query

- **ID:** PB-009
- **Title:** Add (scenarioId, date, status) composite index on PlanningEntry
- **Problem / opportunity:** The capacity endpoint uses `groupBy` on `date` and `status` filtered by `scenarioId` and `date`. The existing index `(scenarioId, date)` doesn't cover `status`, forcing a table scan for the aggregation at scale.
- **Owner:** Delivery Agent
- **Priority:** P2 High (promoted from P3 — now relevant for 1000-driver scaling)
- **Status:** Ready
- **Why this matters now:** At 1000 drivers × 90 days = up to 90,000 planning entries. The capacity aggregation query needs this index to remain fast.
- **Scope notes:** Add `@@index([scenarioId, date, status])` to PlanningEntry in schema.prisma. Create a migration.
- **Dependencies:** None.
- **Definition of done:** Migration created and applied. Capacity endpoint query uses the new index. Verify with `npm run verify`.
- **Implementation note:** `npx prisma migrate dev --name add-capacity-covering-index`. Small schema change.
- **Source:** DE-REC-005, SMI-011.

### PB-092: Add CSV row count limit to import execution

- **ID:** PB-092
- **Title:** Limit maximum CSV rows per import to prevent memory/timeout issues
- **Problem / opportunity:** The import execute endpoint has a 5MB file size limit but no limit on row count. A CSV with many thousands of rows creates one database operation per row inside a single transaction, which could hit Neon connection timeouts or exhaust Node.js memory.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Import pipeline is now fully featured (create + upsert). This is a reliability guardrail to prevent production incidents before real data volumes arrive.
- **Scope notes:** Add a maximum row count (e.g., 10,000 rows). Return a clear Dutch error message if exceeded. Check row count before starting the transaction.
- **Dependencies:** None.
- **Definition of done:** Import execution rejects CSVs exceeding the row limit with a clear error. Existing imports under the limit continue to work unchanged.
- **Implementation note:** Small change in the import execute route. Add the limit constant to `API_LIMITS` in `constants.ts` if that object exists, otherwise use a local constant.
- **Source:** DE-REC-043.

---

## Blocked / Waiting for Dependencies

### PB-096: Planning grid virtual scrolling

- **ID:** PB-096
- **Title:** Implement virtual scrolling in PlanningGrid using react-window
- **Problem / opportunity:** PlanningGrid renders all driver rows in the DOM simultaneously. At 1000 drivers this means 6000-8000+ DOM nodes, causing scroll jank, 1-3 second render delays, and high memory usage. This is the single biggest frontend scaling bottleneck.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (PB-093 — backend pagination must ship first)
- **Why this matters now:** Without virtual scrolling, the planning grid will be unusable at 1000 drivers regardless of backend pagination.
- **Scope notes:** Implement virtual scrolling using `react-window` (approved via ESC-007, Option A) so only visible rows (~30-50) are in the DOM. Must preserve sticky header, group row headers, and horizontal scroll behavior. Must work with paginated data from PB-093.
- **Dependencies:** PB-093 (pagination API must be available first).
- **Definition of done:** Planning grid renders smoothly with 1000+ drivers. Scroll performance is consistent. All existing functionality preserved. Verify with `npm run verify`.
- **Implementation note:** Use `react-window` FixedSizeList or VariableSizeList. The library is ~6KB gzipped. Integrate with the existing PlanningGrid table structure. Group rows (employer/department headers) may require VariableSizeList to handle different row heights. Test with sticky columns and horizontal scrolling.
- **Source:** SMI-011, ESC-007 (Option A approved).

### PB-097: Drivers page pagination UI

- **ID:** PB-097
- **Title:** Add pagination controls and server-side search to drivers page
- **Problem / opportunity:** The drivers page loads and renders all drivers at once. At 1000 drivers the page will be slow to load and scroll.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Blocked (PB-094 — backend pagination must ship first)
- **Why this matters now:** Second highest-frequency screen after planning. Must remain fast at scale.
- **Scope notes:** Add pagination controls (page selector, page size). Move search/filter to server-side (leverage PB-094 search parameter). Show total count. Maintain current table layout and interaction patterns.
- **Dependencies:** PB-094 (pagination API must be available first).
- **Definition of done:** Drivers page loads and navigates smoothly with 1000+ drivers. Search is responsive. Pagination controls are clear and Dutch-labeled.
- **Implementation note:** Use `useApiData` with pagination params. Add a pagination component (page buttons, total indicator). Debounce search input for server-side filtering.
- **Source:** SMI-011.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

_Previous cycle items (PB-084 through PB-091) shipped 2026-03-30. Cleared per hygiene rules._

---

## Deferred

### PB-098: Scenario duplication batch processing

- **ID:** PB-098
- **Title:** Batch scenario duplication to reduce memory pressure at scale
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Existing 50,000 entry safeguard prevents worst case. Address after core pagination work is done.
- **Source:** SMI-011.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Schedule when capacity allows.
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
