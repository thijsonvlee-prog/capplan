# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-078 (CSV import execution) was completed this cycle:
- Full import pipeline: upload → preview → validate → execute → results summary → import history.
- New `ImportLog` model for audit trail. CSV parser extracted to shared `src/lib/csv-parser.ts`.
- `prisma.$transaction` for drivers, `createMany` with `skipDuplicates` for stamtabel entities.
- Frontend: execute button, result display with row-level errors, import history panel per source.

Codebase remains healthy: 0 ESLint warnings, 0 typecheck errors, 22 Prisma models, 29 route files. Auth track fully unblocked — login page deployed, admin panel and role enforcement ready for next cycles.

## Recommended Next Improvements

### DE-REC-042: Extend import execution with update/upsert mode

- **Title:** Add upsert capability to CSV import for existing records
- **Problem:** The current import execution only creates new records. For stamtabel entities (employers, departments, locations), `skipDuplicates` silently skips rows with existing codes. Users may want to update descriptions of existing records via CSV import.
- **Proposed improvement:** Add an optional `mode` parameter to the execute endpoint: "create" (current behavior, default) or "upsert" (update existing records matched by unique key). For stamtabel entities, match on `code`; for drivers, match on `employeeNumber` if mapped.
- **Expected product/technical value:** Makes the import feature useful for ongoing data synchronization, not just initial data load.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Risk:** Medium — upsert logic needs careful unique key handling per entity.
- **Dependencies:** PB-078 (completed).
- **Suggested owner:** Delivery Agent
- **Why now:** Natural follow-up to PB-078. Users who import data regularly will need this quickly.

### DE-REC-040: Optimize NextAuth session callback role lookup

- **Title:** Cache user role in session to avoid per-request DB query
- **Problem:** The NextAuth session callback in `src/lib/auth.ts` queries the database for the user's role on every session access. With database sessions, the adapter already loads the user record — but the custom `role` field isn't included in the standard adapter response.
- **Proposed improvement:** Either extend the PrismaAdapter to include `role` in the user response, or cache the role in the session record itself (e.g., store role in a session metadata field). Alternatively, accept the overhead since it's a single indexed query.
- **Expected product/technical value:** Eliminates one DB query per authenticated request. Matters as concurrent user count grows.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** PB-081 (completed). Should be validated with real auth sessions.
- **Suggested owner:** Delivery Agent
- **Why now:** Auth is now live with login page deployed. Worth addressing before concurrent user load increases.

### DE-REC-043: fieldMappings deep validation in import-sources API

- **Title:** Validate fieldMappings structure beyond typeof check
- **Problem:** The `import-sources` POST/PUT routes validate `typeof fieldMappings !== "object"` which passes for arrays and null. The execute endpoint now depends on `fieldMappings` being a well-formed `Record<string, string>`. Malformed mappings could cause confusing errors at import time.
- **Proposed improvement:** Add validation that fieldMappings is a non-null, non-array object with string keys and string values. Validate that target fields are valid for the specified target entity.
- **Expected product/technical value:** Catches configuration errors early at save time rather than at import execution time.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Now that import execution exists, bad fieldMappings have real consequences.

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Title:** Replace `planningEntries.find()` with Map-based lookup in CapacitySummaryRow
- **Problem:** `CapacitySummaryRow.tsx` uses `driver.planningEntries.find((e) => e.date === date)` inside a nested loop over drivers × dates. This is the same hot-path pattern that was fixed in PlanningGrid (PB-066).
- **Proposed improvement:** Either pass the `entryMaps` from PlanningGrid down to CapacitySummaryRow, or build a local Map inside the component.
- **Expected product/technical value:** Consistent O(1) lookup pattern. Performance improvement for large grids when totals row is visible.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low. Same proven pattern.
- **Dependencies:** Decision on whether CapacitySummaryRow POC should be promoted or removed.
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, but depends on the POC's future.

### DE-REC-030: Extract hardcoded API limits to constants

- **Title:** Centralize magic numbers in API routes to `constants.ts`
- **Problem:** Several magic numbers are scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 366 (max bulk dates), 100 (max code length), 5MB (max file size), 20 (max import logs). These are hard to discover and maintain.
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts` and reference it from the relevant routes.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

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
- **Why now:** Worth revisiting when data volume grows.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS = ["#f97316", "#06b6d4", "#8b5cf6"]` inline. Hardcoded hex values (Recharts exception documented in CLAUDE.md). Also recreated on every render.
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** Centralizes color definitions. Eliminates per-render array allocation.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick compliance fix.

### DE-REC-031: Add PerformanceEvent table cleanup

- **Title:** Call `cleanupOldEvents()` or add TTL-based cleanup for PerformanceEvent
- **Problem:** `cleanupOldEvents()` in `src/lib/perf.ts` is defined but never called. The `PerformanceEvent` table grows indefinitely.
- **Proposed improvement:** Either call `cleanupOldEvents()` at the end of `withPerfLogging`, or add a periodic cleanup mechanism.
- **Expected product/technical value:** Prevents unbounded table growth.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene.

## Risks / Watch-outs

- **Auth env vars required for deployment:** PB-080 auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive (providers load conditionally).
- **Session callback DB query:** Each authenticated session access triggers a `findUnique` for the user's role. Acceptable at current scale but becomes a concern with high concurrent users.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request.
- **Import transaction size:** Large CSV imports (thousands of rows) create one driver per row inside a single transaction. Very large imports could hit Neon connection timeouts. Consider chunking for imports > 1000 rows.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed.
- **fieldMappings validation weakness:** `import-sources` API validates `typeof fieldMappings !== "object"` which passes for arrays and null. Deep validation of fieldMappings structure is missing (DE-REC-043).

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~700 lines) but stable. Targeted fixes preferred.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision.
- **Add enum validation for status fields:** Frontend already constrains values.
- **Extend withPerfLogging to all routes:** Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** Low impact. ~27 instances are internal and well-contained. Fix opportunistically.
- **Add settings code length validation to PUT route:** Minor inconsistency, low impact.
- **Add duplicate employeeNumber check on driver creation:** Requires a product decision.
- **Standardize `validateRequired` usage in drivers POST:** Functionally equivalent to inline validation.
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
- **Add file storage for uploaded CSVs:** Not needed — import re-uploads the file for execution. Server-side storage would add complexity without clear benefit.
- **Add scheduled/automatic imports:** Requires external trigger mechanism (cron, webhook). Out of scope for current MVP.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
