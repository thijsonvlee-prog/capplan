# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed the **Delivery Agent part of PB-149**: the `GET /api/audit-log` endpoint with pagination, filtering, ADMIN-only access, and user name/email via User join. Domain types (`AuditLogEntry`, `AuditLogPagination`) and frontend fetcher (`api.auditLog.list()`) are in place for the Experience Agent to build the viewer UI.

The codebase is stable. The fresh scan identified one new medium-priority issue (redundant DB query in `autoCloseOpenRecords`) and confirms all existing P4 recommendations remain valid. PB-150 (API source data model) is next in sequence for the Delivery Agent.

## Recommended Next Improvements

### DE-REC-061: Eliminate redundant findMany in autoCloseOpenRecords

- **Title:** Remove unnecessary findMany check before updateMany in autoCloseOpenRecords
- **Problem:** `autoCloseOpenRecords()` in `api-route-utils.ts` (lines 406-424) calls `findMany()` to check if records exist, then `updateMany()` on the same criteria. The `findMany` result is only used for a `.length > 0` guard, but `updateMany` with zero matches is a no-op — the guard is unnecessary.
- **Proposed improvement:** Remove the `findMany` call and execute `updateMany` unconditionally. Saves one DB round-trip per employment/function/roster-assignment creation.
- **Expected product/technical value:** Reduces latency on sub-record creation. Eliminates ~3 unnecessary DB calls per driver edit workflow on Neon serverless.
- **Priority:** P3 Medium
- **Effort:** Small (remove 5 lines)
- **Risk:** Low (updateMany with zero matches returns `{ count: 0 }`)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick win that reduces round-trip cost on every sub-record creation.

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber in transactions

- **Title:** Use Promise.all for independent operations inside sub-record creation transactions
- **Problem:** Employment, function, and roster-assignment POST handlers await `autoCloseOpenRecords()` then `getNextSequenceNumber()` sequentially inside `$transaction`. These two operations are independent (different tables/queries).
- **Proposed improvement:** Wrap both calls in `Promise.all()` within the transaction.
- **Expected product/technical value:** Saves one sequential DB round-trip per sub-record creation.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low (both are reads before the write)
- **Dependencies:** DE-REC-061 (apply first for cleaner code)
- **Suggested owner:** Delivery Agent
- **Why now:** Minor optimization, apply together with DE-REC-061.

### DE-REC-063: Add weeklyHours range validation on roster assignment routes

- **Title:** Validate weeklyHours bounds (0-168) on roster assignment POST/PUT
- **Problem:** The `weeklyHours` field on roster assignments is accepted without bounds validation. A negative value or impossibly high value (e.g., 999) would be stored without error.
- **Proposed improvement:** Add `if (weeklyHours != null && (weeklyHours < 0 || weeklyHours > 168))` check with Dutch error message.
- **Expected product/technical value:** Completes validation coverage on the last unvalidated numeric field.
- **Priority:** P4 Low
- **Effort:** Small (one check)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Trivial validation gap.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Title:** Use Promise.all for independent queries in import execute handler
- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs sequential `findUnique()` then `count()` calls that are independent and could run in parallel.
- **Proposed improvement:** Wrap independent queries in `Promise.all()` to reduce round-trip latency on Neon serverless.
- **Expected product/technical value:** Faster import execution start time. Consistent with parallel patterns used in drivers and planning routes.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick optimization during next cycle.

### DE-REC-058: Add length validation on user preference value field

- **Title:** Cap `value` length on preferences PUT route
- **Problem:** The preferences PUT route (`/api/preferences/route.ts`) accepts an unbounded `value` string. While it currently stores short values (scenario IDs), it's the only remaining POST/PUT route without a text field length cap.
- **Proposed improvement:** Add a 500-char cap on the `value` field with a Dutch error message.
- **Expected product/technical value:** Completes the validation pattern across 100% of write endpoints.
- **Priority:** P4 Low
- **Effort:** Small (one check)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Trivial fix that completes full validation coverage.

### DE-REC-047: Move COMPARE_COLORS outside CapacityChart component

- **Title:** Hoist COMPARE_COLORS array to module scope in CapacityChart
- **Problem:** `COMPARE_COLORS` is defined inside the `CapacityChart` component function, creating a new array reference on every render. This breaks referential stability for child `<Area>` components.
- **Proposed improvement:** Move `const COMPARE_COLORS = [...]` outside the component function to module scope.
- **Expected product/technical value:** Minor render optimization; follows established pattern (other constants like STATUS_COLORS are module-scoped).
- **Priority:** P4 Low
- **Effort:** Small (one-line move)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Trivial fix during next cycle.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Title:** Clean up dead type definitions in types.ts
- **Problem:** `PlanningEntryOptions` and `UserContext` are defined but never imported anywhere.
- **Proposed improvement:** Remove unused types.
- **Expected product/technical value:** Reduces confusion for developers reading the types file.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick cleanup.

### DE-REC-030: Extract hardcoded API limits to constants

- **Title:** Centralize magic numbers in API routes to `constants.ts`
- **Problem:** Magic numbers scattered across API routes: 364 (roster days), 28 (roster cycle), 50000 (max duplicate entries), 5000 (chunk size), 366 (max dates), 500 (max notes), 90 (max range), 100 (max code length), 200 (max name length), 50 (max employeeNumber length), 5MB (max file size), 10000 (max import rows), 500 (chunk size), 20 (max import logs). Additionally, `MAX_FILE_SIZE` and `MAX_NOTES_LENGTH` are duplicated across multiple route files.
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits. Eliminates duplication.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS` inline with hardcoded hex values.
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick compliance fix.

### DE-REC-031: Add PerformanceEvent table cleanup

- **Title:** Call `cleanupOldEvents()` or add TTL-based cleanup for PerformanceEvent
- **Problem:** `cleanupOldEvents()` in `src/lib/perf.ts` is defined but never called. Table grows indefinitely.
- **Proposed improvement:** Call `cleanupOldEvents()` periodically or at the end of `withPerfLogging`.
- **Expected product/technical value:** Prevents unbounded table growth.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene.

## Risks / Watch-outs

- **Audit log fire-and-forget pattern:** `logAudit()` silently catches errors. If the database connection fails or the audit table has issues, mutations succeed but audit entries are silently dropped. Console errors are the only signal. This is by design (PB-146 scope note: audit failures must not block mutations), but operators should monitor console output for "Audit log write failed" messages.
- **Audit log table growth:** With all entities now audited, the AuditLog table will grow faster. No cleanup mechanism exists yet. At current usage this is not urgent, but should be monitored.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls. A failed save leaves the UI showing unsaved state. This is a known design choice.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials. Without these, auth is inactive and role enforcement is skipped silently.
- **useUserRole grants full permissions during session loading:** When session is loading or auth is not configured, the UI hook returns `isAdmin: true`. Admin-only controls flash briefly on page load for non-admin users.
- **No database-level length constraints:** All text field length validation is application-level only. The Prisma schema uses unbounded `String` types. Application validation is the only defense.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Settings/master data tables are small. Only planning and drivers needed pagination.
- **Refactor PlanningGrid.tsx broadly:** The component is complex but stable. Targeted fixes preferred.
- **Split ImportSourceManager.tsx (~838 lines):** Large but well-structured with distinct sections. Splitting would fragment the connectivity hub feature.
- **Split UserGroupManager.tsx (~642 lines):** Well-structured with clear sections. Not justified.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Only planning endpoints warrant it.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision.
- **Extend withPerfLogging to all routes:** Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** ~27 instances are internal and well-contained. Fix opportunistically.
- **Translate console.error messages:** Server-facing logging should remain in English.
- **Split DriverForm.tsx (~475 lines):** Well-structured with tab-based organization.
- **Other `.find()` calls in render paths:** ScenarioSelector, RosterAssigner, etc. operate on small arrays (<10 items).
- **Wrap DELETE routes in transactions:** Theoretical race condition at current concurrency.
- **Add React.memo to settings list items:** Small lists, infrequent renders.
- **Add missing foreign key indexes:** Not bottlenecks at current data volumes.
- **Add input validation schema (Zod):** Introduces a new dependency. Not justified at current scale.
- **Distinguish error types in catch blocks:** Significant refactoring across route files for minimal benefit.
- **Add parent driver existence checks in sub-record routes:** Prisma FK constraints catch this.
- **Use next-auth v5 (Auth.js):** v4 is proven and stable with Next.js 14. Migration to v5 can happen when upgrading to Next.js 15.
- **Add React.memo to StatusBadge/StatusSelector:** Rendered within already-memoized DayCell; marginal improvement.
- **Standardize API response wrapping:** Some routes use `{ data }` wrapper, others return raw objects. Changing this is a breaking API contract change.
- **Add composite (driverId, scenarioId, date) index:** The unique constraint already covers this query pattern.
- **Type-safe dynamic Prisma model access:** The `(prisma as any)[modelName]` pattern is pragmatic for entity-generic import logic.
- **Wrap audit writes in $transaction with mutations:** PB-146/147 design choice: audit failures must not block mutations. Fire-and-forget is correct.
- **Add React.memo to Header/Sidebar/ZoomSelector:** These render infrequently and are not in hot paths.
- **Add error tracking service for audit failures:** Requires external infrastructure. Console logging is sufficient at current scale.
- **Validate roster profile entry dayOffset/status:** Entries created from fixed UI grid; invalid values can't arrive normally.
- **Unsafe `context?: any` in roster-assignments and scenario duplicate routes:** Stylistic; Next.js 14 doesn't enforce typed params.
- **useApi console.error logging:** Intentional for debugging. Error state is surfaced to consumers.
- **for-range route orderBy diverges from drivers route:** Minor inconsistency on duplicate surnames.
- **for-range inline driverIncludeFields diverges from canonical driverInclude:** Intentional optimization.
- **csv-parser escaped quote handling for non-comma separators:** Low risk for typical Dutch HR data exports.
- **Audit planning entries:** High-volume writes (drag-select creates many entries). Would generate excessive audit data. Excluded by design in PB-148.
- **P2025 error handling on sub-record DELETE routes:** Employment, function, and roster-assignment DELETE handlers return 500 instead of 404 for missing records. Low impact — sub-records are accessed via parent driver UI, so deleting non-existent records is rare.
- **Scenario duplicate name detection:** No unique constraint check on scenario names. Requires product decision (some users may intentionally create same-named scenarios for comparison).
- **handleUpdate not wrapped in useCallback in PlanningGrid:** Would break the existing exhaustive-deps warnings. The DayCell memo already works via entry-level comparison. Marginal improvement for significant refactoring risk.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
