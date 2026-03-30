# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed three items: the P1 login restriction (PB-102), scenario duplication chunking (PB-098), and masterdata documentation (PB-101). All shipped clean (0 typecheck errors, 0 lint warnings).

The login restriction closes the most critical security gap — unauthorized Google accounts can no longer auto-create users. Scenario duplication now handles up to 50K entries with constant memory. The masterdata documentation covers all 22 Prisma models.

Fresh codebase scan confirms the codebase is in healthy shape. The remaining recommendations are maintenance-level improvements — no critical issues found.

## Recommended Next Improvements

### DE-REC-047: Prevent PrismaAdapter from auto-creating User records

- **Title:** Disable PrismaAdapter auto-creation of User records on first OAuth sign-in
- **Problem:** The `signIn` callback (PB-102) correctly rejects unknown users, but PrismaAdapter still attempts to create a User record before the callback runs. This creates orphan User records for rejected sign-ins (the sign-in is rejected but the User row persists).
- **Proposed improvement:** Override the PrismaAdapter's `createUser` method to check if the user already exists by email. If not, throw an error to prevent auto-creation. Alternatively, add a periodic cleanup of User records with no linked Account/Session.
- **Expected product/technical value:** Clean user table — no orphan records from rejected sign-in attempts.
- **Priority:** P2 High
- **Effort:** Small
- **Risk:** Medium — PrismaAdapter internals may vary between versions. Needs careful testing.
- **Dependencies:** PB-102 (completed).
- **Suggested owner:** Delivery Agent
- **Why now:** Direct follow-up to PB-102. Orphan users may appear in the admin panel's user list.

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

- **PrismaAdapter orphan users:** With PB-102 in place, the PrismaAdapter may still create User records before the `signIn` callback rejects them. These orphan records appear in the admin panel user list. DE-REC-047 proposes a fix.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed to avoid maintaining dead/experimental code.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive and role enforcement is skipped.
- **Driver upsert without unique constraint:** Driver upsert matches on `employeeNumber` using `findFirst` (not a unique constraint). If multiple drivers share an `employeeNumber`, only the first is updated. Adding a unique constraint is a product decision.
- **Import partial failure semantics:** With chunked transactions (PB-099), a mid-import failure means some chunks succeeded and some failed. The import log correctly reports partial results, but the user cannot "undo" a partially completed import.

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

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
