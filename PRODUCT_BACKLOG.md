# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2/P3 work outstanding. The codebase is at 8.5/10 design alignment and all primary write paths use concurrent DB calls. This cycle completed PB-210 (Experience — SubTable Actief chip). PB-212 (Delivery — parallelize import-source logs) remains Ready. ESC-014 (desktop homescreen) remains Deferred and unmarked.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-212: Parallelize independent queries in import-source logs route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Source:** DE-REC-080
- **Problem / opportunity:** `src/app/api/import-sources/[id]/logs/route.ts` performs two sequential independent queries: a `findUnique` for source existence (line ~20) and a `findMany` for logs (line ~28). Both use the same `id` parameter and share no data dependency.
- **Why this matters now:** Same parallelization pattern applied across all other write paths (PB-205, PB-208, PB-209, PB-211). Keeps the codebase consistent. ADMIN-only endpoint, so user-visible impact is narrow.
- **Scope notes:** Wrap both queries in `Promise.all()`. Apply the 404 guard after resolution. Preserve existing error semantics and Dutch error messages. Single-file edit.
- **Dependencies:** None.
- **Definition of done:**
  - Both queries run concurrently via `Promise.all()`.
  - 404 guard still fires when source does not exist.
  - Same response shape and error messages.
  - `npm run verify` passes with 0 errors and 0 new warnings.
  - Release notes entry added to BOTH `src/domain/releases.ts` AND `RELEASE_NOTES.md` in the same commit.
- **Implementation note:** Follow the exact pattern used in PB-208/PB-211. Destructure both results, check source for null, then map logs.

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No items currently blocked. SMI-026 / ESC-014 remains Deferred — see Deferred section._

---

## Completed Recently

### PB-210: SubTable "Actief" marker — chip treatment

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-13
- **Summary:** Replaced the plain green "Actief" text in the Einddatum column of driver sub-tables with a compact success-tone chip (`rounded-full`, `bg-success-100`, `text-success-700`, uppercase, tight tracking). The active row is now signaled both by tonal row highlight and by a chip in the same row. Single JSX edit in `SubTable.tsx`, no layout or behavior change. Release notes synced in both `src/domain/releases.ts` and `RELEASE_NOTES.md`.

### PB-211: Parallelize FK checks inside `validateForeignKeys`

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-12
- **Summary:** Replaced the sequential `for ... await` loop in `validateForeignKeys` with `Promise.all(checks.map(...))`. All non-empty check specs now run their count queries concurrently. Error semantics preserved: declared-order spec wins via `.find()` on the results array. Same Dutch error messages. Closes the parallelization track started with PB-205/PB-208/PB-209.

---

## Deferred

### SMI-026: Desktop homescreen (Blocked → Deferred)

- **Owner:** Product Owner Agent (coordination)
- **Priority:** N/A (scope unresolved)
- **Status:** Deferred
- **Escalation:** ESC-014 (remains Open for future revisit)
- **Reason:** ESC-014 has been Open and unmarked for 11 consecutive cycles. The Scrum Master may reopen this at any time by placing `(X)` next to one of the four options in ESC-014, after which the Product Owner Agent will create concrete backlog items for the chosen scope.

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
- Backlog IDs are sequential and never reused. Next available: PB-213.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
