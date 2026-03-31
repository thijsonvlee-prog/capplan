# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** User groups (SMI-015) fully shipped. Authorization model complete across all endpoints. No active security or performance gaps. Next focus: planning grid visual quality — the core product surface — bringing it up to the design standard already achieved on settings, sidebar, and login screens.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-123: Planning grid toolbar — composed control zones

- **ID:** PB-123
- **Title:** Planning grid toolbar — composed control zones
- **Problem / opportunity:** The planning grid toolbar is two rows of loosely arranged controls. Per DESIGN.md section 7.2, controls should be grouped by meaning with visible containment. The planning screen is the core product surface and the toolbar is the first thing users interact with.
- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** The planning screen is the core product surface (DESIGN.md section 2.2). Settings and sidebar are already product-grade; the planning toolbar is the most visible gap.
- **Scope notes:** Restructure the toolbar into contained zones: Period (date range + zoom), View (density + columns + scenario), Filter (search + grouping), Status legend. Use surface containers or whitespace for zone boundaries. Consider collapsing status legend into a popover. Must coordinate with PB-124 for a cohesive visual pass.
- **Dependencies:** Should be implemented together with PB-124 as a single coordinated visual pass on PlanningGrid.tsx.
- **Definition of done:** Toolbar has visually distinct control zones. Passes typecheck and lint. No regression in toolbar functionality (date range, zoom, density, search, scenario selector all work).
- **Implementation note:** PlanningGrid.tsx is ~800 lines. Handle with extreme care per CLAUDE.md. Run `npm run verify` after changes.
- **Source:** EX-REC-045.

### PB-124: Planning grid matrix — tonal row separation instead of borders

- **ID:** PB-124
- **Title:** Planning grid matrix — tonal row separation instead of borders
- **Problem / opportunity:** The planning grid uses 1px borders for row separation. DESIGN.md section 4.1 explicitly prohibits this as the default separation method. Recommends surface contrast, spacing, and tonal transitions instead.
- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** The border-heavy grid is the most visible deviation from DESIGN.md across the entire app. Core product surface.
- **Scope notes:** Replace row borders with alternating tonal backgrounds. Use stronger surface contrast for header and totals rows. Must be tested carefully with 100+ rows to avoid reducing scanability in dense views.
- **Dependencies:** Should be implemented together with PB-123 as a single coordinated visual pass on PlanningGrid.tsx.
- **Definition of done:** Grid rows use tonal separation instead of 1px borders. Header/totals rows have stronger surface contrast. Passes typecheck and lint. Scanability verified in dense view (100+ rows).
- **Implementation note:** PlanningGrid.tsx is ~800 lines. Alternating row pattern partially in place. Handle with extreme care.
- **Source:** EX-REC-046.

---

## Blocked / Needs Decision

_No blocked items._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-121: User group enforcement — individual-access routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-122: Capacity endpoint — relation-based user group filtering

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-111: User groups — enforcement on data routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

### PB-110: User groups — admin UI in settings

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-03-30

### PB-109: User groups — data model + API routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-30

---

## Deferred

### EX-REC-047: Capacity page — visual identity lift

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and clean. Recommend after planning grid improvements (PB-123, PB-124) are complete.
- **Source:** EX-REC-047.

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
- **Reason:** Depends on whether the POC capacity summary is promoted or removed.
- **Source:** DE-REC-036.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Functional and usable. Lower priority than planning grid improvements.
- **Source:** EX-REC-036.

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
