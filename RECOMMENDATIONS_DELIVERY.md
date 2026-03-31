# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-162 (import-sources list GET endpoint missing ADMIN role) was discovered and fixed this cycle — same class of security gap as PB-159. The codebase is stable with clean verify output. Two P3 consolidation recommendations (DE-REC-068, DE-REC-069) remain the highest-value next items. All P4 recommendations remain valid. No new critical issues discovered.

## Recommended Next Improvements

### DE-REC-068: Extract duplicated resolveUserId to shared module

- **Title:** Deduplicate `resolveUserId()` between preferences and scenarios/active routes
- **Problem:** `resolveUserId()` is fully duplicated between `src/app/api/preferences/route.ts` (line 12) and `src/app/api/scenarios/active/route.ts` (line 14). Both resolve the current user from session with fallback to "default" when auth is not configured.
- **Proposed improvement:** Extract to `src/lib/api-route-utils.ts` alongside other shared route helpers. Both routes import from there.
- **Expected product/technical value:** Eliminates ~15 lines of duplication. Ensures consistent behavior if fallback logic changes.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low (pure refactoring, no behavior change)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Follows the same extraction pattern applied in PB-160. Small, safe consolidation.

### DE-REC-069: Extract duplicated validateApiFields to shared module

- **Title:** Deduplicate `validateApiFields()` between import-sources route.ts and [id]/route.ts
- **Problem:** `validateApiFields()` is fully duplicated between `src/app/api/import-sources/route.ts` (line 11) and `src/app/api/import-sources/[id]/route.ts` (line 11). Both validate API source fields identically. The shared constants `VALID_TARGET_ENTITIES`, `VALID_SOURCE_TYPES`, `VALID_API_METHODS`, and `VALID_API_AUTH_TYPES` are also duplicated across both files.
- **Proposed improvement:** Move `validateApiFields()` and the validation constants to `src/lib/api-import-helpers.ts`. Both routes import from there.
- **Expected product/technical value:** Eliminates ~70 lines of duplication (function + constants). Prevents divergence if validation rules change (e.g., new auth type).
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low (pure refactoring, no behavior change)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** `api-import-helpers.ts` now exists as the natural home for shared import-source logic.

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber in transactions

- **Title:** Use Promise.all for independent operations inside sub-record creation transactions
- **Problem:** Employment, function, and roster-assignment POST handlers await `autoCloseOpenRecords()` then `getNextSequenceNumber()` sequentially inside `$transaction`. These two operations are independent (different tables/queries).
- **Proposed improvement:** Wrap both calls in `Promise.all()` within the transaction.
- **Expected product/technical value:** Saves one sequential DB round-trip per sub-record creation (~50-100ms on Neon serverless).
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low (both are reads before the write)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Minor optimization, cleanly applicable.

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

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Title:** Use Promise.all for independent queries in import execute handler
- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs sequential `findUnique()` then validation calls that could run in parallel.
- **Proposed improvement:** Wrap independent queries in `Promise.all()` to reduce round-trip latency on Neon serverless.
- **Expected product/technical value:** Faster import execution start time.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick optimization.

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
- **Why now:** Trivial fix.

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
- **Problem:** Magic numbers scattered across API routes. `MAX_FILE_SIZE` duplicated between execute and upload routes. `MAX_NOTES_LENGTH` duplicated between planning route and bulk route. Other magic numbers (364, 28, 10000, 500, 90, 100, 200, 50) appear in various routes.
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits. Eliminates duplication.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

### DE-REC-065: API response data path configuration

- **Title:** Allow users to specify the JSON path to the data array in API responses
- **Problem:** The current API execute handler uses a hardcoded list of wrapper keys (`data`, `results`, `items`, `rows`, `records`) to find the data array in JSON responses. Some APIs use non-standard paths (e.g., `response.employees.list`).
- **Proposed improvement:** Add an optional `apiDataPath` field to ImportSource that specifies the dot-notation path to the data array. Fall back to current auto-detection when not set.
- **Expected product/technical value:** Supports a wider range of APIs without code changes.
- **Priority:** P4 Low
- **Effort:** Small (schema field + one resolveJsonPath call in execute handler)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Natural follow-up to API Phase 1 for better API compatibility.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS` inline with hardcoded hex values.
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** Can be combined with DE-REC-047
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

- **API credentials storage is plaintext JSON:** The `apiCredentials` field stores credentials as JSONB. This is adequate for Phase 1 but should be reviewed before production use with real API keys. Consider server-side encryption or environment variable references for sensitive credentials.
- **PerformanceEvent table growth:** Table grows unbounded. `cleanupOldEvents()` exists but is never called.
- **API import timeout:** The 30-second timeout on external API requests may be insufficient for slow APIs returning large datasets. Vercel serverless function timeout (default 10s on Hobby, 60s on Pro) is the binding constraint.
- **API response size unbounded:** No limit on response body size from external APIs. A malicious or misconfigured API could return extremely large responses. The MAX_ROW_COUNT check only applies after parsing.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls.
- **Auth env vars required for deployment:** Auth requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials. Without these, auth is inactive and role enforcement is skipped silently.
- **useUserRole grants full permissions during session loading:** When session is loading or auth is not configured, the UI hook returns `isAdmin: true`.
- **No database-level length constraints:** All text field length validation is application-level only.
- **Audit log fire-and-forget pattern:** `logAudit()` silently catches errors. If the database connection fails, audit entries are silently dropped. This is by design (PB-146 scope note: audit failures must not block mutations).

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Settings/master data tables are small. Only planning and drivers needed pagination.
- **Refactor PlanningGrid.tsx broadly:** The component is complex but stable (~774 lines). Targeted fixes preferred.
- **Split ImportSourceManager.tsx (~1477 lines):** Large but well-structured with distinct sections (CSV flow, API flow, form, list). Splitting would fragment the connectivity hub feature.
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
- **P2025 error handling on sub-record DELETE routes:** Employment, function, and roster-assignment DELETE handlers return 500 instead of 404 for missing records. Low impact.
- **Scenario duplicate name detection:** No unique constraint check on scenario names. Requires product decision.
- **handleUpdate not wrapped in useCallback in PlanningGrid:** Would break the existing exhaustive-deps warnings. Marginal improvement for significant refactoring risk.
- **Encrypt apiCredentials at rest:** Phase 1 stores credentials as plaintext JSONB. Adequate for initial delivery; encryption should be addressed before production use with real API keys but is a product decision.
- **Limit API response body size:** Could add a streaming size check, but MAX_ROW_COUNT provides sufficient protection after parsing. Adding a byte-level limit would add complexity for marginal benefit.
- **Extract execute result UI into shared component:** The CSV and API execute result displays are similar but not identical. Extracting a shared component adds indirection for only 2 consumers.
- **Add React.memo to CapacityTable/CapacityKPIs:** These components render infrequently (only on data or filter changes). Internal `useMemo` provides sufficient optimization.
- **Extract SortIcon from PlanningGrid:** Tiny inline function. Moving outside component provides negligible benefit and reduces locality.
- **Centralize Map construction across components:** Each component constructs Maps from its own fetched data. A shared hook would add coupling without clear benefit.
- **Scoped cache invalidation in useApi:** Current global invalidation is simple and reliable. Scoped invalidation adds complexity without clear performance benefit at current data volumes.
- **Add error states to capacity/planning components:** These components receive data from parent pages that already handle loading/error states. Adding redundant error handling at the child level would be defensive coding without real benefit.
- **Extract useDebounce to custom hook:** Only used in DriverList with a simple inline implementation. Extraction for a single consumer adds indirection without benefit.
- **Add aria-labels to chart visualizations:** Recharts manages its own accessibility. Adding custom aria attributes would conflict with the library's internal handling.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
