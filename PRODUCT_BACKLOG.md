# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2/P3 work outstanding. The validation-consolidation track (PB-196, PB-197) and the header duplicate-title fix (EX-REC-057) all shipped on 2026-04-08. With the Ready queue empty and both specialist agents returning small P4-Low polish items from their fresh scans, this cycle promotes four well-scoped P4 items — two UX cleanups (StatusSelector color semantics, SubTable empty state + row alternation) and two Delivery consolidations (enum/constants extraction, sub-record ownership helper). ESC-014 (desktop homescreen) remains unmarked after 7 cycles; per the warning in the last cycle PO note, SMI-026 is now downgraded to Deferred until the Scrum Master revisits it.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-198: StatusSelector "Bevestigen" button — drop danger color override

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** EX-REC-059
- **Problem:** `src/components/planning/StatusSelector.tsx:141` renders the sick-percentage confirm button as `className="btn-primary w-full justify-center bg-danger-500 hover:bg-danger-600"`. The `bg-danger-*` override produces a red CTA on a non-destructive confirm action, violating DESIGN.md §4.2 (danger red is reserved for destructive/error states). It also weakens the semantic color system by visually competing with real delete affordances elsewhere.
- **Why this matters now:** One-line fix surfaced during the fresh UX scan. Low risk, removes a bad pattern precedent before it can spread.
- **Scope notes:** Remove the two `bg-danger-*` classes only. Do not touch button copy, layout, or the sick-percentage input. The SICK context is already conveyed by the modal title and the sick-percentage field above the button.
- **Dependencies:** None.
- **Definition of done:**
  - `StatusSelector.tsx:141` button is `className="btn-primary w-full justify-center"` (no danger override).
  - Visual check: confirm button renders in brand color, not red.
  - `npm run verify` passes.
  - Release note entry added in `src/domain/releases.ts` AND `RELEASE_NOTES.md` (per CLAUDE.md §11).

### PB-199: SubTable — actionable empty state and clean row alternation

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** EX-REC-060
- **Problem:** `src/components/drivers/SubTable.tsx` has two quality gaps:
  1. Default `emptyMessage = "Geen records"` (line 29) violates CLAUDE.md §6 — it uses the banned word "records" and provides no next-step guidance. Call sites (employment, functions, roster-assignment) pass Dutch entity labels but still lack a next-step hint.
  2. Row alternation uses `bg-surface-secondary/50` (line 86), producing a muddy tonal value instead of the clean surface layering used in StamtabelManager and SkillManager.
- **Why this matters now:** Visible in every driver edit flow. Tiny, safe cleanup that closes the last empty-state gap against CLAUDE.md §6.
- **Scope notes:**
  - Change the default `emptyMessage` to an actionable Dutch fallback (e.g. `"Nog geen gegevens. Gebruik 'Toevoegen' om iets vast te leggen."`).
  - Update the three caller sites in `DriverForm.tsx` (dienstverbanden, functies, roostertoewijzingen) to pass next-step hints in the same sentence pattern (e.g. `"Nog geen dienstverbanden voor deze chauffeur. Gebruik 'Toevoegen' om een dienstverband vast te leggen."`).
  - Replace `bg-surface-secondary/50` with solid `bg-surface-secondary` for odd rows. Do not touch the `bg-success-50` "Actief" row highlight.
- **Dependencies:** None.
- **Definition of done:**
  - `SubTable.tsx` default empty message no longer contains the word "records" and suggests the next step.
  - All three SubTable call sites in `DriverForm.tsx` pass entity-specific empty messages with a next-step hint.
  - Row alternation uses a solid surface token; no `/50` opacity modifier.
  - `npm run verify` passes.
  - Release note entry added to `src/domain/releases.ts` AND `RELEASE_NOTES.md`.

### PB-200: Centralize enum validation arrays and `MAX_NOTES_LENGTH`

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** DE-REC-075 + DE-REC-077 (merged — same validation-consolidation theme, same target files, single commit is cleaner)
- **Problem:**
  1. `const VALID_STATUSES = Object.values(PlanningStatus)` is duplicated in `src/app/api/planning/route.ts:9` and `src/app/api/planning/bulk/route.ts:9`.
  2. `const validEmploymentTypes = Object.values(EmploymentType)` is duplicated in `src/app/api/drivers/[id]/employment/route.ts:53` and `src/app/api/drivers/[id]/employment/[recordId]/route.ts:28`.
  3. `MAX_NOTES_LENGTH = 500` is defined identically in `src/app/api/planning/route.ts:7` and `src/app/api/planning/bulk/route.ts:7`.
- **Why this matters now:** Natural follow-through on the PB-196/PB-197 consolidation theme while the surface is still fresh. Same phrasing, same locations.
- **Scope notes:**
  - Add exported constants in `src/lib/api-route-utils.ts` (or `src/domain/constants.ts` — choose whichever keeps callers cleanest): `VALID_PLANNING_STATUSES`, `VALID_EMPLOYMENT_TYPES`, and `MAX_NOTES_LENGTH`.
  - Replace all 4 inline enum-array definitions and both `MAX_NOTES_LENGTH` definitions with the shared imports.
  - Do NOT introduce a generic `validateEnumValue` helper this cycle — keep the existing inline check pattern. Adding the helper would be a separate, larger consolidation.
  - Pure refactor: no behavior change, same error phrasing, same status codes.
- **Dependencies:** None.
- **Definition of done:**
  - No duplicate `Object.values(PlanningStatus)` or `Object.values(EmploymentType)` in API routes.
  - No duplicate `MAX_NOTES_LENGTH` literal in API routes.
  - All affected routes still return identical 400 messages for the existing invalid-input cases.
  - `npm run verify` passes.
  - Release note entry (single Onderhoud bullet) added to `src/domain/releases.ts` AND `RELEASE_NOTES.md`.

### PB-201: `verifyRecordOwnership` helper for driver sub-record PUT/DELETE

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** DE-REC-076
- **Problem:** All three driver sub-record `[recordId]/route.ts` files (employment, functions, roster-assignments) contain the same `findFirst({ where: { id: recordId, driverId: id } })` ownership check twice each — once inside the PUT transaction, once before the DELETE. Six copies total. Any future tightening of authorization on sub-records would require six edits.
- **Why this matters now:** The only consolidation opportunity from the fresh scan that touches authorization-adjacent code. Small, same spirit as PB-196/197.
- **Scope notes:**
  - Add a helper in `src/lib/api-route-utils.ts`. Recommended shape: `verifyRecordOwnership(model, recordId, driverId): Promise<boolean>` returning whether the row exists and is owned by that driver. Keep it read-only.
  - Replace all 6 inline blocks in `employment/[recordId]/route.ts`, `functions/[recordId]/route.ts`, and `roster-assignments/[recordId]/route.ts`.
  - The helper may be called either inside or outside the PUT `$transaction` — keep the existing placement so the transactional shape is unchanged. Only the inline duplication goes away.
  - Preserve the existing 404 Dutch error messages verbatim.
  - Pure refactor: no behavior change.
- **Dependencies:** None. Independent of PB-200; they touch different files and can ship in parallel.
- **Definition of done:**
  - Helper defined once in `api-route-utils.ts`.
  - All 6 inline ownership-check blocks replaced.
  - Same 404 responses for non-owned records.
  - `npm run verify` passes.
  - Release note entry (single Onderhoud bullet) added to `src/domain/releases.ts` AND `RELEASE_NOTES.md`.

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No items currently blocked. SMI-026 / ESC-014 was downgraded to Deferred this cycle after 7 cycles without a Scrum Master decision — see Deferred section._

---

## Completed Recently

### PB-196: `validateMaxLength` helper — eliminate duplicated length checks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-08
- **Summary:** Added `validateMaxLength(value, maxLength, label)` and `validateMaxLengths(checks)` helpers in `src/lib/api-route-utils.ts`. Replaced ~28 inline length checks across drivers, scenarios, import-sources, user-groups, roster-profiles, settings (stamtabel + skills), driver sub-records (employment, functions, roster-assignments) and planning notes (POST + bulk). Same Dutch error phrasing and 400 status codes preserved. Scenario duplicate POST now enforces the 200-char name cap (DE-REC-073) and preferences PUT now enforces a 500-char value cap (DE-REC-058). `npm run verify` passes.

### PB-197: `validateDateRange` helper — consolidate start/end date checks

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-08
- **Summary:** Added `validateDateRange(startDate, endDate)` helper in `src/lib/api-route-utils.ts` using lexicographic comparison on the already-validated `YYYY-MM-DD` strings. Replaced 6 inline checks in employment POST/PUT, function POST/PUT, and roster-assignment POST/PUT routes. Same Dutch error message preserved; no behavior change. `npm run verify` passes.

### EX-REC-057: Duplicate page title on desktop — removed

- **Status:** Completed (direct Experience Agent fix, no PB number)
- **Owner:** Experience Agent
- **Completed:** 2026-04-08
- **Summary:** `Header.tsx` rendered `<h1 class="text-page-title">` for every route in `PAGE_TITLES` while Capaciteit, Chauffeurs, and Instellingen ALSO render their own composed page-header with the same Manrope title — producing two identical titles on desktop. Added a `DESKTOP_PAGES_WITH_OWN_TITLE` exception set so the header bar suppresses its title only on those three routes, only on desktop. Mobile behaviour and the title display on Planning/Releasenotes are unchanged. Moves header structure toward DESIGN.md §2.5 (one clear title anchor per composed screen). `npm run verify` passes.

---

## Deferred

### SMI-026: Desktop homescreen (was Blocked, now Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 7 consecutive cycles. Per the previous cycle's PO note warning, the active blocker is now removed from scope tracking. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

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
- **Reason:** Most visible remaining desktop integration gap. Low risk but no user demand driving it.

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

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor optimization. Low urgency.

### DE-REC-063: weeklyHours range validation on roster assignment routes

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Trivial validation gap on a single numeric field. Near-zero risk.

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
- **Reason:** Broader initiative. PB-200 takes the first increment (`MAX_NOTES_LENGTH`). Revisit if more duplicated limits surface.

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
- Backlog IDs are sequential and never reused. Next available: PB-202.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
