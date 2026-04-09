# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle I executed the two P4 items that were Ready in the backlog:

- **PB-200 — Centralize enum validation arrays and `MAX_NOTES_LENGTH`.** Added `VALID_PLANNING_STATUSES`, `VALID_EMPLOYMENT_TYPES`, and `MAX_NOTES_LENGTH` as shared constants in `api-route-utils.ts`. Replaced 4 inline `Object.values()` definitions across planning and employment routes and 2 inline `MAX_NOTES_LENGTH` definitions. All 4 affected route files no longer import from `@/domain/enums` directly. Same error messages and status codes preserved.
- **PB-201 — `verifyRecordOwnership` helper.** Added `verifyRecordOwnership(model, recordId, driverId)` in `api-route-utils.ts` that returns the found record or null (rather than just boolean) so DELETE handlers retain the record for audit logging. Replaced all 6 inline ownership-check blocks in employment, functions, and roster-assignments `[recordId]/route.ts` files.

Both changes are pure refactors: no behavior change. `npm run verify` passes.

After shipping, the remaining carry-over items from previous cycles are still valid. No major new consolidation opportunities surfaced. The validation-consolidation track that started with PB-196/197 is now complete — all duplicate validation patterns identified in the fresh scans have been addressed.

## Recommended Next Improvements

### DE-REC-074: Batch FK validation in driver POST nested records (carried over)

- **Title:** Collect unique FK IDs per field and validate in bulk
- **Problem:** `POST /api/drivers` loops over nested `employmentRecords`, `functionRecords`, and `rosterAssignments` and pushes one `validateOptionalForeignKey` promise per record per FK field. A driver with 10 function records generates 20 FK count queries. They run in parallel via `Promise.all()` so it's not an N+1 over network, but it does flood the DB with identical per-id count calls when 3-5 batched queries would suffice.
- **Proposed improvement:** Collect unique IDs per model into sets, then call `validateForeignKeys([...])` once per FK-typed field instead of once per record.
- **Expected product/technical value:** Fewer DB round trips on driver bulk creation. Cleaner code.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Straightforward optimization on the driver creation path. Low risk, clear payoff.

### DE-REC-070: Align client-side `TARGET_ENTITIES` with server-side `VALID_TARGET_ENTITIES` (carried over)

- **Title:** Deduplicate entity list between frontend and backend
- **Problem:** `ImportSourceManager.tsx` defines its own `TARGET_ENTITIES` array while `api-import-helpers.ts` exports `VALID_TARGET_ENTITIES` separately. Silent drift risk.
- **Proposed improvement:** Export a typed `TARGET_ENTITY_OPTIONS` (value + Dutch label) from a shared location and have both sides consume it, or at minimum add a code comment + runtime assertion.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort shared constant extraction. Same spirit as PB-200.

### DE-REC-062: Parallelize `autoCloseOpenRecords` + `getNextSequenceNumber` inside sub-record transactions (carried over)

- **Title:** Wrap independent sequential reads in `Promise.all()`
- **Problem:** Employment / function / roster-assignment POST handlers await these two helpers sequentially inside `$transaction`; they are independent reads.
- **Proposed improvement:** Wrap in `Promise.all()`.
- **Expected product/technical value:** Saves one DB round trip per sub-record creation (~50-100 ms on Neon serverless).
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Trivial optimization. Same transaction shape, just parallel reads.

### DE-REC-063: Validate `weeklyHours` range (0-168) on roster assignment POST/PUT (carried over)

- **Title:** Add numeric bounds check for `weeklyHours`
- **Problem:** `weeklyHours` stored without bounds validation. Could accept negative values or values exceeding hours in a week.
- **Proposed improvement:** Add `if (weeklyHours != null && (weeklyHours < 0 || weeklyHours > 168))` with Dutch message.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Last remaining un-validated numeric field in sub-record routes.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route (carried over)

- **Title:** Use `Promise.all()` for independent queries in execute handler
- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs independent sequential queries that could run concurrently.
- **Proposed improvement:** Use `Promise.all()` for independent queries.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick optimization but not user-facing.

### DE-REC-030: Centralize magic numbers in `API_LIMITS` (carried over)

- **Title:** Consolidate remaining numeric limits into a shared object
- **Problem:** `MAX_FILE_SIZE`, `MAX_ROW_COUNT`, and several other numeric limits are duplicated or inline across routes. PB-200 addressed `MAX_NOTES_LENGTH`; other limits remain scattered.
- **Proposed improvement:** `API_LIMITS` object in `src/domain/constants.ts`.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Natural extension of the consolidation work already done.

### DE-REC-065: API response data path configuration for import sources (carried over)

- **Title:** Make API response wrapper key detection configurable
- **Problem:** Hardcoded wrapper key list in execute handler.
- **Proposed improvement:** Optional `apiDataPath` field with dot-notation fallback.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent

### DE-REC-031: Call `cleanupOldEvents()` for `PerformanceEvent` table (carried over)

- **Title:** Invoke perf event cleanup opportunistically
- **Problem:** `cleanupOldEvents()` defined in `src/lib/perf.ts` but never called. Table grows unbounded.
- **Proposed improvement:** Invoke it opportunistically at the end of `withPerfLogging` (e.g. with a small probability gate) or on a scheduled hook.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent

## Risks / Watch-outs

- **API credentials storage is plaintext JSON:** Adequate for Phase 1. Should be reviewed before real API keys are used in production.
- **PerformanceEvent table growth:** Unbounded; `cleanupOldEvents()` exists but is never called.
- **API import 30-second timeout:** May be insufficient for slow APIs. Vercel serverless function timeout is the binding constraint.
- **API response size unbounded:** `MAX_ROW_COUNT` only applies after parse; no pre-parse body size cap.
- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` / `handleBulkSelect` do not roll back on failed API calls.
- **Auth env vars required for deployment:** Without `NEXTAUTH_SECRET`, auth is inactive and role enforcement is silently skipped.
- **`useUserRole` grants full permissions during session loading:** UI hook returns `isAdmin: true` while session is loading or when auth is not configured.
- **No database-level length constraints:** All text field length validation is application-level only.
- **Audit log fire-and-forget:** `logAudit()` silently catches errors. By design (audit failures must not block mutations).
- **Skill duplicate check race condition:** The `findFirst` -> `create` pattern in `/api/settings/skills` POST can allow duplicate names under concurrent requests. Low likelihood at current traffic; a unique DB constraint would be more robust.
- **Execute route internal duplication:** `executeApiImport` and `executeCsvImport` share significant flow. A shared `runImport(rows, source, mode)` helper would reduce ~80 lines, but the route is already flagged for careful handling.
- **Roster assignment POST fetches `rosterProfile` inside the transaction:** The FK was already validated up front. Moving it out is a marginal optimization.

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
- Audit planning entries (excluded by design - PB-148).
- P2025 handling on sub-record DELETE routes (low impact).
- Scenario duplicate name detection (product decision).
- `handleUpdate` -> `useCallback` in PlanningGrid (would break exhaustive-deps warnings for marginal gain).
- Encrypt `apiCredentials` at rest (product decision).
- Limit API response body size (MAX_ROW_COUNT provides sufficient protection after parse).
- Extract execute result UI into shared component (two similar but not identical consumers).
- Extract SortIcon from PlanningGrid (locality > factoring).
- Centralize Map construction across components (shared hook adds coupling).
- Scoped cache invalidation in `useApi` (current global invalidation is simple and reliable).
- Add error states to capacity/planning components (parents handle this).
- Extract `useDebounce` (one consumer).
- Add aria-labels to chart visualizations (Recharts manages).
- Batch FK validation in driver creation - partially done (skillIds), see DE-REC-074 for the nested-record extension.
- Move roster-assignment POST `rosterProfile` fetch outside the transaction (marginal; keeping the transaction self-contained has its own readability value).
- Rename `MAX_NOTES_LENGTH` to a more generic constant (current name is correct for the use).
- Completed items retained from past cycles: PB-176/177/178/183/184/185/186/187/188/189/190/192/193/194/195/196/197/200/201. Do not re-recommend.
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
- DE-REC-058 and DE-REC-073 closed in PB-196.
- DE-REC-075, DE-REC-076, DE-REC-077 closed in PB-200/PB-201.
- `ALL_PLANNING_STATUSES` vs `VALID_PLANNING_STATUSES` overlap (`constants.ts` vs `api-route-utils.ts`) — different type signatures serve different purposes: typed domain constant vs. untyped string array for request validation. Not worth merging.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused. Next available: DE-REC-078.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
