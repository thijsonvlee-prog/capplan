# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle I executed the two P3 items that were Ready in the backlog:

- **PB-196 — `validateMaxLength` helper.** Added `validateMaxLength` and `validateMaxLengths` to `src/lib/api-route-utils.ts` and replaced ~28 inline `field.length > N` checks across every write route (drivers, scenarios, import-sources, user-groups, roster-profiles, settings stamtabel + skills, driver sub-records, and both planning notes routes). Error phrasing and 400 status codes preserved verbatim. Also closed the two lingering length-cap gaps: scenario duplicate POST now enforces the 200-char name cap (DE-REC-073), preferences PUT now enforces a 500-char value cap (DE-REC-058).
- **PB-197 — `validateDateRange` helper.** Added `validateDateRange` using lexicographic comparison on the already-validated `YYYY-MM-DD` strings and replaced all 6 inline checks in employment / function / roster-assignment POST + PUT routes.

Both changes are pure refactors: no behavior change for valid input, no change to error messages or status codes for invalid input. `npm run verify` passes.

After shipping those, I ran a fresh scan across `src/app/api/` and `src/lib/`. Three small new consolidation opportunities surfaced that were not in any previous recommendations file, plus a handful of carry-overs that are still valid. Everything else is already captured or P4 Low noise.

## Recommended Next Improvements

### DE-REC-075: Centralize enum value arrays for request validation

- **Title:** Extract `VALID_PLANNING_STATUSES` and `VALID_EMPLOYMENT_TYPES` into `api-route-utils.ts`
- **Problem:** `const VALID_STATUSES = Object.values(PlanningStatus)` is duplicated in `src/app/api/planning/route.ts:9` and `src/app/api/planning/bulk/route.ts:9`. `const validEmploymentTypes = Object.values(EmploymentType)` is duplicated in `src/app/api/drivers/[id]/employment/route.ts:53` and `src/app/api/drivers/[id]/employment/[recordId]/route.ts:28`. Minor but recurring pattern: every new route enforcing an enum re-computes the same array and re-writes the same Dutch error string.
- **Proposed improvement:** Add `VALID_PLANNING_STATUSES` and `VALID_EMPLOYMENT_TYPES` as exported constants in `api-route-utils.ts` (or `src/domain/constants.ts`). Optionally add a small `validateEnumValue(value, validValues, label)` helper that returns the existing Dutch "Ongeldige <label>..." message. Pure refactor; no behavior change.
- **Expected product/technical value:** Consistent validation phrasing, one place to update when an enum changes, removes 4 duplicate definitions. Matches the spirit of PB-196/197.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Cheapest follow-through on the validation-consolidation theme while the surface is fresh.

### DE-REC-076: Extract `verifyRecordOwnership` helper for sub-record PUT/DELETE routes

- **Title:** Deduplicate the `findFirst({ id, driverId })` ownership check across sub-record routes
- **Problem:** All three driver sub-record `[recordId]/route.ts` files (employment, functions, roster-assignments) contain exactly the same pattern twice each — once inside the PUT transaction, once before the DELETE. Six occurrences total of `findFirst({ where: { id: recordId, driverId: id } })` followed by a 404 return. The PUT variant wraps it in a transaction + null-return-then-404 dance that's particularly verbose.
- **Proposed improvement:** Add a small helper in `api-route-utils.ts`, e.g. `verifyRecordOwnership(model, { recordId, driverId })` that returns the row or throws/returns a sentinel. Or keep it simpler as `isRecordOwnedBy(model, recordId, driverId): Promise<boolean>`. Replace the 6 inline blocks. Behavior and status codes unchanged.
- **Expected product/technical value:** Removes 6 copy-pasted blocks, makes future ownership-check changes (e.g. tightening authorization) a one-file edit, matches PB-196/197 consolidation approach.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low (pure refactor; the helper can be kept outside the transaction boundary to avoid reshaping the existing flow — the ownership check is read-only)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Only consolidation surfaced by the fresh scan that touches authorization-adjacent code. Small enough to ship in a single cycle.

### DE-REC-077: Move `MAX_NOTES_LENGTH` constant into shared constants module

- **Title:** Deduplicate `MAX_NOTES_LENGTH = 500` across planning routes
- **Problem:** Defined identically in `src/app/api/planning/route.ts:7` and `src/app/api/planning/bulk/route.ts:7`. If the product ever tunes the cap, both files must change in sync. Natural fit for `src/domain/constants.ts` which already holds other shared limits.
- **Proposed improvement:** Export `MAX_NOTES_LENGTH` (or better, an `API_LIMITS` object if promoting DE-REC-030 alongside) from `src/domain/constants.ts`. Update both imports.
- **Expected product/technical value:** Removes a two-line drift risk. Tiny but clean.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None. Would be a natural first step toward DE-REC-030 (centralize all `API_LIMITS`).
- **Suggested owner:** Delivery Agent
- **Why now:** Trivial and removes an obvious duplicate discovered during the validation-consolidation scan.

### DE-REC-074: Batch FK validation in driver POST nested records (carried over)

- **Problem:** `POST /api/drivers` loops over nested `employmentRecords`, `functionRecords`, and `rosterAssignments` and pushes one `validateOptionalForeignKey` promise per record per FK field. A driver with 10 function records generates 20 FK count queries. They run in parallel via `Promise.all()` so it's not an N+1 over network, but it does flood the DB with identical per-id count calls when 3–5 batched queries would suffice.
- **Proposed improvement:** Collect unique IDs per model into sets, then call `validateForeignKeys([...])` once per FK-typed field instead of once per record.
- **Expected value:** Fewer DB round trips on driver bulk creation. Cleaner code.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-070: Align client-side `TARGET_ENTITIES` with server-side `VALID_TARGET_ENTITIES` (carried over)

- **Problem:** `ImportSourceManager.tsx` defines its own `TARGET_ENTITIES` array while `api-import-helpers.ts` exports `VALID_TARGET_ENTITIES` separately. Silent drift risk.
- **Proposed improvement:** Export a typed `TARGET_ENTITY_OPTIONS` (value + Dutch label) from a shared location and have both sides consume it, or at minimum add a code comment + runtime assertion.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-062: Parallelize `autoCloseOpenRecords` + `getNextSequenceNumber` inside sub-record transactions (carried over)

- **Problem:** Employment / function / roster-assignment POST handlers await these two helpers sequentially inside `$transaction`; they are independent reads.
- **Proposed improvement:** Wrap in `Promise.all()`.
- **Expected value:** Saves one DB round trip per sub-record creation (~50–100 ms on Neon serverless).
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-063: Validate `weeklyHours` range (0–168) on roster assignment POST/PUT (carried over)

- **Problem:** `weeklyHours` stored without bounds validation.
- **Proposed improvement:** Add `if (weeklyHours != null && (weeklyHours < 0 || weeklyHours > 168))` with Dutch message. Would also be a natural consumer of a future `validateNumericRange` helper.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-059: Parallelize sequential DB calls in import-source execute route (carried over)

- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs independent sequential queries that could run concurrently.
- **Proposed improvement:** Use `Promise.all()` for independent queries.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-030: Centralize magic numbers in `API_LIMITS` (carried over)

- **Problem:** `MAX_FILE_SIZE`, `MAX_NOTES_LENGTH`, `MAX_ROW_COUNT`, and several other numeric limits are duplicated or inline across routes.
- **Proposed improvement:** `API_LIMITS` object in `src/domain/constants.ts`. DE-REC-077 above is a natural first increment.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-065: API response data path configuration for import sources (carried over)

- **Problem:** Hardcoded wrapper key list in execute handler.
- **Proposed improvement:** Optional `apiDataPath` field with dot-notation fallback.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-031: Call `cleanupOldEvents()` for `PerformanceEvent` table (carried over)

- **Problem:** `cleanupOldEvents()` defined in `src/lib/perf.ts` but never called. Table grows unbounded.
- **Proposed improvement:** Invoke it opportunistically at the end of `withPerfLogging` (e.g. with a small probability gate) or on a scheduled hook.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

## Risks / Watch-outs

- **API credentials storage is plaintext JSON:** Adequate for Phase 1. Should be reviewed before real API keys are used in production.
- **PerformanceEvent table growth:** Unbounded; `cleanupOldEvents()` exists but is never called.
- **API import 30-second timeout:** May be insufficient for slow APIs. Vercel serverless function timeout is the binding constraint.
- **API response size unbounded:** `MAX_ROW_COUNT` only applies after parse; no pre-parse body size cap.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` / `handleBulkSelect` do not roll back on failed API calls.
- **Auth env vars required for deployment:** Without `NEXTAUTH_SECRET`, auth is inactive and role enforcement is silently skipped.
- **`useUserRole` grants full permissions during session loading:** UI hook returns `isAdmin: true` while session is loading or when auth is not configured.
- **No database-level length constraints:** All text field length validation is application-level only. PB-196 does not change this — it only centralizes the app-level checks.
- **Audit log fire-and-forget:** `logAudit()` silently catches errors. By design (audit failures must not block mutations).
- **Skill duplicate check race condition:** The `findFirst` → `create` pattern in `/api/settings/skills` POST can allow duplicate names under concurrent requests. Low likelihood at current traffic; a unique DB constraint would be more robust.
- **Execute route internal duplication:** `executeApiImport` and `executeCsvImport` in `src/app/api/import-sources/[id]/execute/route.ts` share significant flow (target→source map, required-field check, importDrivers/importStamtabel dispatch, importLog write). A shared `runImport(rows, source, mode)` helper would reduce ~80 lines, but this is held back because the route is already flagged for careful handling. Revisit if execute logic changes again.
- **Roster assignment POST fetches `rosterProfile` inside the transaction:** The FK was already validated up front via `validateOptionalForeignKey`, so the in-transaction `findUnique` adds nothing safety-wise. Moving it out of the transaction is a marginal optimization and not worth a separate recommendation yet.

## Items Intentionally Not Recommended

- Migrate to a different ORM.
- Pagination on small settings/master-data endpoints.
- Broad refactor of `PlanningGrid.tsx`.
- Splitting `ImportSourceManager.tsx` (~1477 lines).
- Splitting `UserGroupManager.tsx` (~642 lines).
- Splitting `DriverForm.tsx` (~475 lines).
- Unique constraints on Driver/Scenario names (product decision).
- Extending `withPerfLogging` to all routes.
- Broad `any` type replacement.
- Translating server-side `console.error` messages.
- Other `.find()` calls in render paths over small arrays.
- Wrap DELETE routes in transactions (theoretical race at current concurrency).
- React.memo on settings list items / StatusBadge / StatusSelector / Header / Sidebar / ZoomSelector / CapacityTable / CapacityKPIs.
- Add missing foreign key indexes (not bottlenecks at current volumes).
- Introduce Zod or a schema validation dependency.
- Distinguish error types in catch blocks route-wide.
- Add parent driver existence checks in sub-record routes (Prisma FK constraints catch this).
- Upgrade to next-auth v5 (defer until Next.js 15 upgrade).
- Standardize API response wrapping (breaking contract change).
- Add composite (driverId, scenarioId, date) index (unique constraint already covers it).
- Type-safe dynamic Prisma model access in import entity-generic code.
- Wrap audit writes in `$transaction` with mutations (by design: PB-146/147).
- Validate roster profile entry dayOffset/status (UI-constrained).
- Unsafe `context?: any` in dynamic route handlers (stylistic).
- `useApi` console.error logging (intentional).
- `for-range` order-by / driver include drift (minor, intentional optimizations).
- `csv-parser` escaped quote handling for non-comma separators.
- Audit planning entries (excluded by design — PB-148).
- P2025 handling on sub-record DELETE routes (low impact).
- Scenario duplicate name detection (product decision).
- `handleUpdate` → `useCallback` in PlanningGrid (would break exhaustive-deps warnings for marginal gain).
- Encrypt `apiCredentials` at rest (product decision).
- Limit API response body size (MAX_ROW_COUNT provides sufficient protection after parse).
- Extract execute result UI into shared component (two similar but not identical consumers).
- Extract SortIcon from PlanningGrid (locality > factoring).
- Centralize Map construction across components (shared hook adds coupling).
- Scoped cache invalidation in `useApi` (current global invalidation is simple and reliable).
- Add error states to capacity/planning components (parents handle this).
- Extract `useDebounce` (one consumer).
- Add aria-labels to chart visualizations (Recharts manages).
- Batch FK validation in driver creation — partially done (skillIds), see DE-REC-074 for the nested-record extension.
- Move roster-assignment POST `rosterProfile` fetch outside the transaction (marginal; keeping the transaction self-contained has its own readability value).
- Rename `MAX_NOTES_LENGTH` to a more generic constant (current name is correct for the use).
- Completed items retained from past cycles: PB-176/177/178/183/184/185/186/187/188/189/190/192/193/194/195/196/197. Do not re-recommend.
- Preferences `key` field length cap (keys are hardcoded strings from the frontend).
- `useApi` cache key uses `Function.toString()` (theoretically fragile under minification; different arrow functions produce different minified strings due to URL content).
- Import logs route sequential queries (same category as DE-REC-059).
- `autoCloseOpenRecords` UTC dependency (not a defect).
- Department scope TOCTOU in bulk route (theoretical at current concurrency).
- Rate limiting on import execute endpoint (ADMIN-only limits exposure).
- `useApiData` unbounded cache growth (short session lifetime).
- Bulk delete endpoint for planning entries (not a user workflow).
- Inconsistent pagination shape across endpoints (breaking contract change).
- Missing preference audit logging (UI state, not business data).
- Scenario count limits.
- Whitespace validation on driver name PUT.
- DE-REC-058 and DE-REC-073 closed this cycle as part of PB-196.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused. Next available: DE-REC-078.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
