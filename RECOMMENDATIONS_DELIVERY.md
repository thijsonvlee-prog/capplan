# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

No Delivery items were Ready in the backlog this cycle — the backlog direction is "No critical or high-priority debt". I verified baseline (`npm run verify` passes cleanly) and ran a fresh codebase scan for new concrete opportunities.

The scan surfaced one genuinely new consolidation theme that did not exist in prior recommendations: **two validation patterns are duplicated at scale across API routes** (string length check — 27 instances; start/end date comparison — 6 instances), each with identical Dutch error messages copy-pasted across files. These are safe consolidations into `api-route-utils.ts` and are the highest-value Delivery work currently visible. Everything else is P4 Low maintenance or already captured.

## Recommended Next Improvements

### DE-REC-071: Centralize string length validation helper in `api-route-utils.ts`

- **Title:** Extract `validateMaxLength` helper to eliminate ~27 duplicated length checks
- **Problem:** ~27 API write routes contain the same inline pattern: `if (typeof field === "string" && field.length > N) return NextResponse.json({ error: "<Label> mag maximaal N tekens bevatten" }, { status: 400 });`. Spread across drivers, scenarios, import-sources, user-groups, roster-profiles, settings (skills, stamtabel), driver sub-records. Labels and limits drift if the pattern is reused without discipline, and the duplication hides the fact that every route is re-enforcing the same invariant.
- **Proposed improvement:** Add a `validateMaxLength(value, maxLength, label)` helper in `api-route-utils.ts` that returns `null` on valid (including skip on non-string) or a Dutch message `"<Label> mag maximaal N tekens bevatten"`. Replace all ~27 instances. Optionally expose a `validateMaxLengths(checks)` that returns the first error for multi-field routes. Pure refactor, no behavior change.
- **Expected product/technical value:** Eliminates ~27 copy-pasted blocks, enforces a single error-message phrasing, and reduces the cost of adding new write routes. Aligns with the CLAUDE.md rule: "Do not duplicate logic that already exists there."
- **Priority:** P3 Medium
- **Effort:** Small (one helper + mechanical replace)
- **Risk:** Low (refactor preserves exact Dutch error strings and status codes)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Highest-value duplication currently present. Any new write route being added compounds the debt. Also closes DE-REC-058 as a natural side effect (apply helper to preferences PUT).

### DE-REC-072: Extract `validateDateRange` for start/end date comparison

- **Title:** Consolidate 6 duplicated `endDate < startDate` checks in sub-record routes
- **Problem:** Employment, function, and roster-assignment routes (both POST on `/route.ts` and PUT on `/[recordId]/route.ts`) contain exactly the same block:
  ```ts
  if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
    return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
  }
  ```
  6 identical occurrences. Also slightly inefficient: for already-validated `YYYY-MM-DD` strings a lexicographic comparison is equivalent and cheaper.
- **Proposed improvement:** Add `validateDateRange(startDate, endDate)` in `api-route-utils.ts`, return `null` or Dutch message. Lexicographic comparison on already-formatted ISO date strings (datum validation now runs first per PB-186). Replace 6 instances.
- **Expected product/technical value:** Eliminates 6 duplicated blocks, enforces a single rule. Reduces drift risk if a product decision ever allows same-day end.
- **Priority:** P3 Medium
- **Effort:** Small
- **Risk:** Low (after PB-186 date format is guaranteed at the point of comparison, so lex compare is safe)
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Cleanly pairs with DE-REC-071 as a single validation-consolidation cycle.

### DE-REC-073: Missing name length cap on scenario duplicate route

- **Title:** Scenario duplicate POST does not enforce `name.length <= 200`
- **Problem:** `POST /api/scenarios/[id]/duplicate` validates `name` presence (trim non-empty) but, unlike `POST /api/scenarios`, never enforces the 200-char max. A 10_000-char name would succeed and create a driftful scenario record.
- **Proposed improvement:** Add the same length check as the main scenarios route (ideally via the new `validateMaxLength` helper from DE-REC-071).
- **Expected product/technical value:** Closes a single validation gap with an identical rule already applied to sibling routes.
- **Priority:** P4 Low
- **Effort:** Small (one check)
- **Risk:** Low
- **Dependencies:** Fits naturally alongside DE-REC-071
- **Suggested owner:** Delivery Agent
- **Why now:** Only scenario-related write endpoint without the cap. Trivial to close.

### DE-REC-074: Batch FK validation in driver POST nested records

- **Title:** Collapse per-record `validateOptionalForeignKey` loops into one batched `validateForeignKeys` call
- **Problem:** `POST /api/drivers` (lines ~120–135) loops over nested `employmentRecords`, `functionRecords`, and `rosterAssignments` and pushes one `validateOptionalForeignKey` promise per record per FK field. A driver with 10 function records generates 20 FK count queries. They run in parallel via `Promise.all()` so it's not an N+1 over network, but it does flood the DB with identical per-id count calls when 3–5 batched queries would suffice.
- **Proposed improvement:** Collect unique IDs per model into sets, then call `validateForeignKeys([{ ids: [...employerIds], model: prisma.employer, label: "werkgever" }, ...])`. One query per FK-typed field instead of one per record.
- **Expected product/technical value:** Fewer DB round trips on driver bulk creation. Cleaner code. Matches the existing pattern already used for `skillIds`.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Discovered during this cycle's scan. Not urgent but clean win.

### DE-REC-070: Align client-side `TARGET_ENTITIES` with server-side `VALID_TARGET_ENTITIES` (carried over)

- **Problem:** `ImportSourceManager.tsx` defines its own `TARGET_ENTITIES` array while `api-import-helpers.ts` exports `VALID_TARGET_ENTITIES` separately. Silent drift risk.
- **Proposed improvement:** Export a typed `TARGET_ENTITY_OPTIONS` (value + Dutch label) from a shared location and have both sides consume it, or at minimum add a code comment + runtime assertion.
- **Expected value:** Prevents silent divergence.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent
- **Why now:** Still valid, unchanged since last cycle.

### DE-REC-062: Parallelize `autoCloseOpenRecords` + `getNextSequenceNumber` inside sub-record transactions (carried over)

- **Problem:** Employment / function / roster-assignment POST handlers await these two helpers sequentially inside `$transaction`; they are independent reads.
- **Proposed improvement:** Wrap in `Promise.all()`.
- **Expected value:** Saves one DB round trip per sub-record creation (~50–100 ms on Neon serverless).
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-063: Validate `weeklyHours` range (0–168) on roster assignment POST/PUT (carried over)

- **Problem:** `weeklyHours` stored without bounds validation.
- **Proposed improvement:** Add `if (weeklyHours != null && (weeklyHours < 0 || weeklyHours > 168))` with Dutch message.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-058: Cap `value` length on preferences PUT (carried over)

- **Problem:** `/api/preferences` PUT accepts an unbounded `value` string. The only remaining write route without a length cap.
- **Proposed improvement:** Add a 500-char cap (ideally via the new `validateMaxLength` helper from DE-REC-071).
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-059: Parallelize sequential DB calls in import-source execute route (carried over)

- **Problem:** `/api/import-sources/[id]/execute/route.ts` performs independent sequential queries that could run concurrently.
- **Proposed improvement:** Use `Promise.all()` for independent queries.
- **Priority:** P4 Low · **Effort:** Small · **Risk:** Low
- **Suggested owner:** Delivery Agent

### DE-REC-030: Centralize magic numbers in `API_LIMITS` (carried over)

- **Problem:** `MAX_FILE_SIZE`, `MAX_NOTES_LENGTH`, `MAX_ROW_COUNT`, and several other numeric limits are duplicated or inline across routes.
- **Proposed improvement:** `API_LIMITS` object in `src/domain/constants.ts`.
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
- **No database-level length constraints:** All text field length validation is application-level only.
- **Audit log fire-and-forget:** `logAudit()` silently catches errors. By design (audit failures must not block mutations).
- **Skill duplicate check race condition:** The `findFirst` → `create` pattern in `/api/settings/skills` POST can allow duplicate names under concurrent requests. Low likelihood at current traffic; a unique DB constraint would be more robust.
- **Execute route internal duplication:** `executeApiImport` and `executeCsvImport` in `src/app/api/import-sources/[id]/execute/route.ts` share significant flow (target→source map, required-field check, importDrivers/importStamtabel dispatch, importLog write). A shared `runImport(rows, source, mode)` helper would reduce ~80 lines, but this is held back for now because the route is already flagged for careful handling and touching it is cross-cutting. Revisit if execute logic changes again.

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
- Completed items retained from past cycles: PB-176/177/178/183/184/185/186/187/188/189/190/192/193/194/195. Do not re-recommend.
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

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused. Next available: DE-REC-075.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
