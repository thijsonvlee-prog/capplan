# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

Three backlog items were completed this cycle:
- **PB-076:** Rewrote CLAUDE.md to reflect current application state, including design system strategy from DESIGN.md, authentication infrastructure, full file reference, and updated component/API inventory.
- **PB-077:** Implemented CSV file upload and column detection. Built-in CSV parser (no external dependencies) with support for comma/semicolon/tab separators, quoted fields, and BOM handling. Frontend upload UI with preview, mapping validation, and unmapped column display.
- **PB-080:** Implemented NextAuth.js authentication infrastructure with Google and Azure AD providers, Prisma adapter, database sessions, and session callback with user role. Auth is conditionally active based on env vars.

Fresh codebase scan confirms strong health: 0 ESLint warnings, 0 typecheck errors, no N+1 patterns, no hardcoded colors in `.tsx` (except 1 Recharts exception already documented). ~27 `any` type usages remain (stable, mostly justified). The auth track is now unblocked for login UI and role enforcement.

## Recommended Next Improvements

### DE-REC-040: Optimize NextAuth session callback role lookup

- **Title:** Cache user role in session to avoid per-request DB query
- **Problem:** The NextAuth session callback in `src/lib/auth.ts` queries the database for the user's role on every session access. With database sessions, the adapter already loads the user record — but the custom `role` field isn't included in the standard adapter response.
- **Proposed improvement:** Either extend the PrismaAdapter to include `role` in the user response, or cache the role in the session record itself (e.g., store role in a session metadata field). Alternatively, accept the overhead since it's a single indexed query.
- **Expected product/technical value:** Eliminates one DB query per authenticated request. Matters as concurrent user count grows.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** PB-081 (login page) should be deployed first to validate the full auth flow.
- **Suggested owner:** Delivery Agent
- **Why now:** Worth addressing once auth is actively used, but not before the login page exists.

### DE-REC-041: CSV import execution (PB-078 follow-up preparation)

- **Title:** Technical design for CSV import execution
- **Problem:** PB-078 (CSV import execution) is now unblocked. The upload endpoint returns parsed data, but the execution step needs careful design: row validation per target entity, conflict handling (duplicate codes, existing records), error reporting granularity, and transaction boundaries.
- **Proposed improvement:** When implementing PB-078, ensure: (1) all rows are validated before any inserts, (2) a clear error report is returned with row-level detail, (3) `prisma.$transaction` wraps the entire import, (4) duplicate detection uses existing unique constraints. Consider an ImportLog model for audit trail.
- **Expected product/technical value:** Completes the connectivity hub's core value proposition. Enables operational CSV import workflows.
- **Priority:** P2 High
- **Effort:** Medium
- **Risk:** Medium — needs careful validation per entity type.
- **Dependencies:** PB-077 (completed).
- **Suggested owner:** Delivery Agent
- **Why now:** PB-078 is now unblocked and is the next step on the connectivity track.

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
- **Problem:** Several magic numbers are scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 366 (max bulk dates), 100 (max code length). These are hard to discover and maintain.
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

- **Auth env vars required for deployment:** PB-080 auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials in Vercel environment. Without these, auth is inactive (providers load conditionally). The app continues to function without auth, but login will not work until env vars are configured.
- **Session callback DB query:** Each authenticated session access triggers a `findUnique` for the user's role. Acceptable at current scale but becomes a concern with high concurrent users.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request.
- **Date timezone handling in aggregation:** `aggregation.ts` and `utils.ts` parse date strings using `new Date(date + "T00:00:00")` without timezone specifier. Vercel runs UTC so this is not a current risk.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed.
- **DELETE race conditions:** Multiple DELETE routes use a check-then-delete pattern without a transaction. Low risk at current concurrency.
- **Unbounded GET /api/planning results:** No row limit exists. Currently mitigated by required date/driver filter.
- **fieldMappings validation weakness:** `import-sources` API validates `typeof fieldMappings !== "object"` which passes for arrays and null. Deep validation of fieldMappings structure is missing.

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
- **Distinguish error types in catch blocks:** Significant refactoring across 27 route files for minimal benefit.
- **Add parent driver existence checks in sub-record routes:** Prisma FK constraints catch this.
- **Add aria-pressed to toggle buttons:** Experience Agent scope.
- **Use next-auth v5 (Auth.js):** v4 is proven and stable with Next.js 14. Migration to v5 can happen when upgrading to Next.js 15.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
