# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-086 (JSON parsing protection) and PB-088 (auth setup documentation) were completed this cycle:
- `parseJsonBody()` helper added to `api-route-utils.ts` and applied to all 23 POST/PUT routes. Malformed JSON now returns 400 instead of 500.
- `AUTH_SETUP.md` created with step-by-step guidance for Google OAuth and Azure AD configuration in Vercel.

All scheduled Delivery Agent work is now complete. Codebase remains healthy: 0 ESLint warnings, 0 typecheck errors, 22 Prisma models, 29 route files. The authentication track is fully delivered (infrastructure, login, admin panel, role enforcement, role-aware UI, setup documentation).

## Recommended Next Improvements

### DE-REC-042: Extend import execution with update/upsert mode

- **Title:** Add upsert capability to CSV import for existing records
- **Problem:** The current import execution only creates new records. For stamtabel entities, `skipDuplicates` silently skips rows with existing codes. Users may want to update descriptions of existing records via CSV import.
- **Proposed improvement:** Add an optional `mode` parameter to the execute endpoint: "create" (current behavior, default) or "upsert" (update existing records matched by unique key).
- **Expected product/technical value:** Makes the import feature useful for ongoing data synchronization, not just initial data load.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Risk:** Medium — upsert logic needs careful unique key handling per entity.
- **Dependencies:** PB-078 (completed).
- **Suggested owner:** Delivery Agent
- **Why now:** Natural follow-up to PB-078. Users who import data regularly will need this quickly.

### DE-REC-040: Optimize NextAuth session callback role lookup

- **Title:** Cache user role in session to avoid per-request DB query
- **Problem:** The NextAuth session callback in `src/lib/auth.ts` queries the database for the user's role on every session access. With role enforcement now active on all write routes, this adds one extra DB query per authenticated mutation.
- **Proposed improvement:** Either extend the PrismaAdapter to include `role` in the user response, or cache the role in the session record itself.
- **Expected product/technical value:** Eliminates one DB query per authenticated request. Matters as concurrent user count grows.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Role enforcement is now active, so the extra query is hit on every write request.

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
- **Problem:** Several magic numbers are scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 366 (max bulk dates), 100 (max code length), 5MB (max file size), 20 (max import logs).
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (scenarioId, date, status) index on PlanningEntry
- **Problem:** Capacity endpoint uses `groupBy` on `date` and `status` filtered by `scenarioId` and `date`. The existing index doesn't cover `status`.
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

- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive and role enforcement is skipped. See `AUTH_SETUP.md` for configuration guidance.
- **Session callback DB query:** Each authenticated session access triggers a `findUnique` for the user's role. Now that role enforcement is active, this query runs on every write request. Acceptable at current scale but worth optimizing (DE-REC-040).
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory.
- **Import transaction size:** Large CSV imports (thousands of rows) create one driver per row inside a single transaction. Very large imports could hit Neon connection timeouts.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~700 lines) but stable. Targeted fixes preferred.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
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
- **Batch FK validation in driver POST route:** Current parallel Promise.all approach is already efficient; batching into fewer queries adds complexity for marginal gain.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
