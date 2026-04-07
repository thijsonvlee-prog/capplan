# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2 debt. This cycle promotes two paired P3 validation-consolidation items (PB-196, PB-197) surfaced by the Delivery Agent's fresh codebase scan — both are pure refactors that eliminate ~33 duplicated validation blocks and unblock cleaner future write routes. Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-196: `validateMaxLength` helper — eliminate ~27 duplicated length checks

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Source:** DE-REC-071 (also closes DE-REC-058 and DE-REC-073 as natural side-effects)
- **Problem:** ~27 API write routes contain the same inline pattern: `if (typeof field === "string" && field.length > N) return NextResponse.json({ error: "<Label> mag maximaal N tekens bevatten" }, { status: 400 });`. Spread across drivers, scenarios, import-sources, user-groups, roster-profiles, settings (skills, stamtabel) and driver sub-records. Labels and limits drift if the pattern is reused without discipline. Scenario duplicate POST and preferences PUT also lack the cap entirely (DE-REC-073, DE-REC-058).
- **Why this matters now:** Highest-value duplication currently visible. Aligns with the CLAUDE.md rule "Do not duplicate logic that already exists there." Adding new write routes compounds the debt.
- **Scope notes:**
  - Add `validateMaxLength(value, maxLength, label)` helper in `src/lib/api-route-utils.ts`. Returns `null` on valid (or non-string skip) or a Dutch message `"<Label> mag maximaal N tekens bevatten"`.
  - Optionally expose a `validateMaxLengths(checks)` that returns the first error for multi-field routes.
  - Replace all ~27 instances with helper calls. Preserve exact Dutch error strings and 400 status codes.
  - Apply the helper to `POST /api/scenarios/[id]/duplicate` (currently missing the cap — DE-REC-073).
  - Apply the helper to `PUT /api/preferences` with a 500-char cap on `value` (DE-REC-058).
- **Dependencies:** None.
- **Definition of done:**
  - Helper exists in `api-route-utils.ts` with TypeScript types.
  - All ~27 inline length checks replaced.
  - Scenario duplicate route enforces 200-char name cap.
  - Preferences PUT enforces 500-char value cap.
  - `npm run verify` passes.
  - No behavior change for valid inputs; same error messages and status codes for invalid ones.
- **Implementation note:** Pure refactor. Use a single commit. Spot-check at least 3 routes after the replace to confirm message phrasing is preserved.

### PB-197: `validateDateRange` helper — consolidate 6 duplicated start/end date checks

- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Source:** DE-REC-072
- **Problem:** Employment, function, and roster-assignment routes (POST on `/route.ts` and PUT on `/[recordId]/route.ts`) contain the same block 6 times: `if (endDate && startDate && new Date(endDate) < new Date(startDate)) return ... "Einddatum mag niet voor de startdatum liggen"`.
- **Why this matters now:** Pairs cleanly with PB-196 as a single validation-consolidation cycle. After PB-186 the date format is guaranteed before this check, so a lexicographic comparison on the already-validated `YYYY-MM-DD` strings is safe and cheaper.
- **Scope notes:**
  - Add `validateDateRange(startDate, endDate)` in `src/lib/api-route-utils.ts`. Returns `null` or the Dutch message.
  - Use lexicographic compare on the ISO strings (no `new Date()` allocation).
  - Replace 6 occurrences in: employment POST/PUT, function POST/PUT, roster-assignment POST/PUT.
- **Dependencies:** None. Can ship together with PB-196 or separately.
- **Definition of done:**
  - Helper exists with TypeScript types.
  - All 6 inline date-range checks replaced.
  - `npm run verify` passes.
  - Behavior unchanged for any valid or invalid input.
- **Implementation note:** Trivial refactor. Verify the existing test path (date format validated first) still holds at every call site.

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

### Desktop homescreen (SMI-026)

- **Status:** Blocked — awaiting Scrum Master scope decision
- **Escalation:** ESC-014
- **Summary:** Scrum Master wil een desktop startscherm. Scope en aanpak moeten gekozen worden voordat dit gepland kan worden. Zie ESC-014 voor de opties (A operationeel dashboard, B kaartoverzicht, C kaarten + lichte KPI's, D niet doen). Aanbeveling: Option C.

---

## Completed Recently

### PB-195: Releasenotes single source-of-truth module

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-07
- **Summary:** Releasedata verplaatst naar `src/domain/releases.ts` als typed single source-of-truth. `documentatie/page.tsx` importeert nu `RELEASES` uit de module; de hardcoded array is verwijderd. `RELEASE_NOTES.md` blijft een menselijk leesbare mirror. CLAUDE.md sync-regel bijgewerkt om naar de module als bron te verwijzen. `npm run verify` slaagt; releasenotes-pagina toont alle bestaande entries ongewijzigd.

---

## Deferred

### EX-REC-055: RosterProfileEditor — tonale lagen en weekendonderscheid

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-traffic screen. All other settings sections are at design system standard. Pick up when capacity allows.

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first.

### EX-REC-053: Mobiel startscherm — begroeting en scenario-context

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

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

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

### PB-061: Add PerformanceEvent table cleanup mechanism

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
- Backlog IDs are sequential and never reused. Next available: PB-198.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
