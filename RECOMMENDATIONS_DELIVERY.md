# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-049 (handleDragEnd stale closure), PB-050 (date validation on PUT routes), and PB-051 (scenario duplicate guard) are all complete. ESLint now runs with 0 warnings. The codebase is in solid shape. Remaining opportunities focus on: (1) Dutch consistency in English error messages in settings routes, (2) date timezone edge cases in aggregation logic, and (3) previously deferred items PB-018, PB-009, and PB-030 which remain valid.

## Recommended Next Improvements

### DE-REC-026: Fix English error messages in settings API routes

- **Title:** Translate "Unknown settings type" error to Dutch in settings routes
- **Problem:** `GET /api/settings/[type]` and `PUT /api/settings/[type]/[id]` return `"Unknown settings type"` in English when an invalid type parameter is provided. All other API error messages in the codebase are in Dutch.
- **Proposed improvement:** Change to `"Onbekend instellingentype"` in both routes.
- **Expected product/technical value:** UI language consistency per CLAUDE.md requirement that all user-facing text is Dutch.
- **Priority:** P4 Low
- **Effort:** Small (2 string changes)
- **Risk:** Low
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick consistency fix. Two lines of code.

### DE-REC-027: Add date validation to POST sub-record routes

- **Title:** Validate endDate >= startDate in employment, function, and roster assignment creation
- **Problem:** PB-050 added date validation to the PUT routes for sub-records, but the corresponding POST routes (`/api/drivers/[id]/employment`, `/api/drivers/[id]/functions`, `/api/drivers/[id]/roster-assignments`) also accept date fields without validating that `endDate >= startDate`.
- **Proposed improvement:** Add the same validation guard to 3 POST routes.
- **Expected product/technical value:** Complete coverage of date validation at API boundaries. Prevents invalid data on creation, not just update.
- **Priority:** P3 Medium
- **Effort:** Small (add one guard to 3 routes)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Complements the just-completed PB-050. Same pattern, same effort.

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

- **PerformanceEvent table growth:** `cleanupOldEvents()` in `perf.ts` is defined but never called. The `PerformanceEvent` table will grow indefinitely. Low urgency given low traffic, but worth noting.
- **StamtabelType enum mismatch:** `StamtabelType.LEAVE_TYPES = "leaveTypes"` does not match the API route segment `"leave-types"`. If the enum is ever used in route construction it will fail silently. Currently the enum is unused by route logic.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.
- **Date timezone handling in aggregation:** `aggregation.ts` and `utils.ts` parse date strings using `new Date(date + "T00:00:00")` without timezone specifier. This creates local-time Date objects, which could cause off-by-one day errors near midnight during DST transitions in non-UTC timezones. Vercel serverless runs in UTC so this is not a current production risk, but could surface if the server environment changes.

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
- **Replace `any` types in Toast.tsx and SubTable.tsx:** Low impact. The types are internal and well-contained.
- **Add settings code length validation to PUT route:** Minor inconsistency — POST validates code length <= 100 but PUT does not. Low impact since codes are typically short.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
