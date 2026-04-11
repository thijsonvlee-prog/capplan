# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2/P3 work outstanding. The codebase is in a clean, consistent state. All four P4 items promoted for this cycle have shipped: PB-206 (capacity chart design integration) and PB-207 (Manrope typographic extension) from Experience, PB-208 (planning route FK parallelization) and PB-209 (driver POST batch FK validation) from Delivery. No items currently Ready. ESC-014 (desktop homescreen) remains unmarked and deferred.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently Ready. The four P4 items from the previous cycle (PB-206, PB-207, PB-208, PB-209) have all shipped. Awaiting new recommendations from `RECOMMENDATIONS_EXPERIENCE.md` and `RECOMMENDATIONS_DELIVERY.md`._

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No items currently blocked. SMI-026 / ESC-014 remains Deferred — see Deferred section._

---

## Completed Recently

### PB-208: Parallelize independent FK validations in planning POST/bulk routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-11
- **Summary:** Wrapped the independent `validateOptionalForeignKey` calls for `scenarioId` and `leaveTypeId` in `Promise.all()` in both `POST /api/planning` and `POST /api/planning/bulk` handlers. Saves one DB round trip per planning entry creation on Neon serverless. No behavioral change; the error branches still run in declared order so the same error is returned when multiple FKs are invalid.

### PB-209: Batch FK validation in driver POST nested records

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-11
- **Summary:** `POST /api/drivers` now collects unique FK IDs per field (employerId, locationId, departmentId, rosterProfileId) via a shared `collectUnique()` helper and runs a single `validateForeignKeys()` check per FK-typed field instead of one `validateOptionalForeignKey()` per nested record. A driver with 10 function records now issues at most 1 location + 1 department count query instead of 20. Labels were updated to plural forms (werkgevers, locaties, afdelingen, roosterprofielen) to fit the batched `validateForeignKeys` error template. The unused `validateOptionalForeignKey` import was removed from the route.

### PB-206: Capacity chart — custom tooltip and axis styling

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-11
- **Summary:** Replaced the default Recharts tooltip, axis, and grid styling on `CapacityChart.tsx` with a design-system-aligned rendering. A custom `CapacityChartTooltip` renders on `surface-primary` with `shadow-dropdown`, `border-border-subtle`, and a `text-caption` uppercase date label. Each series row combines a colored dot, the series name in `text-text-secondary`, and a right-aligned tabular-nums value in `text-text-primary font-semibold`. A custom `CapacityChartLegend` replaces the stock Recharts legend with a token-colored row of small swatches and `text-text-secondary` labels. Axes use `#9ca3af` tick fill (documented as `--color-text-tertiary`), `#e2e5eb` grid and axis line (documented as `--color-border-default`), the Y-axis line is hidden, the X-axis baseline is soft, and the grid is horizontal-only with a `"2 4"` dash pattern. Tooltip hover cursor uses the same token color at 25% fill so it blends with the grid. All hex strings carry inline design-token comments per the CLAUDE.md Recharts exception rule. `npm run verify` passes.

### PB-207: Extend Manrope to section titles and modal headers

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-11
- **Summary:** Added `font-family: var(--font-display)` to both `.text-section-title` and `.settings-section-title` in `globals.css`. Aligned both classes at `0.9375rem / 600 / letter-spacing -0.01em` so modal headers (ConfirmDialog, ScenarioSelector, RosterAssigner, PlanningGrid bulk modal) and section titles on settings, capacity, drivers, and planning screens now share a single Manrope-based section-title rhythm. Previously `.text-section-title` was `0.8125rem / 600` with no Manrope — a weak mid-tier between the `.text-page-title` Manrope heading and `.text-label` Inter metadata. The new tier strengthens the three-step hierarchy (page title → section title → label) per DESIGN.md §5.2. `npm run verify` passes.

### PB-204: Validate `weeklyHours` range (0-168) on roster assignment POST/PUT

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-10
- **Summary:** Added bounds validation (`0 ≤ weeklyHours ≤ 168`) to both POST and PUT handlers in roster-assignment routes. Invalid values return a 400 response with Dutch error message "Wekelijkse uren moet tussen 0 en 168 liggen". Last un-validated numeric field in sub-record routes.

### PB-205: Parallelize `autoCloseOpenRecords` + `getNextSequenceNumber` in sub-record transactions

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-10
- **Summary:** Wrapped the two independent sequential reads in `Promise.all()` inside `$transaction` blocks in all three sub-record POST handlers (employment, functions, roster-assignments). Same transactional behavior; saves one DB round trip (~50-100ms) per sub-record creation.

---

## Deferred

### SMI-026: Desktop homescreen (was Blocked, now Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 9 consecutive cycles. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

### EX-REC-055: RosterProfileEditor — tonal layering and weekend differentiation

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-traffic screen. All other settings sections are at design system standard. Pick up when capacity allows.

### EX-REC-052: Mobile planning — edit capability (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first.

### EX-REC-053: Mobile homescreen — greeting and scenario context

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-effort personalization enhancement. Can be combined with any future mobile work cycle.

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
- **Reason:** Quick optimization but not user-facing.

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
- Backlog IDs are sequential and never reused. Next available: PB-210.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
