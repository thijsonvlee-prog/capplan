# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle I executed **PB-212 — Parallelize independent queries in import-source logs route**. The two sequential queries (`findUnique` for source existence + `findMany` for logs) now run concurrently via `Promise.all()`. The 404 guard fires after resolution. Same response shape and Dutch error messages. `npm run verify` passes with 0 errors and 0 new warnings.

**This completes all identified parallelization opportunities across the entire API surface.** The systematic track started with PB-205 (sub-record autoClose + getNextSeq), continued through PB-208 (planning FK), PB-209 (driver POST batch FK), PB-211 (validateForeignKeys helper), and is now closed with PB-212 (import-source logs). Every route with independent sequential queries now uses `Promise.all()`.

A fresh codebase scan confirmed the codebase is in a clean, consistent state. One new minor finding (VALID_ROLES duplication) is added below. All remaining items are carry-over P4 hygiene improvements. No new P1-P3 issues were found.

## Recommended Next Improvements

### DE-REC-081: Centralize VALID_ROLES constant

- **Title:** Move VALID_ROLES to api-route-utils.ts
- **Problem:** `src/app/api/users/[id]/route.ts` defines a local `VALID_ROLES = ["ADMIN", "PLANNER", "VIEWER"]` array (line 6). The `api-route-utils.ts` module already exports `VALID_PLANNING_STATUSES` and `VALID_EMPLOYMENT_TYPES` for the same purpose. Having VALID_ROLES inline creates a drift risk if a new role is added to the domain enum but not updated in the route.
- **Proposed improvement:** Export `VALID_ROLES` from `api-route-utils.ts` (derived from the `UserRole` enum in `enums.ts`) and import it in the users route.
- **Expected product/technical value:** Consistency with the existing centralization pattern. Eliminates one more inline constant.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Same spirit as PB-200 (centralize validation constants). Single-file change plus one import update.

### DE-REC-070: Align client-side `TARGET_ENTITIES` with server-side `VALID_TARGET_ENTITIES` (carried over)

- **Title:** Deduplicate entity list between frontend and backend
- **Problem:** `ImportSourceManager.tsx` defines its own `TARGET_ENTITIES` array while `api-import-helpers.ts` exports `VALID_TARGET_ENTITIES` separately. Silent drift risk — adding a new target entity on one side won't surface on the other until runtime.
- **Proposed improvement:** Export a typed `TARGET_ENTITY_OPTIONS` (value + Dutch label) from a shared `src/domain/` location and have both sides consume it. Alternatively, keep `VALID_TARGET_ENTITIES` as the single source and have the UI derive labels from a small `labels.ts` map.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort shared constant extraction, same spirit as PB-200. Closes a latent drift risk before a new target entity is added.

### DE-REC-074: Carry forward — apply same batching to driver PUT path if nested FK writes are added

- **Title:** Extend unique-ID batching to driver update path if nested FK writes are added
- **Problem:** The PUT handler in `src/app/api/drivers/[id]/route.ts` currently only validates `skillIds` via `validateForeignKeys`. It does not touch employment/function/roster records directly (those use dedicated sub-record routes), so no fix is needed today. But if the update path is ever extended to accept nested record changes in one call, the same `collectUnique()` pattern should be applied.
- **Proposed improvement:** Documentation reminder only — no code change now. If scope changes in a future item, copy the `collectUnique()` helper (or promote it to `api-route-utils.ts`) before extending the PUT payload.
- **Priority:** P4 Low (documentation/reminder)
- **Effort:** None (monitor only)
- **Risk:** N/A
- **Dependencies:** Depends on future scope change
- **Suggested owner:** Delivery Agent
- **Why now:** Keeping the parallelization rationale visible so it isn't lost when future features touch driver writes.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route (carried over)

- **Title:** Use `Promise.all()` for independent queries in execute handler
- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs several sequential reads on independent tables at the top of the handler (source lookup, allowed department resolution, pre-existing row counts for diff logic). Each awaited call is one round trip on Neon.
- **Proposed improvement:** Identify which reads are genuinely independent (the `source` read must happen first because subsequent logic branches on its shape) and wrap the rest in `Promise.all()`.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Same parallelization pattern as PB-205/PB-208/PB-212. ADMIN-only endpoint, so the user-visible impact is narrow — but it keeps the codebase consistent.

### DE-REC-030: Centralize magic numbers in `API_LIMITS` (carried over)

- **Title:** Consolidate remaining numeric limits into a shared object
- **Problem:** `MAX_FILE_SIZE`, `MAX_ROW_COUNT`, and several other numeric limits are duplicated or inline across routes. PB-200 addressed `MAX_NOTES_LENGTH`; other limits remain scattered.
- **Proposed improvement:** `API_LIMITS` object in `src/domain/constants.ts` or `src/lib/api-route-utils.ts`.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Natural extension of the consolidation work already done. Pick up after 1-2 more limits drift.

### DE-REC-065: API response data path configuration for import sources (carried over)

- **Title:** Make API response wrapper key detection configurable
- **Problem:** Hardcoded wrapper key list in execute handler fails for non-standard API envelope shapes.
- **Proposed improvement:** Optional `apiDataPath` field with dot-notation fallback.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent

### DE-REC-031: Call `cleanupOldEvents()` for `PerformanceEvent` table (carried over)

- **Title:** Invoke perf event cleanup opportunistically
- **Problem:** `cleanupOldEvents()` defined in `src/lib/perf.ts` but never called. Table grows unbounded.
- **Proposed improvement:** Invoke it opportunistically at the end of `withPerfLogging` (e.g. with a small probability gate like ~1%) or on a scheduled hook.
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
- **N+1 in execute route upsert loops:** `importDrivers` and `importStamtabel` execute individual `update()` calls per row inside transactions. Prisma does not support batch updates with per-row data, so this is a structural limitation. Only relevant under upsert mode with large diffs.

## Items Intentionally Not Recommended

- Migrate to a different ORM.
- Pagination on small settings/master-data endpoints.
- Broad refactor of `PlanningGrid.tsx`.
- Splitting `ImportSourceManager.tsx` (~1477 lines).
- Splitting `UserGroupManager.tsx` (~642 lines).
- Splitting `DriverForm.tsx` (~475 lines).
- Splitting `MobilePlanningView.tsx` (~503 lines).
- Unique constraints on Driver/Scenario names (product decision).
- Extending `withPerfLogging` to all routes.
- Broad `any` type replacement.
- Translating server-side `console.error` messages.
- Other `.find()` calls in render paths over small arrays (DRIVER_COLUMNS is 8 items, scenarios is typically <10).
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
- Move roster-assignment POST `rosterProfile` fetch outside the transaction (marginal; keeping the transaction self-contained has its own readability value).
- Rename `MAX_NOTES_LENGTH` to a more generic constant (current name is correct for the use).
- Completed items retained from past cycles: PB-176/177/178/183/184/185/186/187/188/189/190/192/193/194/195/196/197/200/201/204/205/208/209/211/212. Do not re-recommend.
- Preferences `key` field length cap (keys are hardcoded strings from the frontend).
- `useApi` cache key uses `Function.toString()` (theoretically fragile under minification; different arrow functions produce different minified strings due to URL content).
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
- DE-REC-062 and DE-REC-063 closed in PB-204/PB-205.
- DE-REC-078 closed in PB-208.
- DE-REC-074 nested-record portion closed in PB-209 (only the PUT-path reminder remains, see above).
- DE-REC-079 closed in PB-211.
- DE-REC-080 closed in PB-212.
- `ALL_PLANNING_STATUSES` vs `VALID_PLANNING_STATUSES` overlap (`constants.ts` vs `api-route-utils.ts`) — different type signatures serve different purposes: typed domain constant vs. untyped string array for request validation. Not worth merging.
- `useApi` doFetch silently catches errors — by design; mutation invalidation is fire-and-forget to avoid blocking the UI. Failed refetches show stale data until next successful fetch.
- Parallelize `getAllowedDepartmentIds` + FK checks in planning routes — `getAllowedDepartmentIds` result is consumed by the driver ownership check which must run before the create path.
- Parallelize `findUnique` calls in `users/[id]/route.ts` PUT handler — ADMIN-only endpoint with 2 fast queries; minimal gain vs. code churn.
- Roster-assignment PUT `validateOptionalForeignKey` guard on required field — functionally correct because `validateRequired` runs first; the conditional wrapper is stylistic, not a bug.
- Empty-body validation on driver PUT — Prisma handles empty updates gracefully; adding a check would be a no-op guard.
- Extract `importDrivers`/`importStamtabel` from execute route into a separate module — the functions are tightly coupled to the route's transaction and error semantics; extraction adds coupling without reducing complexity.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused. Next available: DE-REC-082.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
