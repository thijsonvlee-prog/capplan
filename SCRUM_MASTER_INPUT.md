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

### SMI-016: Login pagina — alleen Google + 'under construction' tekst

- **Type:** UX request
- **Status:** Planned
- **Input:** "Zorg ervoor dat op de login pagina alleen de google login optie zichtbaar is. Ook moet de login pagina nog even de tekst tonen 'under construction'"
- **Analysis:** Login page currently shows both Google and Microsoft buttons. Simple UI change: hide Microsoft button, add 'under construction' text.
- **Backlog linkage:** PB-103.

### SMI-015: Gebruikersgroepen met autorisatiefilters

- **Type:** Initiative / new feature
- **Status:** Escalated
- **Input:** "Implementeer een functionaliteit voor het beheren van gebruikersgroepen. Per gebruikersgroep moeten autorisatiefilters kunnen worden vastgelegd (dus filters op de zichtbare gegevens, niet op functionaliteit). Functionaliteit wordt vastgelegd in de autorisatierol."
- **Analysis:** This is a significant new feature. No UserGroup model or group-related code exists. Requires: data model (UserGroup, group membership, filter definitions), API routes, management UI, and filter enforcement on all data queries. The scope of "filterable dimensions" (employer, department, location, or others) and enforcement strategy need to be decided before implementation can start. Escalated to ESC-008.
- **Backlog linkage:** PB-104 (blocked pending ESC-008).

### SMI-014: Alleen toegevoegde gebruikers mogen inloggen via Google

- **Type:** Security fix
- **Status:** Planned
- **Input:** "Alleen gebruikers die zijn toegevoegd via Adminpanel moeten kunnen inloggen via google. Niet zo maar iedereen die probeert in te loggen moet toegang krijgen."
- **Analysis:** Currently PrismaAdapter auto-creates a User record on first Google login with default PLANNER role. This means anyone with a Google account can access the application. Fix: add a `signIn` callback that rejects users not already in the User table.
- **Backlog linkage:** PB-102.

### SMI-013: Admin autorisatierol

- **Type:** Request
- **Status:** Closed
- **Input:** "Voeg de autorisatierol Admin toe. deze dient alle rechten te hebben."
- **Closed reason:** Already fully implemented. The ADMIN role exists in the User model (Prisma schema), is enforced server-side via `requireRole()` in `api-route-utils.ts` with a clear hierarchy (VIEWER < PLANNER < ADMIN), and has full access to all functionality including settings, users, import sources, and roster profiles. No additional work needed.

### SMI-012: Stamtabellen documentatie in masterdata.md

- **Type:** Documentation request
- **Status:** Planned
- **Input:** "Beschrijving van stamtabellen met alle velden en veldspecificaties in masterdata.md. ook de relaties tussen de stamtabellen hier beschrijven."
- **Analysis:** No masterdata.md exists. Straightforward documentation task: describe all stamtabellen with fields, types, constraints, and relationships. Use Prisma schema as source of truth.
- **Backlog linkage:** PB-101.

### SMI-011: Voorbereidingen voor 1000 chauffeurs — performance en schaalbaarheid

- **Type:** Initiative / priority signal
- **Status:** Planned
- **Input:** "Maak voorbereidingen voor grotere schaal en meer data input. Er moet straks voor uiteindelijk 1000 chauffeurs de planning kunnen worden gemaakt. Zorg ervoor dat de performance goed blijft. Het systeem mag nooit traag aanvoelen."
- **Analysis:** Investigation reveals three critical bottlenecks at 1000 drivers: (1) PlanningGrid renders all rows in the DOM — no virtualization, (2) `/api/planning/for-range` and `/api/drivers` return all records without pagination — 5-10MB payloads, (3) no covering index for capacity aggregation at scale. Capacity groupBy and scenario duplication are lower risk.
- **Breakdown:** Broken into 8 phased backlog items (PB-093 through PB-098, PB-105). **Phase 1 complete:** PB-093 (planning pagination), PB-094 (drivers pagination), PB-009 (capacity index), PB-092 (import guardrail) all shipped 2026-03-30. **Phase 2 complete:** PB-096 (virtual scrolling) and PB-097 (drivers pagination UI) shipped 2026-03-30. **Phase 3 ready:** PB-105 (planning grid paginated fetching) and PB-098 (scenario duplication batching) scheduled for next cycle.
- **Backlog linkage:** PB-093, PB-094, PB-009, PB-092, PB-096, PB-097, PB-105, PB-098.

## Closed Inputs

### SMI-010: Google OAuth redirect_uri_mismatch fout

- **Type:** Bug report (configuratie)
- **Status:** Closed
- **Closed reason:** Configuratie-issue in Google Cloud Console, geen code-wijziging nodig. Documentatie beschikbaar in AUTH_SETUP.md.
- **Backlog linkage:** Geen.

### SMI-009: Server error bij openen CapPlan

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fixed in PB-087.
- **Backlog linkage:** PB-087 (completed).

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Closed (standing constraint, actively applied)
- **Closed reason:** Standing constraint. Actively applied to all backlog items as a prioritization rule.
- **Backlog linkage:** Applied as a standing constraint to all backlog items.

### SMI-008: Focus on building out functionality — connectivity and user management

- **Type:** Initiative / priority signal
- **Status:** Closed
- **Closed reason:** Fully delivered. Connectivity and auth/user management all complete.
- **Backlog linkage:** PB-077–PB-084.

### SMI-007: Rewrite CLAUDE.md based on current application state, incorporate DESIGN.md

- **Type:** Request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-076 completed 2026-03-30.
- **Backlog linkage:** PB-076 (done).

### SMI-001: Connectivity hub for external data sources

- **Type:** Initiative
- **Status:** Closed
- **Closed reason:** Fully delivered. Configuration MVP, CSV upload, import execution, validation all complete.
- **Backlog linkage:** PB-015, PB-016, PB-077, PB-078, PB-083.

### SMI-004: Bigger design steps toward DESIGN.md compliance

- **Type:** Priority signal / direction change
- **Status:** Closed
- **Closed reason:** Fully delivered. All major redesign work complete.
- **Backlog linkage:** PB-032, PB-034, PB-035, PB-037–PB-041, PB-048, PB-052, PB-047, PB-057.

### SMI-006: Custom date picker design

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-039 completed 2026-03-29.
- **Backlog linkage:** PB-039.

### SMI-005: DayCell popup positioning and redesign

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-037, PB-038 completed 2026-03-29.
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
