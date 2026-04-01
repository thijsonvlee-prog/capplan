# Scrum Master Input

## Purpose

This file is the direct input channel from the Scrum Master to the Product Owner Agent.

Use this file for:

- New initiatives and strategic direction
- Explicit requests and priorities
- Product constraints and corrections
- Concerns or large ideas that are still too broad for direct execution

This file is **not** the execution backlog. Nothing here should be executed directly. The Product Owner Agent is responsible for reading this file on every run and translating relevant input into executable backlog items in `PRODUCT_BACKLOG.md`.

## Status Definitions

- **New**: Input has been added by the Scrum Master but not yet reviewed by the Product Owner Agent.
- **Under review**: The Product Owner Agent is actively breaking down or scoping this input.
- **Planned**: Input has been translated into one or more backlog items in `PRODUCT_BACKLOG.md`.
- **Escalated**: Input requires a decision before it can be safely planned. See `ESCALATIONS_TO_SCRUM_MASTER.md`.
- **Closed**: Input has been fully processed or is no longer relevant.

## Active Inputs

### SMI-027: Mobiele navigatie werkt niet — planning en instellingen flikkeren zonder resultaat

- **Type:** Bug report
- **Status:** Planned
- **Date:** 2026-04-01
- **Original input:** "op mobile werkt het nu niet als ik op de planning knop druk, want dan flikkert alleen het beeld maar gebeurt er niets, hetzelfde geldt voor alle opties bij instellingen"
- **Analysis:** Mobile homescreen card navigation and settings section cards use state-based view switching with `mobile-page-enter` animation. Investigation indicates the animation fires on both the disappearing and appearing views simultaneously, and the header title context resets during the transition. This likely causes the view to briefly switch then reset, producing a flicker without completing navigation.
- **Backlog linkage:** PB-179

### SMI-026: Desktop homescreen

- **Type:** Feature request / initiative
- **Status:** Escalated
- **Date:** 2026-04-01
- **Original input:** "maak ook voor desktop een homescreen."
- **Analysis:** Currently the app redirects `/` to `/planning` on desktop. On mobile there is already a card-based homescreen. The desktop version needs scope definition: what content to show, whether it replaces the redirect or becomes a new route, and how it integrates with the existing sidebar navigation.
- **Escalation linkage:** ESC-014

## Closed Inputs

### SMI-024: Mobiele app-ervaring — homescreen, kaartnavigatie, terugknop

- **Type:** Initiative / major redesign
- **Status:** Closed
- **Closed reason:** Fully delivered. All 5 phases completed 2026-04-01: homescreen (PB-169), planning nav (PB-170), capacity view (PB-171), settings view (PB-172), transitions/polish (PB-173). Budget was 10 cycles; delivered in 2 cycles.
- **Backlog linkage:** PB-169, PB-170, PB-171, PB-172, PB-173 (all completed)

### SMI-025: Documentatiepagina vervangen door releasenotes-pagina

- **Type:** Feature change
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-174 completed 2026-04-01. Documentation page replaced with chronological release notes viewer with collapsible sections and category badges.
- **Backlog linkage:** PB-174 (completed)

### SMI-023: Hamburger-menu werkt nog steeds niet

- **Type:** Bug report (regressie / onvolledige fix)
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-168 completed 2026-04-01. Mount-guard fix in Sidebar.tsx prevents useEffect from triggering onClose on initial render.
- **Backlog linkage:** PB-168 (completed)

### SMI-022: Uitlijning vergrootglas in zoekbalk klopt niet

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-166 completed 2026-04-01.
- **Backlog linkage:** PB-166 (completed)

### SMI-021: Mobiele planning omzetten naar maandkalender

- **Type:** Feature change
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-167 completed 2026-04-01. Month calendar with week numbers, status dots, tap-to-detail.
- **Backlog linkage:** PB-167 (completed)

### SMI-020: Hamburgermenu op mobiel werkt niet

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-165 completed 2026-04-01. z-index fix on header.
- **Backlog linkage:** PB-165 (completed)

### SMI-019: Mobiele versie

- **Type:** Initiative / new feature
- **Status:** Closed
- **Closed reason:** Fully delivered. All 3 phases completed 2026-04-01: layout shell (PB-154), chauffeurlijst (PB-155), planning per chauffeur (PB-156). ESC-013 Option B scope complete. PB-167 (month calendar redesign) also delivered. Superseded by SMI-024 (broader mobile redesign).
- **Escalation linkage:** ESC-013 (closed)
- **Backlog linkage:** PB-154, PB-155, PB-156, PB-167 (all completed)

### SMI-018: API management

- **Type:** Initiative / new feature
- **Status:** Closed
- **Closed reason:** Phase 1 (uitgaande API-connecties) fully delivered 2026-03-31. All 5 backlog items completed: datamodel (PB-150), configuratie UI (PB-151), uitvoering (PB-152), response mapping (PB-153), test-verbinding (PB-158). Security fix on import-source GET (PB-159) also delivered.
- **Escalation linkage:** ESC-012 (closed)
- **Backlog linkage:** PB-150, PB-151, PB-152, PB-153, PB-158, PB-159 (all completed)

### SMI-017: Audittrail op alle stamdata

- **Type:** Initiative / new feature
- **Status:** Closed
- **Closed reason:** Fully delivered. All 4 phases completed 2026-03-31: data model (PB-146), stamtabel-integratie (PB-147), overige entiteiten (PB-148), UI viewer (PB-149).
- **Backlog linkage:** PB-146, PB-147, PB-148, PB-149 (all completed).

### SMI-015: Gebruikersgroepen met autorisatiefilters

- **Type:** Initiative / new feature
- **Status:** Closed
- **Closed reason:** Fully delivered. All 3 phases completed 2026-03-30: data model + API (PB-109), admin UI (PB-110), enforcement on data routes (PB-111). One follow-up security gap (individual-access routes) tracked as PB-121.
- **Backlog linkage:** PB-109, PB-110, PB-111 (all completed). PB-121 (follow-up).

### SMI-016: Login pagina — alleen Google + 'under construction' tekst

- **Type:** UX request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-103 completed 2026-03-30.
- **Backlog linkage:** PB-103 (completed).

### SMI-014: Alleen toegevoegde gebruikers mogen inloggen via Google

- **Type:** Security fix
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-102 completed 2026-03-30.
- **Backlog linkage:** PB-102 (completed).

### SMI-013: Admin autorisatierol

- **Type:** Request
- **Status:** Closed
- **Closed reason:** Already fully implemented.

### SMI-012: Stamtabellen documentatie in masterdata.md

- **Type:** Documentation request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-101 completed 2026-03-30.
- **Backlog linkage:** PB-101 (completed).

### SMI-011: Voorbereidingen voor 1000 chauffeurs — performance en schaalbaarheid

- **Type:** Initiative / priority signal
- **Status:** Closed
- **Closed reason:** Fully delivered. All 8 backlog items completed.
- **Backlog linkage:** PB-093, PB-094, PB-009, PB-092, PB-096, PB-097, PB-105, PB-098 (all completed).

### SMI-010: Google OAuth redirect_uri_mismatch fout

- **Type:** Bug report (configuratie)
- **Status:** Closed
- **Closed reason:** Configuratie-issue in Google Cloud Console, geen code-wijziging nodig.

### SMI-009: Server error bij openen CapPlan

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fixed in PB-087.
- **Backlog linkage:** PB-087 (completed).

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Closed (standing constraint, actively applied)
- **Closed reason:** Standing constraint. Actively applied to all backlog items as a prioritization rule.

### SMI-008: Focus on building out functionality — connectivity and user management

- **Type:** Initiative / priority signal
- **Status:** Closed
- **Closed reason:** Fully delivered.
- **Backlog linkage:** PB-077–PB-084.

### SMI-007: Rewrite CLAUDE.md based on current application state, incorporate DESIGN.md

- **Type:** Request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-076 completed 2026-03-30.
- **Backlog linkage:** PB-076 (done).

### SMI-001: Connectivity hub for external data sources

- **Type:** Initiative
- **Status:** Closed
- **Closed reason:** Fully delivered.
- **Backlog linkage:** PB-015, PB-016, PB-077, PB-078, PB-083.

### SMI-004: Bigger design steps toward DESIGN.md compliance

- **Type:** Priority signal / direction change
- **Status:** Closed
- **Closed reason:** Fully delivered.
- **Backlog linkage:** PB-032, PB-034, PB-035, PB-037–PB-041, PB-048, PB-052, PB-047, PB-057.

### SMI-006: Custom date picker design

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-039 completed 2026-03-29.
- **Backlog linkage:** PB-039.

### SMI-005: DayCell popup positioning and redesign

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered.
- **Backlog linkage:** PB-037, PB-038.

### SMI-003: Drivers not visible in planning grid

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fixed. PB-025 completed 2026-03-29.
- **Backlog linkage:** PB-025.

## Input Handling Rules

- The Scrum Master may add large, rough, strategic, or directional input to this file at any time.
- The Product Owner Agent must read and process this file on every run.
- Large inputs must be broken down into smaller, executable backlog items before any work begins.
- Nothing from this file should be executed directly — all work must first be translated into `PRODUCT_BACKLOG.md`.
- If an input requires a decision before it can be safely planned, the Product Owner Agent must create or update an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- Once input has been translated into backlog work, the Product Owner Agent must update its status to `Planned` and add backlog linkage (e.g., `PB-004, PB-005`).
- Inputs that are no longer relevant should be moved to `Closed Inputs` with a brief reason.
