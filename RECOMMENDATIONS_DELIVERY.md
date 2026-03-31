# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

This cycle completed PB-125 (add `scenarioId` to `PlanningEntry` type) and PB-128 (404 instead of 500 for missing DELETE targets). A fresh codebase scan was performed. The codebase remains in good shape overall. Key new findings: four additional DELETE routes lack P2025 handling (consistency gap with the just-fixed routes), and several `any`-typed transform functions in `api-route-utils.ts` could benefit from proper typing.

No critical or high-priority findings. Remaining recommendations are medium and low priority maintainability items.

## Recommended Next Improvements

### DE-REC-042: Extend P2025 handling to remaining DELETE routes

- **Title:** Add 404 handling for missing records on remaining DELETE routes
- **Problem:** Four DELETE routes still return 500 when the record doesn't exist: `roster-profiles/[id]`, `settings/[type]/[id]`, `settings/skills/[id]`, and `user-groups/[id]`. This is inconsistent with the just-fixed routes (PB-128).
- **Proposed improvement:** Add the same P2025 error check pattern to these four routes.
- **Expected product/technical value:** Consistent error handling across all DELETE endpoints. Users see "niet gevonden" instead of generic errors.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Pattern is fresh from PB-128. Quick consistency fix.

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Title:** Replace `planningEntries.find()` with Map-based lookup in CapacitySummaryRow
- **Problem:** `CapacitySummaryRow.tsx` uses `.find()` inside a nested loop over drivers x dates. Same hot-path pattern that was fixed in PlanningGrid (PB-066).
- **Proposed improvement:** Build a local Map inside the component or pass `entryMaps` from PlanningGrid.
- **Expected product/technical value:** Consistent O(1) lookup pattern. Performance improvement for large grids.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low. Same proven pattern.
- **Dependencies:** Decision on whether CapacitySummaryRow POC should be promoted or removed (ESC-009).
- **Suggested owner:** Delivery Agent
- **Why now:** Small fix, but depends on the POC's future.

### DE-REC-038: POC capacity summary row — promote or remove

- **Title:** Decide fate of POC capacity summary row in PlanningGrid
- **Problem:** `PlanningGrid.tsx` has `showCapacitySummary` state marked as "POC". This experimental feature adds maintenance cost. Either it should be promoted to a proper feature or removed.
- **Proposed improvement:** Product decision: promote (remove POC label, add to documentation) or remove the code entirely.
- **Expected product/technical value:** Reduces maintenance ambiguity.
- **Priority:** P3 Medium
- **Effort:** Small (either direction)
- **Risk:** Low
- **Dependencies:** Product Owner / Scrum Master decision (ESC-009)
- **Suggested owner:** Product Owner
- **Why now:** Unresolved POC code in the most critical component adds regression risk during future grid work.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Title:** Clean up dead type definitions in types.ts
- **Problem:** `PlanningEntryOptions` and `UserContext` are defined but never imported anywhere. `ExternalSourceMetadata` and related fields are unused preparation placeholders.
- **Proposed improvement:** Remove `PlanningEntryOptions` and `UserContext`. Leave `ExternalSourceMetadata` with a note that it's preparatory.
- **Expected product/technical value:** Reduces confusion for developers reading the types file.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick cleanup.

### DE-REC-030: Extract hardcoded API limits to constants

- **Title:** Centralize magic numbers in API routes to `constants.ts`
- **Problem:** Magic numbers scattered across API routes: 364 (roster days), 28 (roster cycle), 50000 (max duplicate entries), 5000 (chunk size), 366 (max dates), 90 (max range), 100 (max code length), 5MB (max file size), 10000 (max import rows), 500 (chunk size), 20 (max import logs).
- **Proposed improvement:** Add an `API_LIMITS` constant object to `src/domain/constants.ts`.
- **Expected product/technical value:** Centralized configuration. Easier to audit and adjust limits.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low-effort maintainability improvement.

### DE-REC-014: Move hardcoded comparison chart colors to constants

- **Title:** Extract COMPARE_COLORS from CapacityChart to constants
- **Problem:** `CapacityChart.tsx` defines `COMPARE_COLORS` inline with hardcoded hex values.
- **Proposed improvement:** Move to `src/domain/constants.ts` with comments referencing design token equivalents.
- **Expected product/technical value:** Centralizes color definitions.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Quick compliance fix.

### DE-REC-031: Add PerformanceEvent table cleanup

- **Title:** Call `cleanupOldEvents()` or add TTL-based cleanup for PerformanceEvent
- **Problem:** `cleanupOldEvents()` in `src/lib/perf.ts` is defined but never called. Table grows indefinitely.
- **Proposed improvement:** Call `cleanupOldEvents()` periodically or at the end of `withPerfLogging`.
- **Expected product/technical value:** Prevents unbounded table growth.
- **Priority:** P4 Low
- **Effort:** Small
- **Risk:** Low
- **Dependencies:** None
- **Suggested owner:** Delivery Agent
- **Why now:** Low urgency but good hygiene.

## Risks / Watch-outs

- **PlanningGrid optimistic updates are fire-and-forget:** `handleUpdate` and `handleBulkSelect` apply optimistic UI updates but don't handle failed API calls. A failed save leaves the UI showing unsaved state. This is a known design choice.
- **POC capacity summary row:** `CapacitySummaryRow.tsx` and related code in PlanningGrid are marked as "POC EXPERIMENT". Should either be promoted or removed to avoid maintaining dead/experimental code (ESC-009 pending).
- **Auth env vars required for deployment:** Auth infrastructure requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials. Without these, auth is inactive and role enforcement is skipped silently.
- **Driver upsert without unique constraint:** Driver import upsert matches on `employeeNumber` using `findMany` (not a unique constraint). If multiple drivers share an `employeeNumber`, the batch lookup returns the first match.
- **useUserRole grants full permissions during session loading:** When session is loading or auth is not configured, the UI hook returns `isAdmin: true`. Admin-only controls flash briefly on page load for non-admin users.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Settings/master data tables are small. Only planning and drivers needed pagination.
- **Refactor PlanningGrid.tsx broadly:** The component is complex (~800 lines) but stable. Targeted fixes preferred.
- **Split ImportSourceManager.tsx (~838 lines):** Large but well-structured with distinct sections. Splitting would fragment the connectivity hub feature.
- **Split UserGroupManager.tsx (~642 lines):** Well-structured with clear sections. Not justified.
- **Add date format validation to all endpoints:** Prisma/PostgreSQL reject invalid dates at the storage layer. Only planning endpoints warrant it.
- **Add unique constraints on Driver/Scenario names:** Requires a product decision.
- **Extend withPerfLogging to all routes:** Fix the analysis layer before expanding collection.
- **Replace `any` types broadly:** ~27 instances are internal and well-contained. Fix opportunistically.
- **Translate console.error messages:** Server-facing logging should remain in English.
- **Split DriverForm.tsx (~475 lines):** Well-structured with tab-based organization.
- **Other `.find()` calls in render paths:** ScenarioSelector, RosterAssigner, etc. operate on small arrays (<10 items). PlanningGrid scenario lookup is also small array.
- **Wrap DELETE routes in transactions:** Theoretical race condition at current concurrency.
- **Add React.memo to settings list items:** Small lists, infrequent renders.
- **Add missing foreign key indexes:** Not bottlenecks at current data volumes.
- **Add input validation schema (Zod):** Introduces a new dependency. Not justified at current scale.
- **Distinguish error types in catch blocks:** Significant refactoring across route files for minimal benefit.
- **Add parent driver existence checks in sub-record routes:** Prisma FK constraints catch this.
- **Use next-auth v5 (Auth.js):** v4 is proven and stable with Next.js 14. Migration to v5 can happen when upgrading to Next.js 15.
- **Add file storage for uploaded CSVs:** Not needed — import re-uploads the file for execution.
- **Add scheduled/automatic imports:** Requires external trigger mechanism. Out of scope for current MVP.
- **Add React.memo to StatusBadge/StatusSelector:** Rendered within already-memoized DayCell; marginal improvement.
- **Batch FK validation in driver POST route:** Current parallel Promise.all approach is already efficient.
- **Add React.memo to GroupRows component:** Marginal improvement — PlanningGrid manages re-renders via entry maps.
- **CSV injection sanitization:** CSV data is stored in database fields, not re-exported to spreadsheets.
- **Standardize API response wrapping:** Some routes use `{ data }` wrapper, others return raw objects. Changing this is a breaking API contract change.
- **Add composite (driverId, scenarioId, date) index:** The unique constraint already covers this query pattern.
- **Add request rate limiting on imports:** No per-user tracking at current scale.
- **Add concurrent request deduplication in useApi:** Low-frequency issue.
- **Add progress tracking for long operations:** Would require streaming responses or a job queue.
- **Type-safe dynamic Prisma model access:** The `(prisma as any)[modelName]` pattern is pragmatic for entity-generic import logic.
- **Clean up orphan User records retroactively:** Requires manual identification.
- **Replace `useApi` cache key from `fetcher.toString()` to stable keys:** The current approach works because all fetch calls use named methods from `api.ts`.
- **Add error handling to PlanningGrid optimistic updates:** Deliberate design choice documented in CLAUDE.md.
- **Type the `parseJsonBody<T>` generic per route:** Would require ~25 request body interfaces.
- **Add auth checks to GET endpoints:** CLAUDE.md states VIEWER = read-only on all GET endpoints. User group filtering handles data scoping.
- **Add driverId FK validation on planning POST:** Prisma FK constraint catches invalid IDs.
- **Refactor useApi global cache invalidation:** The broadcast approach works because cache entries have a 30s freshness window.
- **autoCloseOpenRecords race condition:** Theoretical at current concurrency.
- **Add user group filtering to write endpoints:** Write endpoints already require the user to know the driver ID.
- **Add cache eviction to useApi:** Key space is bounded in practice.
- **Add parent driver existence checks in sub-record GET routes:** Returns empty array for non-existent driver. Correct behavior.
- **Add date format validation on sub-record POST endpoints:** Prisma/PostgreSQL rejects invalid dates at storage layer.
- **Validate roster profile entry dayOffset/status:** Entries created from fixed UI grid; invalid values can't arrive normally.
- **Warning tokens unused in CSS classes:** May be used via Tailwind utilities directly.
- **`--radius-xl` token unused:** Keep for future use; removing saves nothing.
- **Type `any` in transformDriver/transformProfile:** Internal helpers with well-understood input shapes. Typing improves correctness but is low-impact.
- **Precompute DRIVER_COLUMNS as Map in PlanningGrid:** Small fixed-size array; `.find()` on 5-6 items is negligible.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
