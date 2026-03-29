# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-011 (transaction wrapping) and PB-003 (driver status consolidation) are now completed. All multi-step mutations are wrapped in `$transaction`. Driver active status is now computed from employment records across both planning grid and driver list (ESC-002). Fresh codebase analysis reveals several remaining improvement opportunities: error logging sanitization, sub-record route transactions, stale `isActive` field cleanup, and validation gaps.

## Recommended Next Improvements

### DE-REC-007: Sanitize error logging in API catch blocks

- **Title:** Prevent internal error details from leaking via console.error
- **Problem:** All ~27 API route catch blocks log the full error object via `console.error("Error ...", error)`. Prisma errors can contain connection strings, SQL details, and schema internals in server logs.
- **Proposed improvement:** Log only `error instanceof Error ? error.message : "Unknown error"` in catch blocks. Optionally log `error.code` for Prisma-specific errors to aid debugging.
- **Expected product/technical value:** Reduces information disclosure risk in production logs. Aligns with CLAUDE.md security guidelines.
- **Priority:** P2 High
- **Effort:** Small (mechanical change across ~27 route files)
- **Risk:** Low. Only affects logging, not response behavior.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low effort, broad defensive value. Security hygiene item that should not wait.

### DE-REC-009: Wrap employment and function POST handlers in transactions

- **Title:** Add transaction wrapping to sub-record creation routes
- **Problem:** Employment POST (`src/app/api/drivers/[id]/employment/route.ts`) and function POST (`src/app/api/drivers/[id]/functions/route.ts`) both call `autoCloseOpenRecords()` followed by a create — two separate operations without `$transaction`. A failure between auto-close and create leaves the driver with a closed record and no replacement.
- **Proposed improvement:** Wrap both handlers in `prisma.$transaction()`, passing `tx` to `autoCloseOpenRecords()` and the create call. The roster-assignments route already follows this pattern.
- **Expected product/technical value:** Eliminates data corruption risk on the two remaining unprotected sub-record creation paths.
- **Priority:** P2 High
- **Effort:** Small (2 files, follows established pattern)
- **Risk:** Low. `autoCloseOpenRecords` already accepts a model delegate — passing `tx` sub-models is straightforward.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** These are the last two unprotected multi-step creation handlers. Completes the transaction coverage started in PB-004 and PB-011.

### DE-REC-010: Remove isActive from driver PUT handler

- **Title:** Stop allowing direct isActive updates now that status is employment-based
- **Problem:** The driver PUT handler (`src/app/api/drivers/[id]/route.ts` lines 48-49) still allows setting `isActive` directly via the API. But after PB-003, `transformDriver` computes `isActive` from employment records, so the stored boolean is ignored on read. Writing it is misleading and creates silent inconsistency.
- **Proposed improvement:** Remove the `isActive` field from the PUT handler's `updateData` object. The field remains in the schema (no migration) but becomes read-only/derived.
- **Expected product/technical value:** Eliminates a confusing write path that has no effect. Prevents planners from thinking they can toggle driver status manually when it's actually employment-derived.
- **Priority:** P3 Medium
- **Effort:** Small (remove 2 lines)
- **Risk:** Low. No frontend currently sets isActive via PUT.
- **Dependencies:** PB-003 (completed).
- **Suggested owner:** Delivery Agent
- **Why now:** Cleanup after PB-003. The field is now dead on write.

### DE-REC-008: Add foreign key existence checks before relation creation

- **Title:** Validate foreign key references before creating related records
- **Problem:** The driver PUT handler accepts `skillIds` and creates `DriverSkill` records without verifying those skill IDs exist. Similarly, employment/function POST handlers accept `employerId`, `locationId`, `departmentId` without existence checks. Invalid IDs cause Prisma foreign key constraint errors that return generic 500 responses.
- **Proposed improvement:** Before creating related records, verify referenced IDs exist with a `findMany` count check. Return a clear 400 error with Dutch message if any reference is invalid.
- **Expected product/technical value:** Better error UX when invalid references are submitted. Prevents confusing 500 errors.
- **Priority:** P3 Medium
- **Effort:** Medium (touches several routes, needs careful scope)
- **Risk:** Low. Only adds early-return guards.
- **Dependencies:** DE-REC-009 (transaction wrapping on employment/function) should be done first so validation + creation are atomic.
- **Suggested owner:** Delivery Agent
- **Why now:** Complements the input validation added in PB-007. Addresses a different class of invalid input.

### DE-REC-011: Consolidate /drivers/[id]/computed into main driver transform

- **Title:** Eliminate N+1 query pattern in computed fields endpoint
- **Problem:** `src/app/api/drivers/[id]/computed/route.ts` makes 3 separate `findFirst()` queries (employment, function, roster) to compute active records for a single driver. This is redundant because the main driver endpoint already includes all these relations.
- **Proposed improvement:** Remove the separate computed endpoint. The main GET `/api/drivers/[id]` already returns employment/function/roster records, and the client-side `getComputedFields()` helper already computes derived fields from them.
- **Expected product/technical value:** Removes unnecessary API endpoint and 3 redundant queries. Simplifies the API surface.
- **Priority:** P3 Medium
- **Effort:** Small (remove route, update any callers)
- **Risk:** Low. Need to verify no frontend code calls this endpoint.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low-hanging fruit for API simplification.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (scenarioId, date, status) index on PlanningEntry for capacity groupBy
- **Problem:** The GET `/api/planning/capacity` endpoint uses `prisma.groupBy({ by: ["date", "status"], where: { date: { in: ... }, scenarioId: ... } })`. The existing `[scenarioId, date]` index helps with filtering but doesn't cover the `status` column used in groupBy, forcing a table scan for status values.
- **Proposed improvement:** Add a composite index `@@index([scenarioId, date, status])` to PlanningEntry. This covers both the WHERE filter and the GROUP BY columns.
- **Expected product/technical value:** Faster capacity calculations, especially as planning entry volume grows.
- **Priority:** P3 Medium
- **Effort:** Small (schema change + migration)
- **Risk:** Low. Additive index, no schema changes.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Capacity aggregation is a hot path. The index is cheap to maintain.

## Risks / Watch-outs

- **Employment/function creation race condition:** The employment and function POST handlers (DE-REC-009) still perform auto-close + create outside a transaction. This is the most significant remaining data integrity gap.
- **Stale isActive field:** The `isActive` boolean on Driver is now computed on read but still writable via PUT. This will confuse developers and could confuse future agents. DE-REC-010 addresses this.
- **Error logging exposure:** All API routes log full error objects (DE-REC-007). In a production environment with log aggregation, this could leak sensitive database information.
- **Sequence number race condition:** `getNextSequenceNumber()` reads the max sequence then increments. Concurrent requests for the same driver could compute the same number. Low real-world risk but worth noting for future transaction coverage.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated and the team is productive with it. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes do not justify the added complexity. Revisit when a specific endpoint shows performance issues.
- **Add authentication/authorization:** Flagged as a known gap in CLAUDE.md but explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx:** The component is complex (~650 lines) but stable. The two pre-existing ESLint warnings are non-blocking. Refactoring carries high risk for low payoff.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Adding regex validation is defensive but low ROI given no reported issues.
- **Add unique constraints on Driver/Scenario names:** Requires a migration and potentially data cleanup. Product decision needed on whether duplicates should be allowed.
- **Add enum validation for status fields:** Database columns are String type, not enums. Adding server-side enum validation is correct but requires defining the valid enum set server-side. Medium effort for low real-world risk (frontend already constrains values).
- **Pre-index lookups in api-helpers.ts:** The `getComputedFields()` and `groupDrivers()` functions use `Array.find()` for lookups. Converting to Map would be faster but current data volumes (dozens of employers/departments) make this a micro-optimization.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
