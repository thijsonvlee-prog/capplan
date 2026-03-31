# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Planning grid visual quality now at product-grade level (PB-123, PB-124 completed). Authorization model complete. Next focus: closing the visual consistency gap between the planning/settings screens and the drivers page, plus small technical quality items that improve type safety and error handling.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-125: Add scenarioId to PlanningEntry domain type

- **ID:** PB-125
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `src/domain/types.ts` defines `PlanningEntry` without `scenarioId`, but `transformPlanningEntry` in `api-route-utils.ts` sets it and `PlanningGrid.tsx` uses it in optimistic updates. This creates a type gap that bypasses TypeScript safety.
- **Why this matters now:** One-line fix that improves type correctness across the most critical component. No risk.
- **Scope notes:** Add `scenarioId?: string` to the `PlanningEntry` type in `src/domain/types.ts`. Run verify.
- **Dependencies:** None.
- **Definition of done:** `scenarioId` field present on `PlanningEntry` type. `npm run verify` passes.
- **Source:** DE-REC-039.

### PB-126: Move ScenarioSelector out of "Weergave" toolbar zone

- **ID:** PB-126
- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `PlanningGrid.tsx:478` places ScenarioSelector inside the "Weergave" (View) control zone. Scenario selection is a data/context control, not a view setting. The zone label is misleading.
- **Why this matters now:** The toolbar was just restructured (PB-123). This is a small follow-up to correct zone semantics while the design is fresh.
- **Scope notes:** Move ScenarioSelector into the "Periode" zone (alongside date range controls) or into its own labeled zone. Keep the toolbar single-row layout. Do not restructure other zones.
- **Dependencies:** None.
- **Definition of done:** ScenarioSelector is no longer inside the "Weergave" zone. Toolbar remains visually coherent. `npm run verify` passes.
- **Source:** DE-REC-037.

### PB-127: Drivers page — visual quality lift

- **ID:** PB-127
- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The drivers table uses a flat table-first layout with weak hierarchy. Per DESIGN.md section 3.2, this is an anti-pattern. The gap between this page and the now product-grade planning/settings screens creates visible inconsistency.
- **Why this matters now:** Drivers page is a high-frequency screen. It is the most visible remaining design gap.
- **Scope notes:** Wrap the table in a card container with subtle shadow. Improve row hover treatment. Add visual framing around the data zone. Do not restructure the page layout or change the data table columns. Keep changes CSS/component-level only.
- **Dependencies:** None.
- **Definition of done:** Drivers page table has card containment, improved hover treatment, and visual framing. Consistent with planning grid and settings styling. `npm run verify` passes.
- **Source:** EX-REC-036.

### PB-128: DELETE routes — return 404 instead of 500 for missing records

- **ID:** PB-128
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** DELETE handlers in `drivers/[id]`, `planning/[id]`, and `scenarios/[id]` return 500 when the record doesn't exist (Prisma P2025 error). Users see a generic error instead of "niet gevonden".
- **Why this matters now:** Small improvement to error handling correctness. Low effort, low risk.
- **Scope notes:** Check for Prisma P2025 error code in catch blocks of the three DELETE routes. Return 404 with a Dutch "niet gevonden" message. Do not change other error handling.
- **Dependencies:** None.
- **Definition of done:** DELETE requests for non-existent records return 404 with Dutch message. `npm run verify` passes.
- **Source:** DE-REC-040.

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

### PB-126: Move ScenarioSelector out of "Weergave" toolbar zone

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Moved ScenarioSelector from the "Weergave" (view settings) control group into the "Periode" zone alongside date range and zoom controls. Scenario selection is a data/context control, not a view setting. Toolbar remains single-row with four zones.

### PB-127: Drivers page — visual quality lift

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31
- **Note:** Three improvements: (1) Replaced `border-b` row separators with tonal row alternation (`bg-surface-secondary` on odd rows, transparent on even) matching the planning grid pattern. (2) Upgraded row hover from `bg-surface-secondary` to `bg-brand-50` for clear row identification. (3) Integrated search bar into the card surface as a toolbar zone with result count, creating a composed data surface instead of a disconnected search + table layout. Pagination footer updated to `bg-surface-tertiary/50` for visual consistency.

### PB-123: Planning grid toolbar — composed control zones

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### PB-124: Planning grid matrix — tonal row separation instead of borders

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-31

### Delivery Agent bugfix: Row striping pattern at group boundaries

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Fixed row striping that reset at each group boundary when groupBy was active. Now uses continuous global index.

---

## Deferred

### EX-REC-047: Capacity page — visual identity lift

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and clean. Recommend after drivers page improvement (PB-127) is complete.
- **Source:** EX-REC-047.

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

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Superseded by PB-127
- **Reason:** Promoted to PB-127 with refined scope. This deferred entry is no longer needed separately.

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
