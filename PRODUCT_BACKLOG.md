# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2/P3 work outstanding. The codebase remains in a clean, consistent state. Last cycle shipped four P4 items (PB-206, PB-207, PB-208, PB-209). This cycle promotes two small close-out items: PB-210 (Experience — SubTable Actief-chip) as a natural follow-through on the PB-199/PB-207 sub-table and typography work, and PB-211 (Delivery — parallelize checks inside `validateForeignKeys`) as the internal close-out of the PB-208/PB-209 parallelization track. Both are trivial, low-risk, single-file edits. ESC-014 (desktop homescreen) remains unmarked and Deferred.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-210: SubTable "Actief" marker — chip treatment

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** EX-REC-063
- **Problem / opportunity:** `src/components/drivers/SubTable.tsx:93` renders the active-record indicator as plain `text-success-600 text-xs font-medium` text ("Actief") in the Einddatum column. After PB-199 (empty state + row alternation) and PB-207 (section-title hierarchy lift), this plain-text marker is the weakest visual element left in the driver form's sub-tables.
- **Why this matters now:** Visible in every driver edit flow across all three sub-tables (dienstverbanden, functies, roostertoewijzingen). Tiny change, immediate scan improvement, natural follow-through on the recently polished sub-tables.
- **Scope notes:** Wrap the "Actief" label in a compact success-tone chip — proposed classes: `inline-flex items-center px-1.5 py-0.5 rounded-full bg-success-100 text-success-700 text-[0.6875rem] font-medium uppercase tracking-wide`. Keep the existing `bg-success-50` row highlight unchanged. Single JSX edit in `SubTable.tsx`. No new tokens, no layout impact.
- **Dependencies:** None.
- **Definition of done:**
  - Compact "Actief" chip replaces the plain success-tone text in the Einddatum column.
  - No change to row highlight, column widths, or neighbouring cells.
  - `npm run verify` passes with 0 errors and 0 new warnings.
  - Visual check on all three driver sub-tables (employment, functions, roster assignments).
  - Release notes entry added to BOTH `src/domain/releases.ts` AND `RELEASE_NOTES.md` in the same commit.
- **Implementation note:** Look at existing chip patterns (planning grid `status-chip-compact`, count badges) for letter-spacing and padding reference. Do not introduce a new shared chip component — inline classes are correct for a single call site.

### PB-211: Parallelize FK checks inside `validateForeignKeys`

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** DE-REC-079
- **Problem / opportunity:** `validateForeignKeys` in `src/lib/api-route-utils.ts:438-449` iterates its `checks` array with a sequential `for ... await` loop. Callers that bundle multiple check specs in one call (e.g. after PB-209's batching work, and `drivers/[id]/route.ts` for skills) pay one serial round trip per spec. With the outer parallelization already done in PB-208/PB-209, the helper itself is the last sequential step left on the batched write path.
- **Why this matters now:** Natural close-out of the PB-208/PB-209 parallelization track. If the batched helper is going to be the standard, it should be internally parallel as well. Future callers can then bundle arbitrary check specs without paying a serial cost.
- **Scope notes:** Replace the `for` loop in `validateForeignKeys` with `Promise.all(checks.map(...))`. Preserve "first non-null wins" error semantics by running all count queries concurrently and returning the first non-null result via `.find()` on resolved results. Skip specs with `ids.length === 0` inside the mapped function (same as today). Keep the same Dutch error message template. Do not touch `validateOptionalForeignKey`.
- **Dependencies:** None.
- **Definition of done:**
  - `validateForeignKeys` runs all non-empty check specs concurrently.
  - Error message for invalid FK references is unchanged.
  - Error ordering: the declared-order spec wins (first non-null result in the original `checks` array order), matching today's behaviour for the multi-failure case.
  - All existing callers (drivers POST/PUT, sub-records, anywhere else) behave identically.
  - `npm run verify` passes with 0 errors and 0 new warnings.
  - Release notes entry added to BOTH `src/domain/releases.ts` AND `RELEASE_NOTES.md` in the same commit.
- **Implementation note:** Pattern: `const results = await Promise.all(checks.map(async (c) => { if (!c.ids.length) return null; const count = await c.model.count({ where: { id: { in: c.ids } } }); return count !== c.ids.length ? \`Eén of meer opgegeven ${c.label} bestaan niet\` : null; })); return results.find((r) => r !== null) ?? null;`. Preserves declared-order error selection because `results` keeps the input order.

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
- **Summary:** Wrapped the independent `validateOptionalForeignKey` calls for `scenarioId` and `leaveTypeId` in `Promise.all()` in both `POST /api/planning` and `POST /api/planning/bulk` handlers. Saves one DB round trip per planning entry creation on Neon serverless. No behavioural change; the error branches still run in declared order so the same error is returned when multiple FKs are invalid.

### PB-209: Batch FK validation in driver POST nested records

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-11
- **Summary:** `POST /api/drivers` now collects unique FK IDs per field (employerId, locationId, departmentId, rosterProfileId) via a shared `collectUnique()` helper and runs a single `validateForeignKeys()` check per FK-typed field instead of one `validateOptionalForeignKey()` per nested record. A driver with 10 function records now issues at most 1 location + 1 department count query instead of 20. Labels were updated to plural forms (werkgevers, locaties, afdelingen, roosterprofielen) to fit the batched `validateForeignKeys` error template. The unused `validateOptionalForeignKey` import was removed from the route.

### PB-206: Capacity chart — custom tooltip and axis styling

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-11
- **Summary:** Replaced the default Recharts tooltip, axis, and grid styling on `CapacityChart.tsx` with a design-system-aligned rendering. Custom `CapacityChartTooltip` on `surface-primary` with `shadow-dropdown`, `border-border-subtle`, `text-caption` uppercase date label, and per-series colored-dot + name + right-aligned `tabular-nums` value rows. Custom `CapacityChartLegend` with tonal swatches replaces the stock Recharts legend. Axes use `#9ca3af` (`--color-text-tertiary`) tick fill, Y-axis line hidden, X-axis baseline soft, horizontal-only grid with `"2 4"` dash pattern in `#e2e5eb` (`--color-border-default`). Cursor hover dissolves into the grid at 25% opacity. All hex strings carry inline design-token comments per the CLAUDE.md Recharts exception rule.

### PB-207: Extend Manrope to section titles and modal headers

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-11
- **Summary:** Added `font-family: var(--font-display)` to both `.text-section-title` and `.settings-section-title` in `globals.css`. Aligned both classes at `0.9375rem / 600 / letter-spacing -0.01em` so modal headers (ConfirmDialog, ScenarioSelector, RosterAssigner, PlanningGrid bulk modal) and section titles on settings, capacity, drivers and planning screens now share a single Manrope-based section-title rhythm. Strengthens the three-step hierarchy (page title → section title → label) per DESIGN.md §5.2.

---

## Deferred

### SMI-026: Desktop homescreen (Blocked → Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 10 consecutive cycles. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

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
- Backlog IDs are sequential and never reused. Next available: PB-212.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
