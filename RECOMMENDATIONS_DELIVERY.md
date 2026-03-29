# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-053 (date validation on POST routes) and PB-054 (Dutch settings error messages) are complete. All POST and PUT routes for sub-records now validate `endDate >= startDate`. All settings API routes return Dutch error messages. The codebase passes verify with 0 errors and 0 warnings.

Fresh scan reveals: (1) ~24 remaining English error messages across API routes — the largest CLAUDE.md compliance gap, (2) hardcoded magic numbers that should be constants, (3) missing transaction wrapping on 3 PUT routes with find-then-update patterns, and (4) previously deferred items PB-018, PB-009, PB-030 which remain valid.

## Recommended Next Improvements

### DE-REC-028: Translate remaining English error messages across all API routes

- **Title:** Complete Dutch translation of all API error messages
- **Problem:** After PB-054 fixed the settings routes, ~24 English error messages remain across API routes: `"Record not found"`, `"Driver not found"`, `"code is required"`, `"firstName is required"`, `"Maximum 90 dates allowed per request"`, etc. This violates CLAUDE.md's requirement that all user-facing text is Dutch.
- **Proposed improvement:** Audit all API routes and translate every English error message to Dutch. Standardize patterns: "niet gevonden" for 404s, "is verplicht" for required fields, "Maximaal X per verzoek" for limits.
- **Expected product/technical value:** Full CLAUDE.md compliance. Consistent Dutch error UX across all API boundaries.
- **Priority:** P2 High
- **Effort:** Medium (24+ string changes across ~12 files)
- **Risk:** Low — string-only changes, no logic modification.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is the largest remaining CLAUDE.md compliance gap. Each individual change is trivial but the cumulative effect is significant for Dutch-language UX consistency.

### DE-REC-029: Wrap find-then-update PUT routes in transactions

- **Title:** Add transaction wrapping to sub-record PUT routes
- **Problem:** The PUT routes for employment (`[recordId]/route.ts`), functions, and roster assignments each do a `findFirst` verification followed by a separate `update` call without a transaction. If two requests race, the verification could pass for both but one update could operate on stale data.
- **Proposed improvement:** Wrap the find + update in `prisma.$transaction` in all 3 PUT routes.
- **Expected product/technical value:** Eliminates race condition risk on concurrent edits. Consistent with POST routes which already use transactions.
- **Priority:** P3 Medium
- **Effort:** Small (wrap existing code in 3 files)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Simple safety improvement. Same pattern as existing POST routes.

### DE-REC-030: Extract hardcoded API limits to constants

- **Title:** Centralize magic numbers in API routes to `constants.ts`
- **Problem:** Several magic numbers are scattered across API routes: 364 (roster generation days), 28 (roster cycle), 50000 (max duplicate entries), 90 (max dates per request), 366 (max bulk dates), 100 (max code length). These are hard to discover and maintain.
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts` and reference it from the relevant routes.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement. No logic changes needed.

### DE-REC-008: Add foreign key existence checks before relation creation

- **Title:** Validate foreign key references before creating related records
- **Problem:** The driver PUT handler accepts `skillIds` and creates `DriverSkill` records without verifying those skill IDs exist. Similarly, employment/function POST handlers accept `employerId`, `locationId`, `departmentId` without existence checks. Invalid IDs cause Prisma foreign key constraint errors that return generic 500 responses.
- **Proposed improvement:** Before creating related records, verify referenced IDs exist with a `findMany` count check. Return a clear 400 error with Dutch message if any reference is invalid.
- **Expected product/technical value:** Better error UX when invalid references are submitted. Prevents confusing 500 errors.
- **Priority:** P3 Medium
- **Effort:** Medium (touches several routes)
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** PB-018 already exists for this. Complements existing input validation work.

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
- **Why now:** PB-009 exists. Capacity aggregation is a hot path.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines hardcoded hex color values, violating CLAUDE.md design token rules.
- **Proposed improvement:** Move to `src/domain/constants.ts` with a comment referencing design token equivalents.
- **Expected product/technical value:** CLAUDE.md compliance. Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** PB-030 exists. Quick compliance fix.

## Risks / Watch-outs

- **PerformanceEvent table growth:** `cleanupOldEvents()` in `perf.ts` is defined but never called. The `PerformanceEvent` table will grow indefinitely. Low urgency given low traffic, but worth noting.
- **Scenario duplication memory ceiling:** `POST /api/scenarios/[id]/duplicate` loads up to 50,000 planning entries into Node.js memory. At ~200 bytes/row this is ~10 MB per request. Acceptable now but worth documenting as a known ceiling.
- **Date timezone handling in aggregation:** `aggregation.ts` and `utils.ts` parse date strings using `new Date(date + "T00:00:00")` without timezone specifier. Vercel serverless runs in UTC so this is not a current production risk, but could surface if the server environment changes.
- **`any` types in API routes:** ~13 uses of `any` type across API routes (route parameters, query builders, map callbacks). These are functional but reduce type safety. Not worth a dedicated backlog item — fix opportunistically when touching these files.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes don't justify the complexity.
- **Add authentication/authorization:** Known gap in CLAUDE.md, explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx broadly:** The component is complex but stable. Targeted fixes are preferred over a full rewrite.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision on whether duplicates should be allowed.
- **Add enum validation for status fields:** Frontend already constrains values. Low real-world risk.
- **Extend withPerfLogging to all routes:** Inconsistent wrapping exists but the perf system itself has unused analysis functions. Fix the analysis layer before expanding collection.
- **Remove ExternalSourceMetadata types:** Preparatory types for the connectivity hub (PB-015). Will be needed when that feature ships.
- **Replace `any` types broadly:** Low impact. The types are internal and well-contained. Fix opportunistically.
- **Add settings code length validation to PUT route:** Minor inconsistency — POST validates code length <= 100 but PUT does not. Low impact since codes are typically short.
- **Add duplicate employeeNumber check on driver creation:** Requires a product decision on whether duplicate employee numbers should be allowed.
- **Standardize `validateRequired` usage in drivers POST:** The drivers POST route uses inline validation instead of `validateRequired()`. Functionally equivalent, not worth a dedicated fix.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
