# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed PB-107: the PrismaAdapter's `createUser` method is now overridden to prevent auto-creation of User records during OAuth sign-in. Investigation of the NextAuth v4 source code confirmed the `signIn` callback already runs before `createUser`, so orphan creation was unlikely in the current version — the override serves as defense-in-depth. Login error handling was improved with Dutch messages for all OAuth error types and a generic fallback.

A fresh codebase scan identified several new findings: the import execute route has N+1 sequential queries per row inside transaction chunks (DE-REC-049), `groupDrivers` in PlanningGrid is not memoized (DE-REC-050), and the capacity endpoint lacks date validation and length limits (DE-REC-051). These are the most impactful improvements available. DE-REC-047 is now completed (PB-107).

## Recommended Next Improvements

### DE-REC-048: First-login account linking for pre-created users

- **Title:** Ensure pre-created users can link their Google account on first sign-in
- **Problem:** When an admin pre-creates a user and that user signs in via Google for the first time, NextAuth may throw `OAuthAccountNotLinked` if the user happens to have a different provider's account linked. The custom adapter's `createUser` override handles the case where `getUserByEmail` misses the user, but the `OAuthAccountNotLinked` error path is separate. Currently, pre-created users with no linked accounts sign in fine (tested flow), but the `OAuthAccountNotLinked` error code isn't handled on the login page.
- **Proposed improvement:** Add `OAuthAccountNotLinked` to the login page error messages with a Dutch message like "Je account kan niet worden gekoppeld. Neem contact op met je beheerder."
- **Expected product/technical value:** Better error UX for edge case where a user has multiple OAuth providers.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, completes the login error handling story.

### DE-REC-049: Import execute — batch lookups instead of per-row queries

- **Title:** Replace sequential per-row `findFirst` + `create`/`update` with batched operations in import execute
- **Problem:** In `src/app/api/import-sources/[id]/execute/route.ts` (lines 290–329), each row in a 500-row transaction chunk triggers a separate `tx.driver.findFirst()` followed by `tx.driver.update()` or `tx.driver.create()`. For a full 500-row chunk this means 500–1000 sequential round-trips to Neon, which is extremely slow on a serverless database with per-query latency.
- **Proposed improvement:** Batch the `findFirst` calls into a single `findMany({ where: { employeeNumber: { in: chunkEmployeeNumbers } } })`, build a Map of existing drivers, then issue batched `createMany` for new drivers and individual updates only for upserts.
- **Expected product/technical value:** Import execution speed improvement of 5–10x for large files. Direct user-facing improvement.
- **Priority:** P2 High
- **Effort:** Medium
- **Risk:** Medium — the inner try/catch per row currently allows partial success within a chunk. Batching changes the error granularity. Needs careful error reporting preservation.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Import is a user-facing feature with 10,000-row capacity. Current performance degrades significantly at scale.

### DE-REC-050: PlanningGrid — memoize groupDrivers call

- **Title:** Wrap `groupDrivers()` in `useMemo` in PlanningGrid
- **Problem:** In `src/components/planning/PlanningGrid.tsx` line 326, `groupDrivers(sortedDrivers, groupBy, { employers, departments, locations })` is called on every render without memoization. This builds new Map instances and iterates all drivers on each render cycle, including during scroll events.
- **Proposed improvement:** Wrap in `useMemo` with dependencies `[sortedDrivers, groupBy, employers, departments, locations]`.
- **Expected product/technical value:** Reduces unnecessary computation during scroll and re-renders. Consistent with the memoization patterns already used elsewhere in PlanningGrid.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low — straightforward memoization. Same pattern used throughout the component.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Easy win, directly improves scroll performance for large driver lists.

### DE-REC-051: Capacity endpoint — add date validation and length limit

- **Title:** Add date format validation and length cap to `/api/planning/capacity`
- **Problem:** In `src/app/api/planning/capacity/route.ts` line 21, dates are split from a comma-separated string and passed directly to a Prisma `WHERE date IN (...)` clause without format validation or length limit. The `for-range` endpoint already validates date formats and caps at 90 dates — the capacity endpoint lacks both guards.
- **Proposed improvement:** Add `validateDateFormats(dateList)` and a `dateList.length > 366` check, consistent with the pattern in `for-range`.
- **Expected product/technical value:** Prevents oversized queries from hitting the database. Consistent validation across planning endpoints.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, closes a validation gap between related endpoints.

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
- **Why now:** Low-effort maintainability improvement. More limits were added this cycle.

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

- **Import performance at scale:** The import execute route issues sequential per-row database queries (N+1 pattern). A 10,000-row import generates up to 20,000 individual queries across 20 chunks. On Neon serverless this can take minutes. DE-REC-049 proposes batching.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls — the promise is dropped with no `.catch()`. A failed save leaves the UI showing unsaved state. This is a known design choice (CLAUDE.md: "Apply optimistic updates only where the pattern already exists") but becomes riskier as more users are active.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed to avoid maintaining dead/experimental code.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive and role enforcement is skipped. No warning is logged when auth is skipped.
- **Driver upsert without unique constraint:** Driver upsert matches on `employeeNumber` using `findFirst` (not a unique constraint). If multiple drivers share an `employeeNumber`, only the first is updated. Adding a unique constraint is a product decision.
- **Import partial failure semantics:** With chunked transactions, a mid-import failure means some chunks succeeded and some failed. The import log correctly reports partial results, but the user cannot "undo" a partially completed import.
- **ESC-008 user groups scope:** Still open — blocks PB-104. This is the largest upcoming feature and will touch data model, API routes, and UI.
- **Dead performance analysis code:** Five exported functions in `src/lib/perf.ts` (`getSlowEvents`, `getRouteStats`, `generateDailySummary`, `cleanupOldEvents`, `compareDays`) are never called. The PerformanceEvent table is written to on every request but never read, cleaned, or summarised.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Settings/master data tables are small. Only planning and drivers needed pagination.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~700 lines) but stable. Targeted fixes preferred.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Only planning endpoints warrant it because they accept comma-separated date lists.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision.
- **Add enum validation for status fields:** Frontend already constrains values.
- **Extend withPerfLogging to all routes:** Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** ~27 instances are internal and well-contained. Fix opportunistically.
- **Add settings code length validation to PUT route:** Minor inconsistency, low impact.
- **Add duplicate employeeNumber check on driver creation:** Requires a product decision.
- **Translate console.error messages:** Server-facing logging should remain in English.
- **Split DriverForm.tsx (~475 lines):** Well-structured with tab-based organization.
- **Other `.find()` calls in render paths:** ScenarioSelector, RosterAssigner, etc. operate on small arrays (<10 items).
- **Wrap DELETE routes in transactions:** Theoretical race condition at current concurrency.
- **Add React.memo to settings list items:** Small lists, infrequent renders.
- **Add missing foreign key indexes:** Not bottlenecks at current data volumes.
- **Add input validation schema (Zod):** Introduces a new dependency. Not justified at current scale.
- **Distinguish error types in catch blocks:** Significant refactoring across route files for minimal benefit.
- **Add parent driver existence checks in sub-record routes:** Prisma FK constraints catch this.
- **Add aria-pressed to toggle buttons:** Experience Agent scope.
- **Use next-auth v5 (Auth.js):** v4 is proven and stable with Next.js 14. Migration to v5 can happen when upgrading to Next.js 15.
- **Add file storage for uploaded CSVs:** Not needed — import re-uploads the file for execution.
- **Add scheduled/automatic imports:** Requires external trigger mechanism. Out of scope for current MVP.
- **Add React.memo to StatusBadge/StatusSelector:** Rendered within already-memoized DayCell; marginal improvement.
- **Batch FK validation in driver POST route:** Current parallel Promise.all approach is already efficient.
- **Add React.memo to GroupRows component:** Marginal improvement — PlanningGrid manages re-renders via entry maps.
- **CSV injection sanitization:** CSV data is stored in database fields, not re-exported to spreadsheets. If CSV export is added later, sanitization should be added at that point.
- **Standardize API response wrapping:** Some routes use `{ data }` wrapper, others return raw objects. Changing this is a breaking API contract change with no functional benefit.
- **Add composite (driverId, scenarioId, date) index:** The unique constraint `(driverId, date, scenarioId)` already covers this query pattern.
- **Add request rate limiting on imports:** No per-user tracking at current scale. Rate limiting makes sense after multi-tenant features land.
- **Add concurrent request deduplication in useApi:** Low-frequency issue; components share cache via 30s freshness window.
- **Add progress tracking for long operations:** Would require streaming responses or a job queue — significant architectural change for an uncommon operation.
- **Type-safe dynamic Prisma model access:** The `(prisma as any)[modelName]` pattern in import-sources is a pragmatic choice for entity-generic import logic. A typed wrapper adds complexity without functional benefit.
- **Clean up orphan User records retroactively:** Requires manual identification. Separate concern from prevention (PB-107).
- **Add planning status enum validation on API routes:** Frontend already constrains values via the status selector. Server-side validation would be defense-in-depth but the frontend is the only consumer. Revisit if an external API is exposed.
- **Replace `useApi` cache key from `fetcher.toString()` to stable keys:** The current approach works because all fetch calls use named methods from `api.ts` (not inline arrows in JSX). Refactoring the cache key mechanism would touch every `useApiData` call site with no functional improvement.
- **Add error handling to PlanningGrid optimistic updates:** The fire-and-forget pattern is a deliberate design choice documented in CLAUDE.md. Adding rollback logic would significantly increase complexity for a low-frequency failure scenario.
- **Type the `parseJsonBody<T>` generic per route:** Would require creating ~25 request body interfaces. The `any` type is contained within API route handlers and doesn't leak to components.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
