# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-043 (race condition), PB-044 (API guard), PB-045 (memoization), and PB-046 (dead code batch) are all complete. ESLint warnings reduced from 2 to 1. The codebase is in good shape. Remaining opportunities focus on: fixing the last ESLint warning (handleDragEnd), adding date logic validation to sub-record PUT routes, and source existence validation in the scenario duplicate endpoint. Previously identified items PB-018, PB-009, and PB-030 remain valid and deferred in the backlog.

## Recommended Next Improvements

### DE-REC-023: Fix handleDragEnd stale closure in PlanningGrid useEffect

- **Title:** Memoize handleDragEnd to fix remaining ESLint warning
- **Problem:** The `useEffect` at line ~222 of `PlanningGrid.tsx` references `handleDragEnd` in its callback but doesn't include it in the dependency array. This causes a stale closure and triggers the remaining ESLint `react-hooks/exhaustive-deps` warning.
- **Proposed improvement:** Wrap `handleDragEnd` in `useCallback` with `[dragState]` deps, then include it in the useEffect dependency array.
- **Expected product/technical value:** Eliminates the last ESLint warning in PlanningGrid. Fixes a potential stale closure bug during drag operations.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Medium. PlanningGrid is the most complex component — any change needs careful verification. The drag interaction must still work correctly.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** It's the last ESLint warning in the codebase. The fix is small and well-scoped.

### DE-REC-024: Add date logic validation to sub-record PUT routes

- **Title:** Validate endDate >= startDate in employment, function, and roster assignment updates
- **Problem:** The PUT routes for `/api/drivers/[id]/employment/[recordId]`, `/api/drivers/[id]/functions/[recordId]`, and `/api/drivers/[id]/roster-assignments/[recordId]` accept date fields without validating that `endDate >= startDate`. Invalid date ranges are accepted silently.
- **Proposed improvement:** Add validation that returns 400 with a Dutch error message if `endDate` is provided and is before `startDate`.
- **Expected product/technical value:** Prevents invalid data at the API boundary. Better UX — planners get immediate feedback instead of silently corrupted records.
- **Priority:** P3 Medium
- **Effort:** Small (add one guard to 3 routes)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Simple defensive validation at system boundary, per CLAUDE.md guidelines.

### DE-REC-025: Validate source scenario exists before duplication

- **Title:** Return 404 if source scenario doesn't exist in duplicate endpoint
- **Problem:** `POST /api/scenarios/[id]/duplicate` doesn't verify the source scenario exists. If called with an invalid ID, it silently creates an empty scenario with no planning entries.
- **Proposed improvement:** Check that the source scenario exists at the start of the transaction. Return 404 with a Dutch error message if not found.
- **Expected product/technical value:** Prevents creation of orphan empty scenarios from invalid API calls.
- **Priority:** P4 Low
- **Effort:** Small (add one findUnique check)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick safety fix. Low effort.

### DE-REC-008: Add foreign key existence checks before relation creation

- **Title:** Validate foreign key references before creating related records
- **Problem:** The driver PUT handler accepts `skillIds` and creates `DriverSkill` records without verifying those skill IDs exist. Similarly, employment/function POST handlers accept `employerId`, `locationId`, `departmentId` without existence checks. Invalid IDs cause Prisma foreign key constraint errors that return generic 500 responses.
- **Proposed improvement:** Before creating related records, verify referenced IDs exist with a `findMany` count check. Return a clear 400 error with Dutch message if any reference is invalid.
- **Expected product/technical value:** Better error UX when invalid references are submitted. Prevents confusing 500 errors.
- **Priority:** P3 Medium
- **Effort:** Medium (touches several routes)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** PB-018 already exists for this. Complements existing input validation.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (scenarioId, date, status) index on PlanningEntry
- **Problem:** `GET /api/planning/capacity` uses `groupBy` on `date` and `status` filtered by `scenarioId` and `date`. The existing `[scenarioId, date]` index doesn't cover `status`, forcing a table scan for status values.
- **Proposed improvement:** Add `@@index([scenarioId, date, status])` to PlanningEntry.
- **Expected product/technical value:** Faster capacity calculations as data volume grows.
- **Priority:** P3 Medium
- **Effort:** Small (schema change + migration)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** PB-009 exists. Capacity aggregation is a hot path.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines hardcoded hex color values, violating CLAUDE.md design token rules.
- **Proposed improvement:** Move to `src/domain/constants.ts` with a comment referencing design token equivalents.
- **Expected product/technical value:** CLAUDE.md compliance. Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** PB-030 exists. Quick compliance fix.

## Risks / Watch-outs

- **handleDragEnd stale closure (DE-REC-023):** The remaining ESLint warning in PlanningGrid indicates a stale closure in the drag mouseup handler. In rare timing scenarios, this could cause drag interactions to behave incorrectly. Low real-world impact but worth fixing.
- **PerformanceEvent table growth:** `cleanupOldEvents()` in `perf.ts` is defined but never called. The `PerformanceEvent` table will grow indefinitely. Low urgency given low traffic, but worth noting.
- **StamtabelType enum mismatch:** `StamtabelType.LEAVE_TYPES = "leaveTypes"` does not match the API route segment `"leave-types"`. If the enum is ever used in route construction it will fail silently. Currently the enum is unused by route logic.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Add authentication/authorization:** Known gap in CLAUDE.md, explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx broadly:** The component is complex but stable. Targeted fixes are preferred over a full rewrite.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision on whether duplicates should be allowed.
- **Add enum validation for status fields:** Frontend already constrains values. Low real-world risk.
- **Extend withPerfLogging to all routes:** Inconsistent wrapping exists but the perf system itself has unused analysis functions. Fix the analysis layer before expanding collection.
- **Remove ExternalSourceMetadata types:** These are preparatory types for the connectivity hub (PB-015). They will be needed when that feature ships.
- **Remove UserPreference type from types.ts:** May be useful for future preferences features.
- **Fix generateDailySummary date filter bug in perf.ts:** The function is never called. Fix it only if the perf system is activated.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
