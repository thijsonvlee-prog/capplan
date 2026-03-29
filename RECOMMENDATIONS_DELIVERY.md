# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-042 is complete — dead `preferences.getAll` and `preferences.remove` methods removed from `api.ts`. A fresh codebase scan reveals several new opportunities: a race condition in the planning upsert route, dead code (`patchBody`, `isDriverActiveByEmployment`), misleading `userId` params in preferences API, redundant cascade deletes, and a `filteredDrivers` memoization gap in PlanningGrid. Previously identified items PB-018, PB-009, and PB-030 remain valid and deferred in the backlog.

## Recommended Next Improvements

### DE-REC-016: Fix TOCTOU race condition in POST /api/planning upsert

- **Title:** Use transaction or upsert for planning entry creation
- **Problem:** `POST /api/planning` does a `findFirst` then either `update` or `create` in two separate queries without a transaction. Concurrent requests for the same `(driverId, date, scenarioId)` can both find no existing record and both attempt `create`, causing a unique-constraint violation that surfaces as an unhandled 500. The schema also lacks a `@@unique([driverId, date, scenarioId])` constraint on `PlanningEntry`.
- **Proposed improvement:** Add a `@@unique([driverId, date, scenarioId])` constraint to the schema and use Prisma's `upsert` with the composite key. This eliminates the race and simplifies the code. Requires a migration.
- **Expected product/technical value:** Prevents intermittent 500 errors during concurrent planning edits. Enforces data integrity at the DB level.
- **Priority:** P2 High
- **Effort:** Medium (schema migration + route refactor)
- **Risk:** Medium. Migration adds a unique constraint — must verify no duplicate rows exist first.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is a real data integrity risk. Multi-user scenarios (or even fast double-clicks) can trigger it.

### DE-REC-017: Add date range guard to GET /api/planning

- **Title:** Prevent unbounded planning entry queries
- **Problem:** `GET /api/planning` returns all planning entries for a scenario when no `dates` parameter is provided. With growing data, this can return hundreds of thousands of rows with no LIMIT, potentially causing OOM or timeouts on serverless.
- **Proposed improvement:** Require `dates` or `driverId` parameter. Return 400 if neither is provided.
- **Expected product/technical value:** Prevents accidental full-table scans. Improves API robustness.
- **Priority:** P3 Medium
- **Effort:** Small (add early-return guard)
- **Risk:** Low. Verify all callers pass dates or driverId.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Cheap safety guard against a latent scalability issue.

### DE-REC-018: Remove dead patchBody helper from api.ts

- **Title:** Remove unused patchBody function
- **Problem:** `patchBody()` in `api.ts` builds a PATCH request, but no PATCH endpoint exists anywhere in the codebase. Zero callers.
- **Proposed improvement:** Delete the function.
- **Expected product/technical value:** Dead code removal. Simplifies maintenance.
- **Priority:** P4 Low
- **Effort:** Small (delete ~6 lines)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick cleanup, can be bundled with other small items.

### DE-REC-019: Remove dead isDriverActiveByEmployment from api-helpers.ts

- **Title:** Remove unused exported function
- **Problem:** `isDriverActiveByEmployment` in `api-helpers.ts` is exported but has zero callers. The same logic already exists in `transformDriver` in `api-route-utils.ts`.
- **Proposed improvement:** Delete the function.
- **Expected product/technical value:** Removes dead code and a duplicate logic path.
- **Priority:** P4 Low
- **Effort:** Small (delete ~10 lines)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick cleanup, can be bundled with DE-REC-018.

### DE-REC-020: Remove misleading userId parameter from preferences API methods

- **Title:** Remove unused userId params from preferences.get and preferences.set
- **Problem:** The `preferences.get()` and `preferences.set()` methods in `api.ts` accept a `userId` parameter and pass it to the server. The server explicitly ignores client-supplied `userId` (hardcoded to `"default"`) to prevent cross-user access. The client-side signature creates a false impression of multi-user support.
- **Proposed improvement:** Remove the `userId` parameter from both methods.
- **Expected product/technical value:** Eliminates misleading API surface. Reduces confusion for future development.
- **Priority:** P4 Low
- **Effort:** Small (remove parameter from 2 methods, verify callers)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Small cleanup for API clarity.

### DE-REC-021: Remove redundant cascade deletes in driver and skill deletion

- **Title:** Remove manual deleteMany before cascade-covered deletes
- **Problem:** `DELETE /api/drivers/[id]` manually deletes `planningEntries` before deleting the driver, but the schema already has `onDelete: Cascade` on `PlanningEntry.driverId`. Similarly, `DELETE /api/settings/skills/[id]` manually deletes `DriverSkill` records before deleting the skill, but `DriverSkill` has `onDelete: Cascade` on both relations. These are redundant round-trips.
- **Proposed improvement:** Remove the redundant `deleteMany` calls.
- **Expected product/technical value:** Removes misleading code and one unnecessary DB round-trip per delete.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low. Verify cascade is correctly defined in schema before removing.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low effort, improves code clarity.

### DE-REC-022: Memoize filteredDrivers in PlanningGrid

- **Title:** Wrap filteredDrivers in useMemo to prevent unnecessary re-renders
- **Problem:** `filteredDrivers` in `PlanningGrid.tsx` is an inline `.filter()` call that creates a new array reference on every render. The downstream `sortedDrivers` useMemo lists `filteredDrivers` as a dependency, causing it to also re-compute on every render even when data and filter haven't changed.
- **Proposed improvement:** Wrap `filteredDrivers` in `useMemo` with `[localData, filter]` as deps.
- **Expected product/technical value:** Reduces unnecessary re-computation in the most complex component. Fixes the root cause of one of the two pre-existing ESLint warnings.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Medium. PlanningGrid is the most complex component — any change needs careful verification.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Addresses a real performance gap and a pre-existing ESLint warning.

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

- **Planning entry race condition (DE-REC-016):** The TOCTOU pattern in `POST /api/planning` is a real data integrity risk. Concurrent edits can produce duplicates or 500 errors. The schema lacks the `@@unique` constraint that would prevent duplicates at the DB level. This is the highest-priority technical risk.
- **Unbounded GET /api/planning:** Without a date or driver filter, this endpoint can return the entire planning table. Currently mitigated by the frontend always passing dates, but the API itself is unguarded.
- **PerformanceEvent table growth:** `cleanupOldEvents()` in `perf.ts` is defined but never called. The `PerformanceEvent` table will grow indefinitely. Low urgency given low traffic, but worth noting.
- **StamtabelType enum mismatch:** `StamtabelType.LEAVE_TYPES = "leaveTypes"` does not match the API route segment `"leave-types"`. If the enum is ever used in route construction it will fail silently. Currently the enum is unused by route logic.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Add authentication/authorization:** Known gap in CLAUDE.md, explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx broadly:** The component is complex but stable. Targeted fixes (DE-REC-022) are preferred over a full rewrite.
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
