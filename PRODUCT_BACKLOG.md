# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Auth enforcement is 100% complete across all API routes. Two new P3 validation improvements promoted from Delivery Agent recommendations (DE-REC-079, DE-REC-080). Release notes sync process promoted from Experience Agent (EX-REC-056). Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-192: Valideer sickPercentage type in bulk planning endpoint

- **ID:** PB-192
- **Title:** Valideer sickPercentage type in bulk planning endpoint
- **Problem / opportunity:** `POST /api/planning/bulk` controleert het bereik van sickPercentage maar niet het type. Een string-waarde passeert de bereichscontrole (NaN faalt beide vergelijkingen) en bereikt Prisma, wat een onduidelijke 500-fout oplevert in plaats van een duidelijke 400.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Completeert de validatiedekking op het enige numerieke veld zonder typecontrole. Triviale fix.
- **Scope notes:** Voeg `typeof sickPercentage !== "number"` check toe vóór de bereichsvalidatie in `src/app/api/planning/bulk/route.ts`.
- **Dependencies:** None
- **Definition of done:** Typecontrole toegevoegd, ongeldige types retourneren 400 met Nederlandse foutmelding, `npm run verify` slaagt.
- **Implementation note:** Eén extra conditie in bestaande validatieblok. Bron: DE-REC-079.

### PB-193: Valideer scenario-bestaan bij actief scenario instellen

- **ID:** PB-193
- **Title:** Valideer scenario-bestaan bij actief scenario instellen
- **Problem / opportunity:** `PUT /api/scenarios/active` slaat een willekeurig `activeId` op als voorkeur zonder te controleren of het scenario bestaat. Een niet-bestaand scenario-ID leidt tot een leeg planningsrooster zonder duidelijke foutmelding.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Natuurlijke opvolging van PB-187 (scenario-ID validatie op planning routes). Zelfde patroon, zelfde rationale.
- **Scope notes:** Voeg `prisma.scenario.findUnique()` check toe in `src/app/api/scenarios/active/route.ts` vóór de upsert. Retourneer 404 met Nederlandse fout als scenario niet bestaat. Sla validatie over voor `activeId === "default"`.
- **Dependencies:** None
- **Definition of done:** Validatie toegevoegd, niet-bestaand scenario retourneert 404, "default" wordt overgeslagen, `npm run verify` slaagt.
- **Implementation note:** 3-4 regels. Consistent met PB-187 patroon. Bron: DE-REC-080.

### PB-194: Releasenotes sync-proces vastleggen

- **ID:** PB-194
- **Title:** Releasenotes sync-proces vastleggen
- **Problem / opportunity:** De releasenotes-pagina gebruikt een hardcoded `RELEASES` array die elke cyclus handmatig gesynchroniseerd moet worden met `RELEASE_NOTES.md`. Drift is al twee keer opgetreden (PB-191 was nodig om 3 dagen achterstand bij te werken). Zonder procesafspraak herhaalt dit probleem zich elke cyclus.
- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Completed (2026-04-06) — Optie (a) toegepast: verplichte sync-regel toegevoegd aan `CLAUDE.md` sectie 11 (Agent Collaboration Rules → After Finishing). Regel stelt dat elke agent die `RELEASE_NOTES.md` aanvult ook in dezelfde commit het `RELEASES` array in `src/app/(dashboard)/documentatie/page.tsx` moet bijwerken. Bij de verificatie bleek het releasenotes-scherm al drift te vertonen voor 5 april — de ontbrekende entry is meteen toegevoegd.
- **Why this matters now:** Recurrend probleem. Eenvoudig op te lossen met een procesregel of gedeeld dataformaat.
- **Scope notes:** Kies aanpak: (a) voeg een verplichte sync-stap toe aan `CLAUDE.md` agentregels zodat de Experience Agent altijd synchroniseert na het schrijven van releasenotes, of (b) extraheer releasedata naar een gedeeld JSON-bestand. Optie (a) is zero-effort, optie (b) is robuuster. Start met optie (a).
- **Dependencies:** None
- **Definition of done:** Een vastgelegde procesregel of technische oplossing die voorkomt dat de releasenotes-pagina achterloopt op `RELEASE_NOTES.md`.
- **Implementation note:** Begin met optie (a): voeg een regel toe aan `CLAUDE.md` onder agent collaboration rules. Bron: EX-REC-056.

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

### PB-190: Voeg auth-checks toe aan settings GET endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-05
- **Summary:** Added `requireRole("VIEWER")` to GET handlers in `src/app/api/settings/[type]/route.ts` and `src/app/api/settings/skills/route.ts`. All GET endpoints now enforce minimum VIEWER role. No behavior change without NEXTAUTH_SECRET.

### PB-191: Releasenotes-pagina synchroniseren met RELEASE_NOTES.md

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-05
- **Summary:** Added April 2, 3, and 4 entries to the hardcoded `RELEASES` array in `src/app/(dashboard)/documentatie/page.tsx`. Content sourced from `RELEASE_NOTES.md`. Existing format preserved (date, title, category badges with items).

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
- Backlog IDs are sequential and never reused. Next available: PB-195.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
