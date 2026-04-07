# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** PB-195 shipped — release notes now have a typed single source of truth (`src/domain/releases.ts`), eliminating drift structurally. No critical or high-priority debt. Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No Ready items. PB-195 completed this cycle._

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

### PB-192: Valideer sickPercentage type in bulk planning endpoint

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-06
- **Summary:** `typeof sickPercentage !== "number"` check toegevoegd in `POST /api/planning/bulk` vóór bereichsvalidatie. Non-numerieke waarden retourneren nu 400 met Nederlandse foutmelding in plaats van een onduidelijke 500.

### PB-193: Valideer scenario-bestaan bij actief scenario instellen

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-06
- **Summary:** `PUT /api/scenarios/active` controleert nu via `prisma.scenario.findUnique()` of het opgegeven scenario bestaat. Niet-bestaand ID retourneert 404 met Nederlandse foutmelding; `"default"` blijft toegestaan zonder check. Consistent met PB-187 patroon.

### PB-195: Releasenotes single source-of-truth module

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-07
- **Summary:** Releasedata verplaatst naar `src/domain/releases.ts` als typed single source-of-truth. `documentatie/page.tsx` importeert nu `RELEASES` uit de module; de hardcoded array is verwijderd. `RELEASE_NOTES.md` blijft een menselijk leesbare mirror. CLAUDE.md sync-regel bijgewerkt om naar de module als bron te verwijzen. `npm run verify` slaagt; releasenotes-pagina toont alle bestaande entries ongewijzigd.

### PB-194: Releasenotes sync-proces vastleggen

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-06
- **Summary:** Verplichte sync-regel toegevoegd aan `CLAUDE.md` sectie 11: elke agent die `RELEASE_NOTES.md` aanvult moet in dezelfde commit ook het `RELEASES` array in `src/app/(dashboard)/documentatie/page.tsx` bijwerken. Bestaande drift voor 5 april 2026 hersteld in dezelfde cyclus.

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

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

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
- Backlog IDs are sequential and never reused. Next available: PB-196.

- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
