# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-183 (date parsing deduplication) was completed this cycle, following PB-176/177/178 (code cleanup). `parseDateList()` now centralizes comma-separated date parsing, empty/max-length checks, and format validation across all three planning API routes. The codebase is stable with clean verify output.

A fresh codebase scan identified one **P2 High** bug (scenario DELETE hardcodes userId, silently corrupting per-user preferences when auth is enabled) and five new **P3 Medium** issues including missing auth on several GET endpoints, unvalidated date inputs on sub-record routes, and redundant session lookups on high-frequency planning routes.

## Recommended Next Improvements

### DE-REC-072: Fix scenario DELETE preference cleanup for authenticated users

- **Title:** Scenario DELETE hardcodes userId "default" — stale preferences persist for real users
- **Problem:** `/api/scenarios/[id]/route.ts` line 29 searches for the active scenario preference with hardcoded `userId: "default"`. When auth is enabled, real users have their actual UUID as userId. The cleanup query never matches, so deleted scenario IDs persist in the preferences table. On next load, the UI requests planning data for a non-existent scenario and silently receives empty results.
- **Proposed improvement:** Replace the single `findFirst` with a `deleteMany` that matches `key: "activeScenario", value: id` regardless of userId. This cleans up the stale preference for all users who had the deleted scenario active.
- **Expected product/technical value:** Prevents silent data loss when scenarios are deleted in auth-enabled deployments.
- **Priority:** P2 High
- **Effort:** Small (one query change)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** This is a real bug that causes silent user-facing data loss in production with auth enabled.

### DE-REC-073: Add auth checks to unauthenticated GET endpoints

- **Title:** Several GET API endpoints have no authentication check
- **Problem:** `GET /api/scenarios`, `GET /api/roster-profiles`, and driver sub-record GET handlers (`employment`, `functions`, `roster-assignments`) call neither `requireRole` nor any session check. The middleware only protects dashboard page routes, not API routes directly. In a public deployment, scenario names and driver sub-record data are publicly readable.
- **Proposed improvement:** Add `requireRole("VIEWER")` to these GET handlers, matching the permission matrix in CLAUDE.md (VIEWER = read-only on all GET endpoints).
- **Expected product/technical value:** Closes information disclosure gap. Enforces the stated permission model consistently.
- **Priority:** P3 Medium
- **Effort:** Small (add one line per handler)
- **Risk:** Low (no behavior change when auth is not configured, since requireRole skips enforcement without NEXTAUTH_SECRET)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Security gap that should be closed before any public-facing deployment.

### DE-REC-074: Validate date formats on sub-record routes before range comparison

- **Title:** Sub-record startDate/endDate comparison uses new Date() on unvalidated strings
- **Problem:** Employment, function, and roster-assignment POST/PUT handlers (6 route files) compare `endDate < startDate` via `new Date(endDate)` without first validating date format. When an invalid string is passed, `new Date("not-a-date")` returns `Invalid Date`, the comparison silently passes, and Prisma throws an opaque 500 error.
- **Proposed improvement:** Call `validateDateFormat()` (already exists in `api-route-utils.ts`) on both `startDate` and `endDate` before the range comparison. Return a clear 400 with Dutch error message on invalid format.
- **Expected product/technical value:** Produces clear validation errors instead of 500s on malformed date input.
- **Priority:** P3 Medium
- **Effort:** Small (add validation calls before existing comparison in 6 files)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Real validation gap that produces opaque errors on bad input.

### DE-REC-075: Reduce redundant getServerSession calls on planning routes

- **Title:** Double session lookup on routes that use both requireRole and getAllowedDepartmentIds
- **Problem:** `requireRole()` and `getAllowedDepartmentIds()` both independently call `getServerSession(authOptions)`. On planning POST, bulk, and DELETE routes, this means two DB round-trips for session lookup per request. On Neon serverless, each adds ~50-100ms latency.
- **Proposed improvement:** Add an optional `session` parameter to `getAllowedDepartmentIds()` so it can accept a pre-fetched session from `requireRole()`, or create a combined utility that fetches the session once.
- **Expected product/technical value:** Saves ~50-100ms on every authenticated planning mutation. Most impactful on the bulk update path.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Easy optimization on the highest-frequency routes.

### DE-REC-076: Add audit logging to driver sub-record mutations

- **Title:** Employment, function, and roster-assignment mutations have no audit trail
- **Problem:** All POST, PUT, and DELETE handlers for driver sub-records (employment, functions, roster-assignments) never call `logAudit()`. The driver entity itself is audited, but individual sub-record changes leave no trace. The audit log cannot answer "when was this driver's department changed?" or "who deleted the employment record?".
- **Proposed improvement:** Add `logAudit()` calls following the existing pattern used in skills, settings, and scenario routes.
- **Expected product/technical value:** Completes audit trail coverage for all mutable entities. Important for compliance.
- **Priority:** P3 Medium
- **Effort:** Medium (6 route files, ~4 lines per handler, 12-15 handlers total)
- **Risk:** Low (fire-and-forget pattern, audit failures don't block mutations)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Audit trail is incomplete for a category of frequently-changed records.

### DE-REC-077: Validate scenario ID exists before creating planning entries

- **Title:** Planning POST/bulk accept invalid scenario IDs, producing 500 instead of 400
- **Problem:** `resolveScenarioId()` normalizes "default" to null but passes any other string through without verifying the scenario exists. If the scenario ID is deleted or random, Prisma's FK constraint rejects with a constraint violation (500) instead of a helpful 400 response.
- **Proposed improvement:** Add `validateOptionalForeignKey(resolvedScenarioId, prisma.scenario, "scenario")` in planning POST and bulk handlers after resolving the scenario ID.
- **Expected product/technical value:** Better error messages on invalid scenario references.
- **Priority:** P3 Medium
- **Effort:** Small (one check in 2 files)
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Produces unhelpful 500 errors on a realistic user error path (deleted scenario still selected).

### DE-REC-070: Deduplicate VALID_TARGET_ENTITIES in ImportSourceManager.tsx (client-side)

- **Title:** Align client-side TARGET_ENTITIES with server-side VALID_TARGET_ENTITIES
- **Problem:** `ImportSourceManager.tsx` (line 11) defines its own `TARGET_ENTITIES` array with labels, while `api-import-helpers.ts` exports `VALID_TARGET_ENTITIES` as a plain string array. The values are identical but maintained separately. If a new target entity is added server-side, the client could fall out of sync.
- **Proposed improvement:** The client-side version includes UI labels (value + label pairs), so it can't directly reuse the server constant. However, add a comment in `ImportSourceManager.tsx` referencing `api-import-helpers.ts` as the source of truth, or create a shared `TARGET_ENTITY_OPTIONS` constant with labels that both sides can derive from.
- **Expected product/technical value:** Prevents silent divergence if target entities change.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Natural follow-up to PB-164. Low effort.

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

### DE-REC-030: Extract hardcoded constants and API limits to centralized config

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
- **Replace `any` types broadly:** ~20+ instances are internal and well-contained. Fix opportunistically.
- **Translate console.error messages:** Server-facing logging should remain in English.
- **Split DriverForm.tsx (~475 lines):** Well-structured with tab-based organization.
- **Other `.find()` calls in render paths:** ScenarioSelector, RosterAssigner, etc. operate on small arrays (<10 items). PlanningGrid line 502 uses `.find()` on DRIVER_COLUMNS (~8 items) — negligible.
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
- **Batch FK validation in driver creation:** Driver POST route validates FKs individually via `Promise.all()`. A batch query would be marginally faster but adds complexity for a low-frequency operation.
- **Deduplicate date-parsing logic:** Completed as PB-183. `parseDateList()` now centralizes this in `api-route-utils.ts`.
- **Move COMPARE_COLORS / remove unused types / clean mobile CSS:** Completed as PB-176/177/178.
- **Preferences `key` field length cap:** Same category as DE-REC-058 (value field). Near-zero risk since keys are hardcoded strings in the frontend.
- **useApi cache key uses Function.toString():** Theoretically fragile under minification, but in practice different arrow functions produce different minified strings because URL strings differ. React Query-style explicit keys would be cleaner but a significant refactor for a working system.
- **Import logs route sequential queries:** Two sequential queries instead of parallel. P4 Low, same category as DE-REC-059.
- **autoCloseOpenRecords UTC dependency:** The `new Date()` + `toISOString()` pattern is correct because `toISOString()` always returns UTC. A clarifying comment would help but is not a defect.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
