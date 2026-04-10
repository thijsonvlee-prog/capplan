# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2/P3 work outstanding. The validation-consolidation track is fully complete (PB-196 through PB-201). Both specialist agents returned small P4 items from their fresh scans. This cycle promotes four well-scoped P4 items: DayCell accessibility improvements and DriverForm tab bar consistency (Experience), plus weeklyHours range validation and sub-record transaction parallelization (Delivery). ESC-014 (desktop homescreen) remains unmarked and deferred.

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

### PB-202: DayCell accessibility — aria-labels and tooltip coverage

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-10
- **Summary:** Added `driverName` prop to DayCell and `aria-label` combining driver name, date, and status label to every day cell button. Extended the `title` tooltip builder to cover all 5 planning statuses (previously only BASE_ROSTER, LEAVE, SICK had tooltips). Imported `STATUS_LABELS` from constants for the fallback path.

### PB-203: DriverForm tab bar — adopt shared settings-tabs system

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-10
- **Summary:** Renamed `.settings-tabs` / `.settings-tab` / `.settings-tab-badge` CSS classes to generic `.tab-bar` / `.tab-item` / `.tab-item-badge` in `globals.css`. Updated settings page and DriverForm to use the shared system. DriverForm active tab color now matches settings (brand-700 instead of brand-600). Eliminated ~15 lines of inline Tailwind styling. Updated CLAUDE.md component CSS class reference.

### PB-198: StatusSelector "Bevestigen" button — drop danger color override

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-09
- **Summary:** Removed `bg-danger-500 hover:bg-danger-600` override from the sick-percentage confirm button. Button now renders as standard `btn-primary` in brand color.

### PB-199: SubTable — actionable empty state and clean row alternation

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-09
- **Summary:** Updated SubTable default empty message to actionable Dutch text. Updated all three DriverForm caller sites with entity-specific messages. Replaced opacity-based row alternation with solid `bg-surface-secondary`.

### PB-200: Centralize enum validation arrays and `MAX_NOTES_LENGTH`

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-09
- **Summary:** Added `VALID_PLANNING_STATUSES`, `VALID_EMPLOYMENT_TYPES`, and `MAX_NOTES_LENGTH` as shared constants in `api-route-utils.ts`. Replaced 4 inline enum-array definitions and 2 inline `MAX_NOTES_LENGTH` definitions.

### PB-201: `verifyRecordOwnership` helper for driver sub-record PUT/DELETE

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-09
- **Summary:** Added `verifyRecordOwnership(model, recordId, driverId)` helper in `api-route-utils.ts`. Replaced all 6 inline ownership-check blocks in employment, functions, and roster-assignments routes.

---

## Deferred

### SMI-026: Desktop homescreen (was Blocked, now Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 8 consecutive cycles. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

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

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Most visible remaining desktop integration gap on the capacity page. Low risk but no user demand driving it.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Only relevant if narrow desktop viewport usage is reported.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

### DE-REC-074: Batch FK validation in driver POST nested records

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Cleaner code and fewer DB round trips on driver bulk creation, but `Promise.all()` already parallelizes the per-record FK calls. No user-visible impact at current volumes.

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
- Backlog IDs are sequential and never reused. Next available: PB-206.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
