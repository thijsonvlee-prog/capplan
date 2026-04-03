# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** One real bug (PB-184, scenario DELETE preference cleanup) and one security gap (PB-185, missing auth on GET endpoints) are the top priorities for the next cycle. Additional validation improvements (PB-186 through PB-189) fill remaining capacity. Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-184: Fix scenario DELETE preference cleanup voor ingelogde gebruikers

- **ID:** PB-184
- **Title:** Scenario DELETE hardcodes userId "default" — stale preferences bij echte gebruikers
- **Problem / opportunity:** `/api/scenarios/[id]/route.ts` line 29 zoekt de actieve scenario-voorkeur met hardcoded `userId: "default"`. Bij ingelogde gebruikers matcht dit nooit, waardoor verwijderde scenario-ID's in de preferences-tabel blijven staan. Bij volgende laadbeurt vraagt de UI planning-data op voor een niet-bestaand scenario en krijgt stil lege resultaten.
- **Owner:** Delivery Agent
- **Priority:** P1 Critical
- **Status:** Ready
- **Why this matters now:** Dit is een echte bug die stille dataverlies veroorzaakt bij productie met authenticatie ingeschakeld.
- **Scope notes:** Vervang de `findFirst` met `deleteMany` die matcht op `key: "activeScenario", value: id` ongeacht userId. Eén querywijziging.
- **Dependencies:** Geen
- **Definition of done:** Na het verwijderen van een scenario wordt de bijbehorende voorkeur opgeruimd voor alle gebruikers. Verify slaagt.
- **Implementation note:** Bron: DE-REC-072.

### PB-185: Voeg auth-checks toe aan onbeschermde GET endpoints

- **ID:** PB-185
- **Title:** Meerdere GET API-endpoints missen authenticatiecontrole
- **Problem / opportunity:** `GET /api/scenarios`, `GET /api/roster-profiles`, en driver sub-record GET handlers (employment, functions, roster-assignments) roepen geen `requireRole` aan. Bij een publieke deployment zijn scenario-namen en chauffeur-subrecorddata openbaar leesbaar. Dit schendt de permissiematrix in CLAUDE.md (VIEWER = lees-toegang op alle GET endpoints).
- **Owner:** Delivery Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Beveiligingsgat dat gedicht moet worden vóór publieke deployment.
- **Scope notes:** Voeg `requireRole("VIEWER")` toe aan deze GET handlers. Geen gedragswijziging wanneer auth niet geconfigureerd is (requireRole slaat enforcement over zonder NEXTAUTH_SECRET).
- **Dependencies:** Geen
- **Definition of done:** Alle GET endpoints hebben minimaal VIEWER role check. Verify slaagt.
- **Implementation note:** Bron: DE-REC-073.

### PB-186: Valideer datumformaten op sub-record routes

- **ID:** PB-186
- **Title:** Sub-record startDate/endDate vergelijking op ongevalideerde strings
- **Problem / opportunity:** Employment, function en roster-assignment POST/PUT handlers (6 route-bestanden) vergelijken `endDate < startDate` via `new Date()` zonder eerst het datumformaat te valideren. Bij ongeldige invoer retourneert Prisma een onduidelijke 500-fout.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Productiefout bij ongeldige datuminvoer levert onduidelijke foutmelding op.
- **Scope notes:** Roep `validateDateFormat()` (bestaat al in `api-route-utils.ts`) aan op startDate en endDate vóór de range-vergelijking in 6 bestanden. Retourneer duidelijke 400 met Nederlandse foutmelding.
- **Dependencies:** Geen
- **Definition of done:** Ongeldige datumstrings retourneren 400 met duidelijke foutmelding. Verify slaagt.
- **Implementation note:** Bron: DE-REC-074.

### PB-187: Valideer scenario-ID voordat planning entries worden aangemaakt

- **ID:** PB-187
- **Title:** Planning POST/bulk accepteert ongeldige scenario-ID's met 500 in plaats van 400
- **Problem / opportunity:** `resolveScenarioId()` controleert niet of een niet-standaard scenario-ID daadwerkelijk bestaat. Bij een verwijderd of willekeurig ID geeft Prisma's FK-constraint een 500-fout in plaats van een helpende 400.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Realistisch gebruikersfoutpad (verwijderd scenario nog geselecteerd) levert onduidelijke fouten.
- **Scope notes:** Voeg `validateOptionalForeignKey()` toe na `resolveScenarioId()` in planning POST en bulk handlers.
- **Dependencies:** Geen
- **Definition of done:** Ongeldige scenario-ID retourneert 400 met duidelijke foutmelding. Verify slaagt.
- **Implementation note:** Bron: DE-REC-077.

### PB-188: Verminder dubbele sessie-lookups op planning routes

- **ID:** PB-188
- **Title:** Dubbele getServerSession calls op routes met requireRole + getAllowedDepartmentIds
- **Problem / opportunity:** `requireRole()` en `getAllowedDepartmentIds()` doen beide onafhankelijk `getServerSession(authOptions)`. Op planning POST, bulk en DELETE routes betekent dit twee DB round-trips per request (~50-100ms extra op Neon serverless).
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Makkelijke optimalisatie op de hoogst-gebruikte routes.
- **Scope notes:** Voeg optionele `session`-parameter toe aan `getAllowedDepartmentIds()` zodat een pre-fetched sessie van `requireRole()` hergebruikt kan worden.
- **Dependencies:** Geen
- **Definition of done:** Planning mutatie-routes doen maximaal één sessie-lookup. Verify slaagt.
- **Implementation note:** Bron: DE-REC-075.

### PB-189: Voeg audit logging toe aan driver sub-record mutaties

- **ID:** PB-189
- **Title:** Employment, function en roster-assignment mutaties missen audit trail
- **Problem / opportunity:** Alle POST, PUT en DELETE handlers voor driver sub-records roepen nooit `logAudit()` aan. De driver zelf wordt geaudit, maar individuele sub-record wijzigingen laten geen spoor na.
- **Owner:** Delivery Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Why this matters now:** Audit trail is incompleet voor een categorie vaak-gewijzigde records. Belangrijk voor compliance.
- **Scope notes:** Voeg `logAudit()` calls toe in 6 route-bestanden (~4 regels per handler, 12-15 handlers). Volg bestaand fire-and-forget patroon.
- **Dependencies:** Geen
- **Definition of done:** Alle sub-record mutaties genereren audit log entries. Verify slaagt.
- **Implementation note:** Bron: DE-REC-076.

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

### PB-183: Dedupliceer date-parsing logica in planning API routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-03
- **Summary:** Extracted `parseDateList()` utility to `api-route-utils.ts`. All three planning routes now use the shared function. Eliminates ~30 lines of duplicate logic.

### PB-182: CapacityTable — tonale lagen refactor

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-03
- **Summary:** Replaced 1px row borders and alternating row tints with tonal surface layering. Summary rows moved to semantic `<tfoot>`. Verify passes.

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
- Backlog IDs are sequential and never reused. Next available: PB-190.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
