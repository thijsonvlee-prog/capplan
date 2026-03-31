# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** All major screens are now at product-grade visual quality. Authorization model is complete. Per-user scenario state and error visibility are now shipped. ESC-009 (POC capacity summary row) is resolved — code removed. The active backlog is clear. Remaining items are P4 polish and deferred.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready._

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-132: Make active scenario selection per-user

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Active scenario preference now stored per authenticated user via `getServerSession`. Falls back to `"default"` when auth is not configured. Uses same `resolveUserId()` pattern as the preferences route. Eliminates cross-user interference in multi-user deployments.

### PB-133: Add error state to useApiData / useApiDataWithLoading hooks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** `useApiDataWithLoading` now returns `[data, loading, error]` where `error` is `string | null`. Backward-compatible — existing callers that destructure `[data, loading]` continue to work. DriverList shows a Dutch-language error state when the driver fetch fails. Error is cleared on successful fetch.

### PB-129: POC capacity summary row — remove

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Per ESC-009 decision (Option B), deleted `CapacitySummaryRow.tsx` and removed all related code from PlanningGrid (import, state, fetch, toggle button, rendering). Removed associated CSS class `.grid-totals-row`. The capacity page serves the aggregation use case. PlanningGrid reduced by ~20 lines.

### PB-130: Extend P2025 handling to remaining DELETE routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added P2025 error detection to `roster-profiles/[id]`, `settings/[type]/[id]`, `settings/skills/[id]`, and `user-groups/[id]` DELETE routes. All now return 404 with Dutch "niet gevonden" messages for non-existent records. Also extended P2025 handling to PUT routes for settings and skills. Fixed empty department list bug in `getAllowedDepartmentIds` (groups with no departments now fall back to unrestricted access). Added missing `requireRole("ADMIN")` to import logs endpoint.

### PB-131: Capacity page — visual identity lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Added KPI summary module (5 metric cards: gem. beschikbaar, gem. totaal, gem. verlof, gem. ziek, bezettingsgraad). Toolbar moved into page header using control-group pattern. Chart/table wrapped in named sections with section titles. Removed outer borders from chart/table cards (No-Line Rule).

---

## Deferred

### DE-REC-045: Add length cap on planning dates parameter

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick defensive fix but low urgency. The `/capacity` and `/for-range` routes already cap at 366/90. The base planning endpoint is only called with grid-visible dates (max ~90). Defer until capacity allows.
- **Source:** DE-REC-045.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is now structurally aligned. Custom tooltip would complete the integration but is cosmetic.
- **Source:** EX-REC-049.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.
- **Source:** EX-REC-048.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact. Schedule when capacity allows.
- **Source:** DE-REC-041.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes (< 20 users). Only relevant if user counts grow significantly.
- **Source:** EX-REC-044.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014 and DE-REC-030. Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low. Low urgency.
- **Source:** DE-REC-031.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up but needs visual evaluation.
- **Source:** EX-REC-038.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Polish item.
- **Source:** EX-REC-043.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.
- **Source:** EX-REC-042.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
