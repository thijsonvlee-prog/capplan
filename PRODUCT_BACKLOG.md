# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The codebase is in strong shape — 0 ESLint warnings, Map-based lookups consistent across the codebase, all API routes hardened with validation and Dutch error messages. Design alignment with DESIGN.md is high. The next cycle focuses on the last hot-path render optimization, planning grid toolbar polish, and a small design token compliance fix.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-066: PlanningGrid per-cell entry lookup optimization

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** `PlanningGrid.tsx:613` uses `driver.planningEntries.find((e) => e.date === date)` inside the per-cell render loop. With 50 drivers × 90 days = 4,500 `.find()` calls. This is the last hot-path `.find()` in the codebase.
- **Scope notes:** Pre-build a `Map<string, PlanningEntry>` keyed by date for each driver's entries (via `useMemo` or data transform), then use `.get(date)` in the render loop. Same proven pattern as PB-060/PB-065.
- **Dependencies:** None.
- **Definition of done:** Per-cell entry lookup uses Map-based O(1) lookup. No `.find()` remains in hot render paths. Passes `npm run verify`.
- **Implementation note:** Small change. Follow the established `buildLookupMaps` / `useMemo` pattern.
- **Why this matters now:** Last hot-path `.find()` in the codebase. Proven pattern, small effort, measurable render improvement.
- **Source:** DE-REC-034.

### PB-067: Planning grid toolbar second row — tighter grouping

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The planning grid's second toolbar row (search, grouping, column picker, totals toggle, status legend) has loosely arranged controls without clear visual grouping. The first toolbar row already uses `.control-group` — extending this pattern to the second row creates consistency.
- **Scope notes:** Wrap search + grouping in a `.control-group`. Wrap column picker + totals toggle in a separate `.control-group`. Give the status legend its own visual zone. Follow the pattern from the first toolbar row.
- **Dependencies:** None. Must follow PlanningGrid.tsx care rules from CLAUDE.md.
- **Definition of done:** Second toolbar row uses grouped controls matching the first row's pattern. Status legend has its own visual zone. Passes `npm run verify`. Visually consistent with first toolbar row.
- **Implementation note:** PlanningGrid.tsx is complex (~680 lines). Changes must be careful and targeted. Verify against typecheck, lint, and visual behavior.
- **Why this matters now:** Extends an existing good pattern to the core planning screen's second row. High-frequency screen.
- **Source:** EX-REC-037.

### PB-068: ScenarioSelector hardcoded Tailwind color fix

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Problem / opportunity:** `ScenarioSelector.tsx:73` uses `bg-amber-100 text-amber-700` for the "Concept" badge. This violates CLAUDE.md's rule against hardcoded Tailwind color classes.
- **Scope notes:** Replace with `bg-warning-50 text-warning-700` or appropriate design token equivalents. Single line change.
- **Dependencies:** None.
- **Definition of done:** No hardcoded Tailwind color classes in ScenarioSelector.tsx. Uses design tokens. Passes `npm run verify`.
- **Implementation note:** Tiny fix. Can be done alongside PB-067.
- **Why this matters now:** Quick CLAUDE.md compliance fix.
- **Source:** DE-REC-035.

---

## Planned (Future Cycles)

### PB-016: Connectivity hub — admin screen for import source configuration

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Planned (future cycle)
- **Problem / opportunity:** Second phase of connectivity hub MVP. Admin screen for CSV import source configuration with field mapping.
- **Dependencies:** PB-015 (completed).
- **Definition of done:** Working admin screen for managing CSV import sources with field mapping. Follows existing design token system and component patterns. Passes `npm run verify`.
- **Source:** ESC-001 decision (Option A), SMI-001.

---

## Blocked / Needs Decision

_No items currently blocked._

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-065: Replace DayCell leaveType .find() with Map-based lookup
- **Completed:** 2026-03-29
- **Owner:** Delivery Agent
- **Summary:** Replaced `leaveTypes.find()` in DayCell render path with `leaveTypeMap.get()` using a pre-built `Map<string, string>`. Completes the Map-based lookup pattern across the entire codebase.

### PB-062: Fix capacity page scenario toggle color semantics
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Changed active scenario toggle from undefined warning tokens to `brand-50`/`brand-700`.

### PB-063: Add Manrope typeface for display and headline levels
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Added Manrope via `next/font/google`. Applied to `.text-page-title` with weight 700 and tighter letter-spacing.

### PB-064: Strengthen header component composition
- **Completed:** 2026-03-29
- **Owner:** Experience Agent
- **Summary:** Removed `border-b` from header. Removed redundant "CapPlan" label. Tonal surface contrast for separation.

---

## Deferred

### PB-009: Add covering index for capacity aggregation query

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Current query performance is acceptable. Revisit when capacity endpoint shows measurable slowness.
- **Source:** DE-REC-005.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Includes API magic numbers (DE-REC-030) and chart colors (DE-REC-014). Schedule when capacity allows.
- **Source:** DE-REC-014, DE-REC-030.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** `cleanupOldEvents()` in `perf.ts` is defined but never called. Table grows unbounded, but traffic is low. Low urgency.
- **Source:** DE-REC-031.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** The drivers page is functional and the alternating backgrounds are a minor visual issue. Defer until higher-priority UX work is complete.
- **Source:** EX-REC-036.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk follow-up to PB-063 but needs visual evaluation before broad application. Defer until next UX cycle.
- **Source:** EX-REC-038.

### EX-REC-039: Header contextual enhancements

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Good idea but requires per-page context data plumbing. Defer until the current toolbar grouping work is done and the header base is stable.
- **Source:** EX-REC-039.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Stale or superseded items should be removed or deferred.
- Overlapping items should be merged.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
