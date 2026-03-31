# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed PB-136 (department scope on planning writes), PB-137 (surface API error messages), and PB-138 (notes length cap). The authorization model is now consistent across read and write planning endpoints. Users see meaningful Dutch error messages instead of generic failures.

A fresh codebase scan uncovered two high-priority gaps: missing `employmentType` enum validation on employment record endpoints (invalid values can be stored), and missing `maxLength` validation on several text fields across settings and driver sub-record routes. Additionally, duplicate skill names can be created without warning.

## Recommended Next Improvements

### DE-REC-052: Add employmentType enum validation to employment routes

- **Title:** Validate `employmentType` against domain enum on employment POST and PUT
- **Problem:** The employment POST route (`/api/drivers/[id]/employment/route.ts`) and PUT route (`/api/drivers/[id]/employment/[recordId]/route.ts`) accept any string for `employmentType` without validating against the `EmploymentType` enum (PERMANENT, TEMPORARY, CHARTER). Invalid values pass through to the database, which may break downstream logic that checks employment type strings (e.g., PlanningGrid charter detection).
- **Proposed improvement:** Add validation against `Object.values(EmploymentType)` in both POST and PUT handlers, returning a Dutch error message for invalid values.
- **Expected product/technical value:** Prevents invalid employment types from being stored. Ensures downstream logic (charter detection, capacity calculations) operates on valid data.
- **Priority:** P2 High
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Same pattern as the status validation already on planning endpoints. Quick defensive fix.

### DE-REC-053: Add maxLength validation on description and text fields

- **Title:** Cap `description` field length on stamtabel routes and text fields on driver sub-records
- **Problem:** The stamtabel `description` field (settings routes) has no length validation — only `code` is capped at 100 chars. Similarly, `position` and `manager` fields on function records, and `notes` on employment records have no length caps. These are all unbounded TEXT columns.
- **Proposed improvement:** Add consistent length caps: 500 chars for `description`, 200 chars for `position`/`manager`, matching the notes cap pattern.
- **Expected product/technical value:** Completes the defensive validation story across all write endpoints. Prevents unbounded storage.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Natural follow-up to PB-138. Same validation pattern applied more broadly.

### DE-REC-054: Prevent duplicate skill names

- **Title:** Check for existing skill name before creating in POST `/api/settings/skills`
- **Problem:** The skills POST endpoint doesn't check if a skill with the same name already exists. Unlike stamtabellen (where `code` uniqueness is enforced by the database), skills can have duplicate names, leading to redundant competencies in selectors.
- **Proposed improvement:** Add a `findFirst` check by name before creating. Return a Dutch error message if a skill with the same name exists.
- **Expected product/technical value:** Prevents data quality issues in skill assignment. Users won't see duplicate competencies in dropdowns.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick defensive fix. Skill list is user-facing in driver forms.

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
- **Problem:** Magic numbers scattered across API routes: 364 (roster days), 28 (roster cycle), 50000 (max duplicate entries), 5000 (chunk size), 366 (max dates), 500 (max notes), 90 (max range), 100 (max code length), 5MB (max file size), 10000 (max import rows), 500 (chunk size), 20 (max import logs).
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
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

- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls. A failed save leaves the UI showing unsaved state. This is a known design choice.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials. Without these, auth is inactive and role enforcement is skipped silently.
- **Driver upsert without unique constraint:** Driver import upsert matches on `employeeNumber` using `findMany` (not a unique constraint). If multiple drivers share an `employeeNumber`, the batch lookup returns the first match.
- **useUserRole grants full permissions during session loading:** When session is loading or auth is not configured, the UI hook returns `isAdmin: true`. Admin-only controls flash briefly on page load for non-admin users.

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
- **Other `.find()` calls in render paths:** ScenarioSelector, RosterAssigner, etc. operate on small arrays (<10 items). PlanningGrid scenario lookup is also small array.
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
- **Clean up orphan User records retroactively:** Requires manual identification.
- **Replace `useApi` cache key from `fetcher.toString()` to stable keys:** The current approach works because all fetch calls use named methods from `api.ts`.
- **Add error handling to PlanningGrid optimistic updates:** Deliberate design choice documented in CLAUDE.md.
- **Type the `parseJsonBody<T>` generic per route:** Would require ~25 request body interfaces.
- **Add auth checks to GET endpoints:** CLAUDE.md states VIEWER = read-only on all GET endpoints. User group filtering handles data scoping.
- **Add driverId FK validation on planning POST:** Prisma FK constraint catches invalid IDs.
- **Refactor useApi global cache invalidation:** The broadcast approach works because cache entries have a 30s freshness window.
- **autoCloseOpenRecords race condition:** Theoretical at current concurrency.
- **Add cache eviction to useApi:** Key space is bounded in practice.
- **Add parent driver existence checks in sub-record GET routes:** Returns empty array for non-existent driver. Correct behavior.
- **Add date format validation on sub-record POST endpoints:** Prisma/PostgreSQL rejects invalid dates at storage layer.
- **Validate roster profile entry dayOffset/status:** Entries created from fixed UI grid; invalid values can't arrive normally.
- **Warning tokens unused in CSS classes:** May be used via Tailwind utilities directly.
- **`--radius-xl` token unused:** Keep for future use; removing saves nothing.
- **Type `any` in transformDriver/transformProfile:** Internal helpers with well-understood input shapes.
- **Precompute DRIVER_COLUMNS as Map in PlanningGrid:** Small fixed-size array; `.find()` on 5-6 items is negligible.
- **useApi cache key `fetcher.toString()` fragility:** Theoretically breaks under minification, but in practice all callers use named methods from `api.ts` and pass runtime values via `deps`. No reported issues.
- **PlanningGrid `localData` double-render pattern:** Optimistic updates require shadow state.
- **PlanningGrid `resolveColumnValue` deps cause full re-sort:** Only triggers when lookup data changes (infrequent).
- **csv-parser string copy for non-comma separators:** Only affects files near 5MB limit with non-comma separators.
- **autoCloseOpenRecords type signature doesn't enforce tx context:** Always called correctly in practice.
- **Scenario duplicate partial-failure on crash:** Requires server process kill mid-operation.
- **DayCell popup magic numbers:** Coupled to CSS but stable.
- **getAllowedDepartmentIds double session lookup:** Second `getServerSession` call is cheap (cached by NextAuth).
- **autoCloseOpenRecords date math timezone:** Node.js defaults to UTC. Not a risk unless server timezone is changed.
- **DE-REC-036 (CapacitySummaryRow optimization):** No longer applicable — component removed per ESC-009 decision.
- **DE-REC-038 (POC promote/remove decision):** Resolved — ESC-009 chose removal.
- **Missing required field validation in PUT /api/users/[id]:** Empty body silently succeeds. Harmless no-op — not worth the complexity.
- **Unsafe `context?: any` in roster-assignments and scenario duplicate routes:** Stylistic; Next.js 14 doesn't enforce typed params. Fix when upgrading to Next.js 15.
- **useApi console.error logging:** Error is now captured and surfaced to consumers via error state (PB-133/PB-134). Console.error logging is intentional for debugging.
- **Validate scenarioId as existing Scenario in planning POST:** Prisma FK constraint catches invalid IDs with a P2003 error. Adding explicit validation would improve the error message but is low-priority given planners select scenarios from a dropdown.
- **Hoist getActiveRecord calls in PlanningGrid render loop:** `getActiveRecord` is called inline per virtualized row (line 565-566). Linear scan on small arrays (typically 1-3 records). Marginal improvement at current data volumes.
- **Fix generateDailySummary upper time bound:** `perf.ts:323` has no `until` parameter, so summaries can include events beyond the target date. Only affects observability layer, not user-facing features.
- **StatusSelector redundant useApiData for leave types:** Leave types are already fetched at PlanningGrid level. StatusSelector independently re-fetches. 30s cache prevents actual API calls but adds listener churn. Minor optimization.
- **for-range route orderBy diverges from drivers route:** `for-range` orders by `lastName` only; `/api/drivers` orders by `[lastName, firstName]`. Non-deterministic for duplicate surnames. Minor inconsistency.
- **csv-parser escaped quote handling for non-comma separators:** Quote toggle logic desyncs on escaped `""` pairs in semicolon/tab CSVs. Low risk for typical Dutch HR data exports.
- **for-range inline driverIncludeFields diverges from canonical driverInclude:** Intentional optimization with explicit `select` but creates maintenance divergence if sub-record models gain new columns. Add a code comment noting the intentional divergence.
- **Roster assignment without driver existence check:** The `driverId` comes from URL params and Prisma FK constraint catches invalid IDs. Explicit check would improve the error message but is low-priority.
- **Duplicate skillIds silently deduplicated on driver create:** `createMany` with `skipDuplicates` silently drops duplicates. No user-facing impact since skill selection UI prevents duplicates.
- **Employment record PUT findFirst/update not wrapped in transaction:** Theoretical race condition at current concurrency. Prisma FK constraint prevents orphan updates.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
