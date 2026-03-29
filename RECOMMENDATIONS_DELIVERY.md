# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-002 (composite indexes) has been completed. The DriverRosterAssignment model now has a composite index on (driverId, startDate, endDate). PlanningEntry already had good composite indexes from a prior migration.

Fresh codebase analysis reveals three improvement opportunities: missing transaction wrapping on the roster assignment endpoint (data consistency risk), missing input validation across multiple API routes, and an opportunity to add a capacity aggregation index for groupBy performance.

## Recommended Next Improvements

### DE-REC-003: Wrap roster assignment creation in a $transaction

- **Title:** Add transaction wrapping to roster assignment endpoint
- **Problem:** The POST `/api/drivers/[id]/roster-assignments` endpoint performs 4-5 sequential database operations (auto-close records, get next sequence number, create assignment, fetch existing entries, batch create/update planning entries) without a `$transaction` wrapper. If any step fails mid-way, the database is left in an inconsistent state with partial roster data.
- **Proposed improvement:** Wrap the entire POST handler's database operations in `prisma.$transaction()` to ensure atomicity. On failure, all changes roll back cleanly.
- **Expected product/technical value:** Prevents partial writes that leave orphaned planning entries or closed-but-unlinked roster records. Eliminates a class of hard-to-diagnose data corruption bugs.
- **Priority:** P2 High
- **Effort:** Small (single file change)
- **Risk:** Low. All existing operations are compatible with interactive transactions. No behavior change on success.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is the highest-impact multi-step mutation in the app (generates 364 planning entries). The fix is straightforward and the risk of not fixing it grows with usage.

### DE-REC-004: Add input validation to API route POST/PUT handlers

- **Title:** Validate required fields in API routes
- **Problem:** Several API routes accept POST/PUT bodies without validating required fields. For example, the roster profile POST route does not validate that `name` is present or non-empty. The driver POST route similarly lacks field validation. Missing fields result in cryptic Prisma constraint errors rather than clear user-facing messages.
- **Proposed improvement:** Add validation checks at the top of each POST/PUT handler for required fields. Return `{ error: "..." }` with status 400 and a Dutch-language message when validation fails. Use a shared helper in `api-route-utils.ts` to keep it DRY.
- **Expected product/technical value:** Better error UX for users. Prevents Prisma errors from reaching the frontend. Aligns with CLAUDE.md security guidelines on input sanitization.
- **Priority:** P3 Medium
- **Effort:** Medium (touches ~10 route files)
- **Risk:** Low. Only adds early-return guards. No changes to happy-path behavior.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is a security hygiene and UX quality item. Low risk, broad defensive value.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (date, scenarioId, status) index on PlanningEntry for capacity groupBy
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

- The roster assignment endpoint's lack of transaction wrapping (DE-REC-003) is the most significant data consistency risk in the current codebase. If a network error or timeout occurs during the 364-entry planning generation, partial data will persist.
- API routes that return raw error messages from catch blocks may expose internal schema details to the frontend. This is partially mitigated by the fact that most routes use generic error messages, but Prisma unique constraint violations can leak through.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated and the team is productive with it. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes do not justify the added complexity. Revisit when a specific endpoint shows performance issues.
- **Add authentication/authorization:** Flagged as a known gap in CLAUDE.md but explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx:** The component is complex (~650 lines) but stable. The two pre-existing ESLint warnings are non-blocking. Refactoring carries high risk for low payoff right now.
- **Add covering indexes for all query patterns:** Some queries (single-record lookups by ID, low-frequency admin operations) don't benefit from additional indexes. Only add indexes where query frequency and data volume justify the write overhead.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
