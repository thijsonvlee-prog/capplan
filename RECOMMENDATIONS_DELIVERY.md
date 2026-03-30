# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle delivered the Phase 1 scaling initiative (SMI-011): server-side pagination for the two heaviest API endpoints (`/api/planning/for-range` and `/api/drivers`), a covering index for capacity aggregation, and a CSV import row count guardrail. All four items shipped clean (0 typecheck errors, 0 lint warnings). PB-096 and PB-097 (frontend virtual scrolling and pagination UI) are now unblocked.

Fresh codebase scan identified several actionable improvements. The most impactful are: scenario duplication memory batching (already deferred as PB-098, now more relevant post-pagination), CapacitySummaryRow `.find()` optimization, and import transaction chunking for large driver imports. The codebase remains healthy at 22 models, 29 route files.

## Recommended Next Improvements

### DE-REC-044: Batch import transactions into chunks

- **Title:** Chunk large CSV import transactions to prevent connection timeouts
- **Problem:** The import execute endpoint processes driver rows sequentially inside a single `prisma.$transaction`. At 10,000 rows (the new limit), this creates 10,000+ individual queries in one transaction. Neon serverless connections have idle/total timeout limits that could cause partial imports to fail silently.
- **Proposed improvement:** Split the transaction into chunks of 500-1000 rows, committing each chunk separately. Track progress across chunks and report partial results if a chunk fails.
- **Expected product/technical value:** Reliable imports at the 10,000 row limit. No silent failures.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Risk:** Low — each chunk is independent; partial success is better than full failure.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** The row count limit (PB-092) prevents unbounded imports, but the transaction still runs as one unit. At the new 10K ceiling, timeouts are plausible.

### DE-REC-045: Add date format validation to planning endpoints

- **Title:** Validate YYYY-MM-DD format on date parameters in planning routes
- **Problem:** `/api/planning/for-range`, `/api/planning/bulk`, and `/api/planning` accept date strings without format validation. Invalid dates like "2025-99-99" or "abc" are passed to Prisma and silently produce empty results or unexpected behavior.
- **Proposed improvement:** Add a shared date format validator (`/^\d{4}-\d{2}-\d{2}$/`) to `api-route-utils.ts` and apply it on all date-accepting planning endpoints.
- **Expected product/technical value:** Prevents silent data corruption and confusing empty query results.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** The planning endpoints are the highest-traffic routes. Input validation is a basic reliability measure.

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
- **Problem:** Several magic numbers are scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 366 (max bulk dates), 90 (max date range), 100 (max code length), 5MB (max file size), 10000 (max import rows), 500 (max page size), 20 (max import logs).
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

- **Frontend pagination integration:** PB-093 and PB-094 ship backward-compatible APIs, but the real scaling benefit only lands when the frontend (PB-096, PB-097) consumes pagination. Until then, existing callers load all data. This is by design — phase 2 is the Experience Agent's domain.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. With 1000 drivers × 90 days, this limit could be approached. PB-098 (deferred) addresses this.
- **Import transaction size at ceiling:** At the new 10K row limit, the single-transaction import could hit Neon connection timeouts. DE-REC-044 proposes chunking.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed to avoid maintaining dead/experimental code.
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive and role enforcement is skipped.
- **Driver upsert without unique constraint:** Driver upsert matches on `employeeNumber` using `findFirst` (not a unique constraint). If multiple drivers share an `employeeNumber`, only the first is updated. Adding a unique constraint is a product decision.

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
- **Add composite (driverId, scenarioId, date) index:** The unique constraint `(driverId, date, scenarioId)` already covers this query pattern. Adding a redundant index wastes write performance.
- **Add request rate limiting on imports:** No user authentication → no per-user tracking. Rate limiting makes sense after multi-tenant features land.
- **Add concurrent request deduplication in useApi:** Low-frequency issue; components share cache via 30s freshness window. Complexity not justified.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
