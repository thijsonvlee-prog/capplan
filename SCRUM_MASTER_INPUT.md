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

### SMI-015: Gebruikersgroepen met autorisatiefilters

- **Type:** Initiative / new feature
- **Status:** Escalated
- **Input:** "Implementeer een functionaliteit voor het beheren van gebruikersgroepen. Per gebruikersgroep moeten autorisatiefilters kunnen worden vastgelegd (dus filters op de zichtbare gegevens, niet op functionaliteit). Functionaliteit wordt vastgelegd in de autorisatierol."
- **Analysis:** This is a significant new feature. No UserGroup model or group-related code exists. Requires: data model (UserGroup, group membership, filter definitions), API routes, management UI, and filter enforcement on all data queries. The scope of "filterable dimensions" (employer, department, location, or others) and enforcement strategy need to be decided before implementation can start. Escalated to ESC-008.
- **Backlog linkage:** PB-104 (blocked pending ESC-008).

## Closed Inputs

### SMI-016: Login pagina — alleen Google + 'under construction' tekst

- **Type:** UX request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-103 completed 2026-03-30. Login page shows only Google button with Dutch "under construction" notice.
- **Backlog linkage:** PB-103 (completed).

### SMI-014: Alleen toegevoegde gebruikers mogen inloggen via Google

- **Type:** Security fix
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-102 completed 2026-03-30. Only pre-added users can now login via Google. Unknown accounts are rejected with Dutch error message.
- **Backlog linkage:** PB-102 (completed).

### SMI-013: Admin autorisatierol

- **Type:** Request
- **Status:** Closed
- **Closed reason:** Already fully implemented. The ADMIN role exists in the User model (Prisma schema), is enforced server-side via `requireRole()` in `api-route-utils.ts` with a clear hierarchy (VIEWER < PLANNER < ADMIN), and has full access to all functionality including settings, users, import sources, and roster profiles. No additional work needed.

### SMI-012: Stamtabellen documentatie in masterdata.md

- **Type:** Documentation request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-101 completed 2026-03-30. masterdata.md created with all 22 models documented.
- **Backlog linkage:** PB-101 (completed).

### SMI-011: Voorbereidingen voor 1000 chauffeurs — performance en schaalbaarheid

- **Type:** Initiative / priority signal
- **Status:** Closed
- **Closed reason:** Fully delivered. All 8 backlog items completed across 3 phases: server-side pagination (PB-093, PB-094), capacity index (PB-009), import guardrail (PB-092), virtual scrolling (PB-096), drivers pagination UI (PB-097), planning grid pagination (PB-105), and scenario duplication batching (PB-098). The application is now prepared for 1000+ drivers.
- **Backlog linkage:** PB-093, PB-094, PB-009, PB-092, PB-096, PB-097, PB-105, PB-098 (all completed).

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
