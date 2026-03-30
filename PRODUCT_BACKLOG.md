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

_No items currently ready._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-099: Batch import transactions into chunks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Split both `importDrivers` and `importStamtabel` (upsert mode) into chunks of 500 rows, each processed in its own `prisma.$transaction`. Accumulated created/updated/error counts across chunks. If a chunk-level transaction fails, the error is recorded with the chunk number and row range, and remaining chunks continue processing. Existing import result summary and logging unchanged.

### PB-100: Add date format validation to planning endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30
- **Implementation note:** Added `validateDateFormat()` and `validateDateFormats()` to `api-route-utils.ts`. Validates regex format (`/^\d{4}-\d{2}-\d{2}$/`) and semantic validity (rejects dates like 2025-02-30 that would roll over). Applied to: GET `/api/planning/for-range` (dates query param), POST `/api/planning/bulk` (dates array in body), GET `/api/planning` (dates query param), POST `/api/planning` (single date in body). All return 400 with Dutch error messages.

### PB-096: Planning grid virtual scrolling

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30
- **Implementation note:** Implemented manual table virtualization instead of react-window to preserve the existing table structure with sticky header, sticky left columns, and drag-select behavior. Flattens group/driver rows into a single array, tracks scroll position via ResizeObserver, and only renders visible rows plus a 10-row buffer. Fixed row heights per density level (spacious: 48px, comfortable: 38px, compact: 26px). No external dependency added — react-window was approved but the table-compatible approach is lower risk and fully achieves the performance goal.

### PB-097: Drivers page pagination UI

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30
- **Implementation note:** Switched to `api.drivers.listPaginated()` with `useApiDataWithLoading` for automatic cache invalidation. Added 300ms debounced server-side search. Pagination controls include first/prev/next/last buttons, page indicator, page size selector (25/50/100), and range display. All labels in Dutch. Clear search button added. Count badge shows total from server.

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
