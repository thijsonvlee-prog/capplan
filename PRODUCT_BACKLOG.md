# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Three new Scrum Master inputs drive this cycle: a critical mobile navigation bug (P1), a search icon alignment fix (P2), and a significant mobile planning redesign to monthly calendar view (P2). All assigned to Experience Agent. Delivery Agent has no active items this cycle — only P4 deferred items remain.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-165: Fix mobiele hamburger-menu (z-index bug)

- **Title:** Hamburger-menu op mobiel werkt niet door z-index conflict
- **Problem:** De mobile-nav-overlay (z-index: 40) bedekt de header (geen z-index), waardoor klikken op de hamburger-knop worden geblokkeerd. Mobiele navigatie is volledig onbruikbaar.
- **Owner:** Experience Agent
- **Priority:** P1 Critical
- **Status:** Ready
- **Why this matters now:** Blokkeert alle mobiele navigatie. Directe SM-melding.
- **Scope notes:** Fix de z-index hiërarchie zodat de header boven de overlay zit. Voeg een expliciete z-index toe aan de header (bijv. z-50 of hoger) of verlaag de overlay z-index. Test dat de overlay nog steeds correct sluit bij klik, en dat de hamburger-knop zowel opent als sluit.
- **Dependencies:** Geen.
- **Definition of done:** Hamburger-knop opent en sluit de mobiele sidebar betrouwbaar op alle mobiele schermgroottes. Overlay sluit bij tik buiten het paneel. Desktop-layout ongewijzigd.
- **Implementation note:** Betrokken bestanden: `src/app/globals.css` (z-index waarden voor `.mobile-nav-overlay`, `.mobile-nav-panel`), `src/components/layout/Header.tsx` (header element), mogelijk `src/app/(dashboard)/layout.tsx`. Minimale wijziging — alleen z-index aanpassen.
- **Source:** SMI-020

### PB-166: Fix uitlijning vergrootglas in zoekbalken

- **Title:** Vergrootglas-icoon staat te ver naar links in zoekbalken
- **Problem:** Het Search-icoon is gepositioneerd met `left-3` (12px) maar lijkt visueel niet goed uitgelijnd ten opzichte van de invoertekst. Zichtbaar in zowel de chauffeurlijst als de mobiele planningsweergave.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Directe SM-melding. Zichtbaar op elke pagina met een zoekbalk.
- **Scope notes:** Pas de horizontale positie van het Search-icoon aan in beide zoekbalken. Controleer dat de uitlijning visueel klopt bij de invoertekst met `pl-9` padding. Overweeg `left-3` te verhogen naar bijv. `left-3.5` of een aangepaste waarde.
- **Dependencies:** Geen.
- **Definition of done:** Vergrootglas is visueel gecentreerd in de beschikbare ruimte links van de invoertekst, op zowel desktop als mobiel. Beide zoekbalken (DriverList, MobilePlanningView) zijn consistent.
- **Implementation note:** Betrokken bestanden: `src/components/drivers/DriverList.tsx` (regel ~167), `src/components/planning/MobilePlanningView.tsx` (regel ~165). Wijzig de `left-3` class op het Search-icoon.
- **Source:** SMI-022

### PB-167: Mobiele planning omzetten naar maandkalenderweergave

- **Title:** Vervang dag-/weekweergave door maandkalender met weeknummers op mobiel
- **Problem:** De huidige mobiele planningsweergave toont een dag- of weekoverzicht per chauffeur. De Scrum Master wil een maandkalenderweergave met weeknummers, wat beter past bij hoe planners roosters overzien.
- **Owner:** Experience Agent
- **Priority:** P2 High
- **Status:** Ready
- **Why this matters now:** Directe SM-richtlijn. Verandert de kerninteractie van de mobiele planningsweergave.
- **Scope notes:** Herschrijf `MobilePlanningView` om een maandkalender te tonen in plaats van dag/week toggle. Vereisten: (1) maandoverzicht als kalenderraster (7 kolommen, ma-zo), (2) weeknummers zichtbaar per rij, (3) maandnavigatie (vorige/volgende maand + "Vandaag"-knop), (4) statuskleuren per dag in het raster, (5) tik op een dag voor details (status, verloftype, ziektepercentage, notities). Data-ophaling wijzigt van 1-7 dagen naar ~35 dagen. Chauffeur-selectiescherm blijft ongewijzigd.
- **Dependencies:** PB-165 (hamburger-menu moet werken om de planning te bereiken op mobiel). PB-166 (zoekbalk in het chauffeur-selectiescherm).
- **Definition of done:** Mobiele planningsweergave toont een volledige maandkalender met weeknummers. Dagen tonen statuskleur. Tikken op een dag toont details. Maandnavigatie werkt. Desktop planningsrooster ongewijzigd.
- **Implementation note:** Betrokken bestand: `src/components/planning/MobilePlanningView.tsx` (495 regels, significante herschrijving). API-aanroep wijzigt naar maandbereik via `api.planning.getEntries()`. Gebruik `getISOWeekNumber()` uit `src/lib/utils.ts` voor weeknummers. Compact raster nodig vanwege mobiele schermbreedte — overweeg kleine cellen met alleen een kleurstip per dag, met detail-popup bij tik.
- **Source:** SMI-021

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-163: Deduplicate resolveUserId naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

### PB-164: Deduplicate validateApiFields naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

### PB-156: Mobiele dag-/weekplanning per chauffeur

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

---

## Deferred

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step for mobile planning, but the read-only flow should be validated by user feedback before investing in edit capability. Also depends on PB-167 (calendar redesign) completing first — edit should be built on top of the new calendar view, not the old day/week view.
- **Source:** EX-REC-052

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is structurally aligned. Custom tooltip is cosmetic.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. May become relevant after mobile work completes.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural follow-up to PB-164 deduplication. Low effort but no user impact.
- **Source:** DE-REC-070

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014, DE-REC-030, DE-REC-047.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement. Needs visual evaluation.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional with autocomplete from discovered paths.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

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
- **Reason:** Natural Phase 1 follow-up but not blocking. Current auto-detection handles common patterns.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-168.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
