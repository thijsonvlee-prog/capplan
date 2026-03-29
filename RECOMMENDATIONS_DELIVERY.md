# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

All four assigned backlog items (PB-025, PB-022, PB-023, PB-017) are completed. The planning grid regression is fixed, all sub-record creation handlers are transaction-protected, the stale `isActive` write path is removed, and error logging is sanitized across all API routes. A fresh codebase scan reveals remaining opportunities around API surface cleanup, validation gaps, and minor code hygiene.

## Recommended Next Improvements

### DE-REC-012: Remove unused /drivers/[id]/computed endpoint

- **Title:** Delete redundant computed fields API endpoint
- **Problem:** `src/app/api/drivers/[id]/computed/route.ts` makes 3 separate `findFirst()` queries to compute active employment/function/roster for a single driver. The frontend never calls this endpoint — it uses the client-side `getComputedFields()` helper from `api-helpers.ts` which computes the same fields from the main driver response. The `api.ts` wrapper `drivers.getComputedFields()` exists but has zero callers.
- **Proposed improvement:** Delete the route file and remove the `getComputedFields` method from `api.ts`. No frontend changes needed.
- **Expected product/technical value:** Removes dead code, eliminates 3 redundant queries from the API surface, simplifies maintenance.
- **Priority:** P3 Medium
- **Effort:** Small (delete 1 route file, remove 3 lines from api.ts)
- **Risk:** Low. Verified no frontend code calls this endpoint.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Low effort cleanup. Dead code creates confusion for agents and developers.

### DE-REC-013: Add validateRequired to preferences and active-scenario PUT handlers

- **Title:** Add input validation to two unvalidated PUT routes
- **Problem:** `src/app/api/preferences/route.ts` (PUT) and `src/app/api/scenarios/active/route.ts` (PUT) accept request bodies without `validateRequired()` checks. Missing `key`/`value` or `activeId` fields would cause unclear errors downstream.
- **Proposed improvement:** Add `validateRequired()` calls to both handlers, consistent with all other POST/PUT routes.
- **Expected product/technical value:** Completes input validation coverage. Consistent error behavior across all mutation endpoints.
- **Priority:** P3 Medium
- **Effort:** Small (add ~5 lines per file)
- **Risk:** Low. Only adds early-return guards.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Small gap in otherwise complete validation coverage.

### DE-REC-008: Add foreign key existence checks before relation creation

- **Title:** Validate foreign key references before creating related records
- **Problem:** The driver PUT handler accepts `skillIds` and creates `DriverSkill` records without verifying those skill IDs exist. Similarly, employment/function POST handlers accept `employerId`, `locationId`, `departmentId` without existence checks. Invalid IDs cause Prisma foreign key constraint errors that return generic 500 responses.
- **Proposed improvement:** Before creating related records, verify referenced IDs exist with a `findMany` count check. Return a clear 400 error with Dutch message if any reference is invalid.
- **Expected product/technical value:** Better error UX when invalid references are submitted. Prevents confusing 500 errors.
- **Priority:** P3 Medium
- **Effort:** Medium (touches several routes, needs careful scope)
- **Risk:** Low. Only adds early-return guards.
- **Dependencies:** PB-022 completed. PB-018 already exists for this work.
- **Suggested owner:** Delivery Agent
- **Why now:** Dependency is resolved. Complements the input validation already in place.

### DE-REC-005: Add covering index for capacity aggregation query

- **Title:** Add (scenarioId, date, status) index on PlanningEntry for capacity groupBy
- **Problem:** The GET `/api/planning/capacity` endpoint uses `prisma.groupBy({ by: ["date", "status"], where: { date: { in: ... }, scenarioId: ... } })`. The existing `[scenarioId, date]` index helps with filtering but doesn't cover the `status` column used in groupBy, forcing a table scan for status values.
- **Proposed improvement:** Add a composite index `@@index([scenarioId, date, status])` to PlanningEntry.
- **Expected product/technical value:** Faster capacity calculations, especially as planning entry volume grows.
- **Priority:** P3 Medium
- **Effort:** Small (schema change + migration)
- **Risk:** Low. Additive index, no schema changes.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Capacity aggregation is a hot path. The index is cheap to maintain.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to design token constants
- **Problem:** `src/components/capacity/CapacityChart.tsx` defines `COMPARE_COLORS = ["#f97316", "#06b6d4", "#8b5cf6"]` as hardcoded hex values. CLAUDE.md requires no hardcoded color values in `.tsx` files. These are comparison scenario colors used with Recharts (which requires hex strings).
- **Proposed improvement:** Move to `src/domain/constants.ts` as `COMPARE_SCENARIO_COLORS` with a comment referencing the design token equivalents, per the Recharts exception in CLAUDE.md.
- **Expected product/technical value:** Complies with CLAUDE.md design token rules. Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small (move 1 constant, update 1 import)
- **Risk:** Low. No behavioral change.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Quick compliance fix, but low user impact.

## Risks / Watch-outs

- **Sequence number race condition:** `getNextSequenceNumber()` reads max sequence then increments. Concurrent requests for the same driver could compute the same number. Currently mitigated by transaction wrapping, but the function itself is not inherently safe if used outside a transaction. Low real-world risk given single-user usage patterns.
- **Roster profile deletion orphaning:** Deleting a roster profile does not cascade-delete the associated `RosterProfileDay` records. Prisma's `onDelete: Cascade` may handle this at the schema level — worth verifying before it becomes a data integrity issue.
- **activeDriverWhereClause still used in /api/drivers:** The driver list route still uses `activeDriverWhereClause()` for optional filtering. This is intentional (it's a query parameter toggle), but worth noting that the function remains in use and should not be removed from `api-route-utils.ts`.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated and the team is productive with it. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes do not justify the added complexity. Revisit when a specific endpoint shows performance issues.
- **Add authentication/authorization:** Flagged as a known gap in CLAUDE.md but explicitly out of scope unless tasked.
- **Refactor PlanningGrid.tsx:** The component is complex (~650 lines) but stable. The two pre-existing ESLint warnings are non-blocking. Refactoring carries high risk for low payoff.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Adding regex validation is defensive but low ROI given no reported issues.
- **Add unique constraints on Driver/Scenario names:** Requires a migration and potentially data cleanup. Product decision needed on whether duplicates should be allowed.
- **Add enum validation for status fields:** Database columns are String type, not enums. Adding server-side enum validation is correct but requires defining the valid enum set server-side. Medium effort for low real-world risk (frontend already constrains values).
- **Pre-index lookups in api-helpers.ts:** The `getComputedFields()` and `groupDrivers()` functions use `Array.find()` for lookups. Converting to Map would be faster but current data volumes (dozens of employers/departments) make this a micro-optimization.
- **Type safety improvements on API route bodies:** Multiple routes use `any` for request body typing. While stricter typing would catch errors at compile time, this would require defining request DTOs for every endpoint — medium effort for low real-world risk.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
