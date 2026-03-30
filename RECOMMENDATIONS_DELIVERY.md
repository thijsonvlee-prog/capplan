# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed five backlog items: PB-111 (user group enforcement on data routes), PB-117 (stamtabel import batch optimization), PB-118 (preferences user-scoping), PB-119 (planning status enum validation), and PB-120 (planning sickPercentage range validation).

With user groups fully shipped (Phases 1–3), the authorization model is now complete. All import paths use batch lookups. Preferences are per-user. Planning endpoints validate all input fields.

A fresh codebase scan identified several remaining opportunities. The most impactful are: user group enforcement on the planning single-entry GET (DE-REC-056), capacity endpoint scoping efficiency (DE-REC-057), and the ongoing POC capacity summary row decision (DE-REC-036).

## Recommended Next Improvements

### DE-REC-056: User group enforcement — planning GET and individual driver routes

- **Title:** Apply department filtering to planning GET and driver [id] GET routes
- **Problem:** PB-111 applied user group filtering to the list endpoints (`/api/drivers` GET, `/api/planning/for-range` GET, `/api/planning/capacity` GET). However, the single-entry GET routes (`/api/planning` GET by dates/driverId, `/api/drivers/[id]` GET) do not enforce department filtering. A user could access a specific driver's data by ID even if the driver is outside their group's departments.
- **Proposed improvement:** Apply the same `getAllowedDepartmentIds()` + `driverDepartmentFilter()` pattern to these individual-access routes.
- **Expected product/technical value:** Complete authorization coverage. Prevents data leakage through direct ID access.
- **Priority:** P2 High
- **Effort:** Small
- **Risk:** Low — same proven pattern as PB-111.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Completes the authorization gap left by PB-111's focus on list endpoints.

### DE-REC-057: Capacity endpoint — avoid driver ID pre-fetch for user group filtering

- **Title:** Optimize capacity endpoint user group filtering to avoid loading all driver IDs
- **Problem:** The current PB-111 implementation in `/api/planning/capacity` fetches all driver IDs in the user's departments (`findMany` + `select: { id: true }`), then passes them as a `driverId: { in: [...] }` filter to `groupBy`. For organizations with many drivers, this means loading thousands of IDs into memory and passing a large `IN` clause.
- **Proposed improvement:** Use a Prisma subquery or join-based approach: filter `planningEntry` where `driver.functionRecords.some({ departmentId: { in: allowedDeptIds } })` directly in the `groupBy` where clause.
- **Expected product/technical value:** Reduces memory usage and query size for large organizations.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low — Prisma supports relation filters in `groupBy` where clauses.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Performance optimization for the capacity endpoint at scale.

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Title:** Replace `planningEntries.find()` with Map-based lookup in CapacitySummaryRow
- **Problem:** `CapacitySummaryRow.tsx` uses `.find()` inside a nested loop over drivers x dates. Same hot-path pattern that was fixed in PlanningGrid (PB-066).
- **Proposed improvement:** Build a local Map inside the component or pass `entryMaps` from PlanningGrid.
- **Expected product/technical value:** Consistent O(1) lookup pattern. Performance improvement for large grids.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low. Same proven pattern.
- **Dependencies:** Decision on whether CapacitySummaryRow POC should be promoted or removed.
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, but depends on the POC's future.

### DE-REC-030: Extract hardcoded API limits to constants

- **Title:** Centralize magic numbers in API routes to `constants.ts`
- **Problem:** Magic numbers scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 5000 (duplication chunk size), 366 (max bulk dates), 90 (max date range), 100 (max code length), 5MB (max file size), 10000 (max import rows), 500 (max page size/chunk size), 20 (max import logs).
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS` inline with hardcoded hex values.
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick compliance fix.

### DE-REC-031: Add PerformanceEvent table cleanup

- **Title:** Call `cleanupOldEvents()` or add TTL-based cleanup for PerformanceEvent
- **Problem:** `cleanupOldEvents()` in `src/lib/perf.ts` is defined but never called. Table grows indefinitely.
- **Proposed improvement:** Call `cleanupOldEvents()` periodically or at the end of `withPerfLogging`.
- **Expected product/technical value:** Prevents unbounded table growth.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene.

## Risks / Watch-outs

- **Individual-access routes not yet group-filtered:** `/api/drivers/[id]` GET and `/api/planning` GET (by driverId) do not enforce user group filtering. A user could access individual records outside their department scope by ID. DE-REC-056 proposes the fix.
- **Capacity endpoint driver ID pre-fetch:** The `getAllowedDepartmentIds()` + `findMany` approach in the capacity endpoint works correctly but loads all matching driver IDs into memory. At current scale this is fine; at 10k+ drivers it could become a bottleneck. DE-REC-057 proposes an optimization.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls. A failed save leaves the UI showing unsaved state. This is a known design choice.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed to avoid maintaining dead/experimental code.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials. Without these, auth is inactive and role enforcement is skipped silently.
- **Driver upsert without unique constraint:** Driver import upsert matches on `employeeNumber` using `findMany` (not a unique constraint). If multiple drivers share an `employeeNumber`, the batch lookup returns the first match. Adding a unique constraint is a product decision.
- **useUserRole grants full permissions during session loading:** When session is loading or auth is not configured, the UI hook returns `isAdmin: true`. This means admin-only controls flash briefly on page load for non-admin users.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Settings/master data tables are small. Only planning and drivers needed pagination.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~700 lines) but stable. Targeted fixes preferred.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Only planning endpoints warrant it because they accept comma-separated date lists.
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
- **Add file storage for uploaded CSVs:** Not needed — import re-uploads the file for execution.
- **Add scheduled/automatic imports:** Requires external trigger mechanism. Out of scope for current MVP.
- **Add React.memo to StatusBadge/StatusSelector:** Rendered within already-memoized DayCell; marginal improvement.
- **Batch FK validation in driver POST route:** Current parallel Promise.all approach is already efficient.
- **Add React.memo to GroupRows component:** Marginal improvement — PlanningGrid manages re-renders via entry maps.
- **CSV injection sanitization:** CSV data is stored in database fields, not re-exported to spreadsheets.
- **Standardize API response wrapping:** Some routes use `{ data }` wrapper, others return raw objects. Changing this is a breaking API contract change.
- **Add composite (driverId, scenarioId, date) index:** The unique constraint already covers this query pattern.
- **Add request rate limiting on imports:** No per-user tracking at current scale.
- **Add concurrent request deduplication in useApi:** Low-frequency issue.
- **Add progress tracking for long operations:** Would require streaming responses or a job queue.
- **Type-safe dynamic Prisma model access:** The `(prisma as any)[modelName]` pattern is pragmatic for entity-generic import logic.
- **Clean up orphan User records retroactively:** Requires manual identification. Separate concern from prevention (PB-107).
- **Replace `useApi` cache key from `fetcher.toString()` to stable keys:** The current approach works because all fetch calls use named methods from `api.ts`.
- **Add error handling to PlanningGrid optimistic updates:** Deliberate design choice documented in CLAUDE.md.
- **Type the `parseJsonBody<T>` generic per route:** Would require ~25 request body interfaces.
- **Add auth checks to GET endpoints:** CLAUDE.md states VIEWER = read-only on all GET endpoints. User group filtering handles data scoping without blocking reads.
- **Add driverId FK validation on planning POST:** Prisma FK constraint catches invalid IDs. Adding a pre-check doubles the query count for the most common write operation.
- **Refactor useApi global cache invalidation:** The broadcast approach works because cache entries have a 30s freshness window.
- **autoCloseOpenRecords race condition:** Theoretical at current concurrency. Would require wrapping callers in transactions.
- **Add user group filtering to write endpoints:** Write endpoints already require the user to know the driver ID. The ID-level access gap (DE-REC-056) is the more impactful fix for reads.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
