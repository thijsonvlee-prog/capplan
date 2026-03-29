# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-004 (transaction wrapping on roster assignment) and PB-007 (API input validation) are now completed. The roster assignment POST handler is the only multi-step mutation currently protected by a transaction. Fresh codebase analysis reveals five additional multi-step mutations that lack transaction wrapping, plus opportunities for improved error handling and foreign key validation.

## Recommended Next Improvements

### DE-REC-006: Wrap remaining multi-step mutations in transactions

- **Title:** Add transaction wrapping to driver update, roster profile update, scenario duplicate, scenario delete, and skill delete
- **Problem:** Five API routes perform multiple sequential database operations without `$transaction`:
  1. **PUT `/api/drivers/[id]`** — deletes all driver skills, recreates them, then updates driver. If update fails, skills are lost.
  2. **PUT `/api/roster-profiles/[id]`** — updates name, deletes all days, recreates days. Partial failure leaves profile with no days.
  3. **POST `/api/scenarios/[id]/duplicate`** — creates scenario, copies planning entries. Failure after create leaves empty scenario.
  4. **DELETE `/api/scenarios/[id]`** — deletes scenario, then cleans up active preference. Failure leaves orphaned preference.
  5. **DELETE `/api/settings/skills/[id]`** — deletes driver-skill associations, then deletes skill. Failure leaves orphaned associations.
- **Proposed improvement:** Wrap each handler's database operations in `prisma.$transaction()`, following the pattern established in the roster assignment route.
- **Expected product/technical value:** Eliminates data corruption risk from partial writes across all mutation endpoints. Consistent transaction usage across the codebase.
- **Priority:** P2 High
- **Effort:** Small (5 files, mechanical change following established pattern)
- **Risk:** Low. All operations are compatible with interactive transactions.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** These are the remaining multi-step mutations after PB-004. The pattern is established and the risk of partial writes is real.

### DE-REC-007: Sanitize error logging in API catch blocks

- **Title:** Prevent internal error details from leaking via console.error
- **Problem:** All API route catch blocks log the full error object via `console.error("Error ...", error)`. Prisma errors can contain connection strings, SQL details, and schema internals. While these don't reach the client response (which returns generic messages), they appear in server logs and could be exposed via log aggregation tools.
- **Proposed improvement:** Log only `error instanceof Error ? error.message : "Unknown error"` in catch blocks. Optionally log `error.code` for Prisma-specific errors to aid debugging without exposing internals.
- **Expected product/technical value:** Reduces information disclosure risk in production logs. Aligns with CLAUDE.md security guidelines.
- **Priority:** P3 Medium
- **Effort:** Small (mechanical change across ~20 route files)
- **Risk:** Low. Only affects logging, not response behavior.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low effort, broad defensive value. Good hygiene item.

### DE-REC-008: Add foreign key existence checks before relation creation

- **Title:** Validate foreign key references before creating related records
- **Problem:** The driver PUT handler accepts `skillIds` and creates `DriverSkill` records without verifying those skill IDs exist. Similarly, employment/function POST handlers accept `employerId`, `locationId`, `departmentId` without existence checks. Invalid IDs cause Prisma foreign key constraint errors that return generic 500 responses.
- **Proposed improvement:** Before creating related records, verify referenced IDs exist with a `findMany` count check. Return a clear 400 error with Dutch message if any reference is invalid.
- **Expected product/technical value:** Better error UX when invalid references are submitted. Prevents confusing 500 errors.
- **Priority:** P3 Medium
- **Effort:** Medium (touches several routes, needs careful scope)
- **Risk:** Low. Only adds early-return guards.
- **Dependencies:** DE-REC-006 (transaction wrapping) should be done first so validation + creation are atomic.
- **Suggested owner:** Delivery Agent
- **Why now:** Complements the input validation added in PB-007. Addresses a different class of invalid input.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (scenarioId, date, status) index on PlanningEntry for capacity groupBy
- **Problem:** The GET `/api/planning/capacity` endpoint uses `prisma.groupBy({ by: ["date", "status"], where: { date: { in: ... }, scenarioId: ... } })`. The existing `[scenarioId, date]` index helps with filtering but doesn't cover the `status` column used in groupBy, forcing a table scan for status values.
- **Proposed improvement:** Add a composite index `@@index([scenarioId, date, status])` to PlanningEntry. This covers both the WHERE filter and the GROUP BY columns.
- **Expected product/technical value:** Faster capacity calculations, especially as planning entry volume grows. The capacity endpoint is called frequently during normal planning workflow.
- **Priority:** P3 Medium
- **Effort:** Small (schema change + migration)
- **Risk:** Low. Additive index, no schema changes.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Capacity aggregation is a hot path. The index is cheap to maintain and directly benefits the most common read pattern.

## Risks / Watch-outs

- **Transaction coverage gap:** Five multi-step mutations (DE-REC-006) still lack transaction wrapping. The driver update handler is particularly risky because it deletes all skill associations before recreating them — a failure between delete and create loses all driver skills.
- **Sequence number race condition:** `getNextSequenceNumber()` reads the max sequence then increments. Concurrent requests for the same driver could compute the same number. This is mitigated for roster assignments by the new transaction, but employment and function records still use it outside a transaction. Low real-world risk (concurrent sub-record creation for the same driver is rare) but worth noting.
- **No unique constraints on Driver or Scenario names:** Duplicate drivers and scenarios can be created. This is a schema-level issue that would require a migration and policy decision about handling existing duplicates.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated and the team is productive with it. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes do not justify the added complexity. Revisit when a specific endpoint shows performance issues.
- **Add authentication/authorization:** Flagged as a known gap in CLAUDE.md but explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx:** The component is complex (~650 lines) but stable. The two pre-existing ESLint warnings are non-blocking. Refactoring carries high risk for low payoff right now.
- **Add date format validation to all endpoints:** While dates are not validated for format, Prisma/PostgreSQL reject invalid dates at the storage layer. Adding regex validation is defensive but low ROI given no reported issues.
- **Add unique constraints on Driver/Scenario:** Requires a migration and potentially data cleanup. Product decision needed on whether duplicates should be allowed or prevented.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
