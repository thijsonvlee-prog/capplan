# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction (2026-04-20):** PB-213 and PB-214 completed by Experience Agent. DE-FIX-001 (missing VIEWER role enforcement on 6 GET endpoints) discovered and fixed by Delivery Agent. New PB-217 (strip apiCredentials from import-sources list endpoint, P3, Delivery Agent) promoted from DE-REC-083. ESC-014 (desktop homescreen) remains Deferred and unmarked (19 cycles).

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

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No items currently blocked. SMI-026 / ESC-014 remains Deferred — see Deferred section._

---

## Completed Recently

### PB-217: Strip apiCredentials from import-sources list endpoint

- **Owner:** Delivery Agent
- **Priority:** P3 Medium (security hygiene)
- **Status:** Completed (2026-04-21)
- **Implementation note:** Added explicit `select` clause to `GET /api/import-sources` that excludes `apiCredentials`. Modified `ImportSourceManager.tsx` `openEditForm` to fetch the full record (including credentials) from `GET /api/import-sources/[id]` when opening the edit form, with a loading spinner during fetch and error handling with Dutch toast message. List views, network logs, and browser caches no longer contain credential data. `npm run verify` passes.

### DE-FIX-001: Missing VIEWER role enforcement on 6 core GET endpoints

- **Owner:** Delivery Agent
- **Priority:** P2 High (security gap)
- **Status:** Completed (2026-04-20)
- **Implementation note:** Discovered during codebase scan that `GET /api/drivers`, `GET /api/drivers/[id]`, `GET /api/planning`, `GET /api/planning/for-range`, `GET /api/planning/capacity`, and `GET /api/roster-profiles/[id]` had no `requireRole()` check. When auth is configured, `getAllowedDepartmentIds()` returned `null` (unrestricted) for unauthenticated users, exposing all data. Added `requireRole("VIEWER")` / `requireRoleWithSession("VIEWER")` to all 6 endpoints with session reuse to avoid redundant DB lookups. `npm run verify` passes.

### PB-213: Planning grid sortable column headers — keyboard accessibility

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed (2026-04-20)
- **Implementation note:** Added `role="columnheader"`, `aria-sort`, `tabIndex={0}`, and `onKeyDown` (Enter/Space triggers sort) plus Dutch `aria-label` to both the "Chauffeur" `<th>` and all extra column `<th>` elements in `PlanningGrid.tsx`. `npm run verify` passes.

### PB-214: Centralize disabled state on .btn-icon and improve opacity

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Completed (2026-04-20)
- **Implementation note:** Added `.btn-icon:disabled` and `.btn-icon-danger:disabled` rules in `globals.css` (opacity 0.4, cursor not-allowed, pointer-events none). Removed 16 inline `disabled:opacity-30 disabled:cursor-not-allowed` declarations from `PlanningGrid.tsx`, `DriverList.tsx`, `MobilePlanningView.tsx`, and `AuditLogViewer.tsx`. `npm run verify` passes.

---

## Deferred

### SMI-026: Desktop homescreen (Blocked → Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 15 consecutive cycles. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

### EX-REC-055: RosterProfileEditor — tonal layering and weekend differentiation

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-traffic screen. All other settings sections are at design-system standard. Pick up when capacity allows.

### EX-REC-052: Mobile planning — edit capability (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after the mobile initiative is complete. The read-only planning flow should be validated with user feedback first.

### EX-REC-053: Mobile homescreen — greeting and scenario context

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-effort personalisation enhancement. Can be combined with any future mobile work cycle.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Only relevant if narrow desktop viewport usage is reported.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

### DE-REC-070: Align client-side TARGET_ENTITIES with server-side constant

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No user impact. Pick up when capacity allows.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** ADMIN-only endpoint, so the user-visible impact is narrow. Pick up when capacity allows.

### DE-REC-065: API response data path configuration

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural Phase 1 follow-up but not blocking.

### DE-REC-030: Centralize magic numbers in `API_LIMITS`

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Broader initiative. PB-200 took the first increment (`MAX_NOTES_LENGTH`). Revisit if more duplicated limits surface.

### PB-061: Add PerformanceEvent table cleanup mechanism (DE-REC-031)

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Partially addressed by PB-176.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-218.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
