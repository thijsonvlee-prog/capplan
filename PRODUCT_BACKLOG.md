# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Planning grid and drivers page are now at product-grade visual quality. Authorization model complete. The active backlog is light — remaining work is polish and consistency items. Next focus: capacity page visual lift (last screen below standard), small technical consistency fixes, and resolving the ESC-009 POC decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-130: Extend P2025 handling to remaining DELETE routes

- **ID:** PB-130
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** Four DELETE routes still return 500 when the record doesn't exist: `roster-profiles/[id]`, `settings/[type]/[id]`, `settings/skills/[id]`, and `user-groups/[id]`. This is inconsistent with the just-fixed routes (PB-128).
- **Why this matters now:** Pattern is fresh from PB-128. Quick consistency fix across all DELETE endpoints.
- **Scope notes:** Add the same P2025 error check pattern to these four routes. Return 404 with Dutch "niet gevonden" messages.
- **Dependencies:** None.
- **Definition of done:** All four DELETE routes return 404 for non-existent records instead of 500. `npm run verify` passes.
- **Source:** DE-REC-042.

---

## Blocked / Needs Decision

### PB-129: POC capacity summary row — promote or remove

- **ID:** PB-129
- **Owner:** Product Owner (pending Scrum Master decision)
- **Priority:** P3 Medium
- **Status:** Blocked (ESC-009)
- **Problem / opportunity:** `PlanningGrid.tsx` has a `showCapacitySummary` state marked as "POC". The CapacitySummaryRow component and its integration add maintenance cost. Either it should be promoted to a proper feature or the code should be removed.
- **Why this matters now:** The planning grid just received visual updates. Good time to settle the POC's status before further grid changes.
- **Scope notes:** Depends on Scrum Master decision. If promote: remove POC label, ensure styling matches new grid design. If remove: delete CapacitySummaryRow component and related code from PlanningGrid.
- **Dependencies:** ESC-009 decision.
- **Definition of done:** POC label removed (promoted) or code deleted (removed). `npm run verify` passes.
- **Source:** DE-REC-038.

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-131: Capacity page — visual identity lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Added KPI summary module (5 metric cards: gem. beschikbaar, gem. totaal, gem. verlof, gem. ziek, bezettingsgraad). Toolbar moved into page header using control-group pattern. Chart/table wrapped in named sections with section titles. Removed outer borders from chart/table cards (No-Line Rule).

### PB-125: Add scenarioId to PlanningEntry domain type

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added `scenarioId?: string` to `PlanningEntry` type in `src/domain/types.ts`.

### PB-128: DELETE routes — return 404 instead of 500 for missing records

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Added P2025 error detection for `drivers/[id]`, `planning/[id]`, and `scenarios/[id]` DELETE routes.

### PB-126: Move ScenarioSelector out of "Weergave" toolbar zone

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** ScenarioSelector moved from "Weergave" to "Periode" zone.

### PB-127: Drivers page — visual quality lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Tonal row alternation, brand hover, integrated search toolbar, pagination footer styling.

### Delivery Agent bugfix: Row striping pattern at group boundaries

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Fixed continuous global index for row striping across groups.

---

## Deferred

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

### DE-REC-036: CapacitySummaryRow per-cell entry lookup optimization

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Depends on POC decision (ESC-009/PB-129). Will be actionable after that decision.
- **Source:** DE-REC-036.

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
