# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Desktop homescreen (SMI-026) is escalated as ESC-014, awaiting Scrum Master scope decision. PB-182 (CapacityTable tonal layering) completed 2026-04-03. One P4 Low item (PB-183, date parsing deduplication) is ready for the next cycle. No critical or high-priority work pending.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-183: Dedupliceer date-parsing logica in planning API routes

- **ID:** PB-183
- **Title:** Dedupliceer date-parsing logica in planning API routes
- **Problem / opportunity:** Drie planning API-routes bevatten identieke date-parsing en validatielogica: `dates.split(",").map(d => d.trim()).filter(Boolean)` met dezelfde Nederlandse foutmelding. Bij een wijziging moeten drie bestanden worden aangepast.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Snelle deduplicatie die het patroon van PB-163/PB-164 volgt. Kleine verbetering van de codekwaliteit.
- **Scope notes:** Extraheer een `parseDateList(dates: string)` utility-functie naar `api-route-utils.ts`. Elimineer ~15 regels duplicatie.
- **Dependencies:** Geen.
- **Definition of done:** Eén gedeelde `parseDateList` functie in `api-route-utils.ts`. Alle drie routes importeren en gebruiken deze. Verify slaagt.
- **Implementation note:** Volg het patroon van `resolveUserId` en `validateApiFields` extractie.
- **Source:** DE-REC-071

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

### Desktop homescreen (SMI-026)

- **Status:** Blocked — awaiting Scrum Master scope decision
- **Escalation:** ESC-014
- **Summary:** Scrum Master wil een desktop startscherm. Scope en aanpak moeten gekozen worden voordat dit gepland kan worden. Zie ESC-014 voor de opties.

---

## Completed Recently

### PB-182: CapacityTable — tonale lagen refactor

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-03
- **Summary:** Replaced 1px row borders and alternating row tints with tonal surface layering. Header and summary rows use surface-tertiary/surface-inset. Data rows use surface-primary with hover transition. Moved summary rows to semantic `<tfoot>`. All borders removed in favor of tonal contrast. Verify passes.

### PB-176: Verplaats COMPARE_COLORS naar module scope en constants

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-02
- **Summary:** Moved `COMPARE_COLORS` to `src/domain/constants.ts`. Hex values documented with design token equivalents.

### PB-177: Verwijder ongebruikte type-exports uit domain/types.ts

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-02
- **Summary:** Removed `PlanningEntryOptions` and `UserContext` — neither was imported anywhere.

### PB-178: Opruimen ongebruikte mobiele CSS-klassen

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-02
- **Summary:** Removed dead `.mobile-nav-overlay`, `.mobile-nav-panel` and related keyframes from `globals.css`.

### PB-180: StamtabelManager en SkillManager — visuele verhoging lijstitems

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-02
- **Summary:** Hover elevation, rounded rows, smooth transitions, and distinct editing state with brand accent.

### PB-181: Capaciteitspagina — vergelijkingsknoppen visuele verbetering

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-02
- **Summary:** Comparison buttons restyled as pill badges with clear active/inactive states.

---

## Deferred

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
- Backlog IDs are sequential and never reused. Next available: PB-184.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
