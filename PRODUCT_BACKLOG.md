# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** No P1/P2 debt. PB-196 and PB-197 were completed this cycle — the two paired validation-consolidation refactors now use shared helpers in `api-route-utils.ts`, eliminating ~34 duplicated validation blocks and closing the last two open length-cap gaps (scenario duplicate + preferences PUT). Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready. The Delivery Agent's fresh scan did not surface new P1/P2/P3 work after completing PB-196/PB-197 — see `RECOMMENDATIONS_DELIVERY.md` for P4-level carry-overs._

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
