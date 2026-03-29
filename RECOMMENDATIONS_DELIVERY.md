# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-065 (DayCell leaveType Map lookup) is complete. The Map-based lookup pattern is now consistent across all component render paths. A fresh codebase scan confirms: no N+1 patterns, comprehensive error handling across all 26 API routes, zero ESLint warnings. The codebase is in strong shape.

The most impactful remaining opportunity is optimizing the per-cell `.find()` in the PlanningGrid render loop (DE-REC-034), which runs for every driver×date cell. The ScenarioSelector hardcoded Tailwind color (DE-REC-035) is a small design token compliance fix. The existing deferred items (DE-REC-005, DE-REC-014, DE-REC-030, DE-REC-031) remain valid but low urgency.

## Recommended Next Improvements

### DE-REC-034: PlanningGrid per-cell entry lookup optimization

- **Title:** Replace `planningEntries.find()` with Map-based lookup in PlanningGrid cell rendering
- **Problem:** `PlanningGrid.tsx:613` uses `driver.planningEntries.find((e) => e.date === date)` inside the per-cell render loop. This runs for every driver×date combination in the grid. With 50 drivers × 90 days, that's 4,500 `.find()` calls, each scanning the driver's entries array.
- **Proposed improvement:** Pre-build a `Map<string, PlanningEntry>` keyed by date for each driver's entries (either in the data transform or via useMemo), and use `.get(date)` in the render loop.
- **Expected product/technical value:** Consistent O(1) lookup pattern. Measurable render performance improvement on large grids.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low. Same proven pattern as PB-060/PB-065.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is the last hot-path `.find()` in the codebase. The pattern is proven and the change is small.

### DE-REC-035: ScenarioSelector hardcoded Tailwind color

- **Title:** Replace hardcoded `bg-amber-100 text-amber-700` in ScenarioSelector with design tokens
- **Problem:** `ScenarioSelector.tsx:73` uses `bg-amber-100 text-amber-700` for the "Concept" badge. This violates CLAUDE.md's rule against hardcoded Tailwind color classes.
- **Proposed improvement:** Replace with `bg-warning-50 text-warning-700` or appropriate design token equivalents.
- **Expected product/technical value:** CLAUDE.md compliance. Design consistency.
- **Priority:** P4 Low
- **Effort:** Small (single line change)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Quick compliance fix. Can be bundled with any UX cycle.

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
- **Problem:** `CapacityChart.tsx:54` defines `COMPARE_COLORS = ["#f97316", "#06b6d4", "#8b5cf6"]`. Hardcoded hex values violate CLAUDE.md design token rules (Recharts exception documented).
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** CLAUDE.md compliance. Centralizes color definitions.
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
- **Expected product/technical value:** Prevents unbounded table growth. Reduces maintenance surface if unused code is removed.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene. Easy fix.

## Risks / Watch-outs

- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.
- **Date timezone handling in aggregation:** `aggregation.ts` and `utils.ts` parse date strings using `new Date(date + "T00:00:00")` without timezone specifier. Vercel serverless runs in UTC so this is not a current production risk, but could surface if the server environment changes.
- **`any` types in API routes:** ~12 uses of `any` type across API routes (route parameters, query builders, map callbacks). These are functional but reduce type safety. Not worth a dedicated backlog item — fix opportunistically when touching these files.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". This should either be promoted to production quality or removed to avoid dead code confusion.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Add authentication/authorization:** Known gap in CLAUDE.md, explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~680 lines) but stable. Targeted fixes are preferred over a full rewrite.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision on whether duplicates should be allowed.
- **Add enum validation for status fields:** Frontend already constrains values. Low real-world risk.
- **Extend withPerfLogging to all routes:** Inconsistent wrapping exists but the perf system itself has unused analysis functions. Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** Low impact. The types are internal and well-contained. Fix opportunistically.
- **Add settings code length validation to PUT route:** Minor inconsistency — POST validates code length <= 100 but PUT does not. Low impact since codes are typically short.
- **Add duplicate employeeNumber check on driver creation:** Requires a product decision on whether duplicate employee numbers should be allowed.
- **Standardize `validateRequired` usage in drivers POST:** The drivers POST route uses inline validation instead of `validateRequired()`. Functionally equivalent, not worth a dedicated fix.
- **Translate console.error messages:** Console messages are developer/server-facing logging, not user-facing. They should remain in English for debugging clarity. CLAUDE.md's Dutch requirement applies to user-facing text only.
- **Split DriverForm.tsx (~475 lines):** Large but well-structured with tab-based organization. Would add complexity without clear payoff at current size.
- **Other `.find()` calls in render paths (scenarios, roster assignments):** The remaining `.find()` calls in ScenarioSelector, RosterAssigner, capacity page, and Header operate on small arrays (typically <10 items). The performance benefit of Map conversion is negligible. Only DE-REC-034 (planning entries) operates on a hot path with meaningful volume.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
