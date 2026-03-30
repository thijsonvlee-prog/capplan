# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

Both scheduled Delivery tasks (PB-073, PB-075) were completed this cycle:
- **PB-073:** Removed 6 unused functions from `utils.ts` and the unused `StamtabelType` enum from `enums.ts`, along with 7 now-unused imports. Updated documentatie page.
- **PB-075:** Memoized employer/department/location Map creations in `DriverForm.tsx` with `useMemo`.

Fresh codebase scan confirms strong health: 0 ESLint warnings, 0 typecheck errors, no hardcoded colors in `.tsx` files, no inline styles remaining, consistent design token usage. The `utils.ts` file is now minimal (3 functions: `cn`, `getMondayStart`, `getDateRange`, `getISOWeekNumber`). The `any` type count in source files is ~36 instances across 12 files (stable, excluding generated code).

The active backlog is empty. Remaining work is all deferred P4 items. No new critical or high-priority findings.

## Recommended Next Improvements

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Title:** Replace `planningEntries.find()` with Map-based lookup in CapacitySummaryRow
- **Problem:** `CapacitySummaryRow.tsx` line 47 uses `driver.planningEntries.find((e) => e.date === date)` inside a nested loop over drivers × dates. This is the same hot-path pattern that was fixed in PlanningGrid (PB-066).
- **Proposed improvement:** Either pass the `entryMaps` from PlanningGrid down to CapacitySummaryRow, or build a local Map inside the component.
- **Expected product/technical value:** Consistent O(1) lookup pattern. Performance improvement for large grids when totals row is visible.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low. Same proven pattern.
- **Dependencies:** Decision on whether CapacitySummaryRow POC should be promoted or removed.
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, but depends on the POC's future. If the POC stays, it should use the same optimized pattern.

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
- **Why now:** Low-effort maintainability improvement. No logic changes needed.

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
- **Why now:** Worth revisiting when data volume grows. Not urgent at current scale.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS = ["#f97316", "#06b6d4", "#8b5cf6"]` inline. Hardcoded hex values (Recharts exception documented in CLAUDE.md). Also recreated on every render — should be a module-level constant.
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
- **Problem:** `cleanupOldEvents()` in `src/lib/perf.ts` is defined but never called anywhere. The `PerformanceEvent` table will grow indefinitely. While traffic is low now, this is unbounded growth.
- **Proposed improvement:** Either call `cleanupOldEvents()` at the end of `withPerfLogging`, or add a periodic cleanup mechanism. Alternatively, if the perf system isn't actively used, consider removing it to reduce dead code.
- **Expected product/technical value:** Prevents unbounded table growth.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene.

## Risks / Watch-outs

- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.
- **Date timezone handling in aggregation:** `aggregation.ts` and `utils.ts` parse date strings using `new Date(date + "T00:00:00")` without timezone specifier. Vercel serverless runs in UTC so this is not a current production risk, but could surface if the server environment changes.
- **`any` types in source code:** ~36 uses of `any` across 12 source files (excluding generated). These are functional but reduce type safety. Not worth a dedicated backlog item — fix opportunistically when touching these files.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". This should either be promoted to production quality or removed to avoid dead code confusion.
- **DELETE race conditions:** Multiple DELETE routes use a check-then-delete pattern without a transaction. The record could theoretically be deleted between the existence check and the delete. Low risk at current concurrency levels.
- **Unbounded GET /api/planning results:** The planning GET route has no limit or pagination. Could return 100k+ rows with large date range and many drivers. Currently mitigated by required date/driver filter, but no row limit exists.
- **fieldMappings validation weakness:** `import-sources` API validates `typeof fieldMappings !== "object"` which passes for arrays and null. Deep validation of fieldMappings structure is missing.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Add authentication/authorization:** Known gap in CLAUDE.md, explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~703 lines) but stable. Targeted fixes are preferred over a full rewrite.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision on whether duplicates should be allowed.
- **Add enum validation for status fields:** Frontend already constrains values. Low real-world risk.
- **Extend withPerfLogging to all routes:** Inconsistent wrapping exists but the perf system itself has unused analysis functions. Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** Low impact. The types are internal and well-contained. Fix opportunistically.
- **Add settings code length validation to PUT route:** Minor inconsistency — POST validates code length <= 100 but PUT does not. Low impact since codes are typically short.
- **Add duplicate employeeNumber check on driver creation:** Requires a product decision on whether duplicate employee numbers should be allowed.
- **Standardize `validateRequired` usage in drivers POST:** The drivers POST route uses inline validation instead of `validateRequired()`. Functionally equivalent, not worth a dedicated fix.
- **Translate console.error messages:** Console messages are developer/server-facing logging, not user-facing. They should remain in English for debugging clarity.
- **Split DriverForm.tsx (~475 lines):** Large but well-structured with tab-based organization. Would add complexity without clear payoff at current size.
- **Other `.find()` calls in render paths (scenarios, roster assignments):** The remaining `.find()` calls in ScenarioSelector, RosterAssigner, capacity page, and Header operate on small arrays (typically <10 items). Performance benefit of Map conversion is negligible.
- **Wrap DELETE routes in transactions:** The check-then-delete race condition in DELETE routes is theoretical at current concurrency. Adding transactions would be correct but adds complexity for negligible practical benefit.
- **Add React.memo to settings list items:** SkillManager, StamtabelManager, and RosterProfileEditor render list items without memo. These lists are small (typically <20 items) and render infrequently.
- **Add missing foreign key indexes:** Employment, function, and roster-assignment tables lack indexes on some foreign key columns. At current data volumes these are not bottlenecks.
- **Add input validation schema (Zod):** Would improve type safety in API routes but introduces a new dependency and significant refactoring effort. Not justified at current scale.
- **Distinguish error types in catch blocks:** All API catch blocks return 500 with generic Dutch messages. Differentiating constraint violations from server errors would improve debugging, but would require significant refactoring across all 24 route files for minimal user-facing benefit.
- **Add parent driver existence checks in sub-record routes:** Employment, function, and roster-assignment POST routes don't explicitly verify the parent driver exists. Prisma FK constraints catch this, so the explicit check is redundant.
- **Add aria-pressed to toggle buttons:** DriverForm skill/license toggles and capacity scenario buttons lack `aria-pressed`. Worth doing but belongs to Experience Agent scope.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
