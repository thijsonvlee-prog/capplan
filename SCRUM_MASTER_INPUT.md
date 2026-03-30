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

### SMI-011: Voorbereidingen voor 1000 chauffeurs — performance en schaalbaarheid

- **Type:** Initiative / priority signal
- **Status:** Planned
- **Input:** "Maak voorbereidingen voor grotere schaal en meer data input. Er moet straks voor uiteindelijk 1000 chauffeurs de planning kunnen worden gemaakt. Zorg ervoor dat de performance goed blijft. Het systeem mag nooit traag aanvoelen."
- **Analysis:** Investigation reveals three critical bottlenecks at 1000 drivers: (1) PlanningGrid renders all rows in the DOM — no virtualization, (2) `/api/planning/for-range` and `/api/drivers` return all records without pagination — 5-10MB payloads, (3) no covering index for capacity aggregation at scale. Capacity groupBy and scenario duplication are lower risk.
- **Breakdown:** Broken into 6 phased backlog items (PB-093 through PB-098). Phase 1 (backend pagination: PB-093, PB-094, PB-009) is ready for the next cycle. Phase 2 (frontend: PB-096, PB-097) is fully unblocked after ESC-007 decision (react-window approved) and will become ready once Phase 1 ships. PB-092 (import guardrail) runs in parallel. PB-098 (scenario duplication batching) is deferred.
- **Backlog linkage:** PB-093, PB-094, PB-009 (promoted), PB-092, PB-096, PB-097, PB-098.

## Closed Inputs

### SMI-010: Google OAuth redirect_uri_mismatch fout

- **Type:** Bug report (configuratie)
- **Status:** Closed
- **Input:** "Bij inloggen met Google krijg ik de foutmelding: Fout 400: redirect_uri_mismatch Details van verzoek: flowName=GeneralOAuthFlow"
- **Root cause:** De "Authorized redirect URI" in Google Cloud Console komt niet overeen met de daadwerkelijke callback-URL van NextAuth.js. De exacte URI die geconfigureerd moet worden is: `https://<jouw-vercel-url>/api/auth/callback/google` (let op het pad `/api/auth/callback/google`).
- **Resolution:** Dit is een configuratie-issue in Google Cloud Console, geen code-issue. De stappen staan beschreven in `AUTH_SETUP.md` (Stap 3a, punt 6). Controleer dat de redirect URI exact overeenkomt, inclusief protocol (`https://`) en het volledige pad. De probleemoplossingstabel in `AUTH_SETUP.md` behandelt dit scenario al ("Callback-fout na inloggen → Redirect URI komt niet overeen").
- **Closed reason:** Geen code-wijziging nodig. Configuratie-aanpassing in Google Cloud Console vereist. Documentatie is reeds beschikbaar in AUTH_SETUP.md.
- **Backlog linkage:** Geen — geen backlog item nodig.

### SMI-009: Server error bij openen CapPlan

- **Type:** Bug report
- **Status:** Closed
- **Input:** "Ik krijg een 'server error' als ik naar de capplan tool ga: Server error — There is a problem with the server configuration. Check the server logs for more information."
- **Root cause:** The NextAuth middleware (`src/middleware.ts`) unconditionally required `NEXTAUTH_SECRET` to be set, while the API route role enforcement (`requireRole()`) gracefully skips when it's not configured. When `NEXTAUTH_SECRET` is missing, the middleware crashed and NextAuth showed its default error page on all dashboard routes.
- **Resolution:** Fixed by the Product Owner Agent. The middleware now checks for `NEXTAUTH_SECRET` before enforcing authentication, matching the same conditional pattern used in `api-route-utils.ts`. When auth is not configured, all requests pass through.
- **Closed reason:** Fixed in PB-087.
- **Backlog linkage:** PB-087 (completed).
- **Note:** If the error persists after deployment, the issue may be in the Vercel environment configuration (missing or incorrect `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, or provider credentials). See ESC-006 for environment checklist.

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Closed (standing constraint, actively applied)
- **Input:** While core workflows (planning grid, roster assignment, driver management) are still stabilizing, all improvements must be incremental. Avoid broad redesigns, large refactors, or architectural changes that touch multiple domains at once.
- **Update (2026-03-29):** SMI-004 relaxes this constraint for design work. Meaningful redesign toward DESIGN.md compliance is now expected, but must still be phased and independently verifiable. Technical/architectural refactors remain subject to the incremental constraint.
- **Closed reason:** Standing constraint. Actively applied to all backlog items as a prioritization rule. No further processing needed.
- **Backlog linkage:** Applied as a standing constraint to all backlog items.

### SMI-008: Focus on building out functionality — connectivity and user management

- **Type:** Initiative / priority signal
- **Status:** Closed
- **Closed reason:** Fully delivered. Connectivity: PB-077 (CSV upload), PB-078 (import execution), PB-083 (fieldMappings validation) all complete. Auth & user management: PB-080 (infrastructure), PB-081 (login page), PB-079 (admin panel), PB-082 (role enforcement) all complete. Follow-up PB-084 (frontend role-aware UI) scheduled.
- **Backlog linkage:** PB-077–PB-084.

### SMI-007: Rewrite CLAUDE.md based on current application state, incorporate DESIGN.md

- **Type:** Request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-076 completed 2026-03-30.
- **Backlog linkage:** PB-076 (done).

### SMI-001: Connectivity hub for external data sources

- **Type:** Initiative
- **Status:** Closed
- **Closed reason:** Fully delivered. Configuration MVP (PB-015, PB-016), CSV upload (PB-077), import execution (PB-078), fieldMappings validation (PB-083) all complete.
- **Backlog linkage:** PB-015, PB-016, PB-077, PB-078, PB-083.

### SMI-004: Bigger design steps toward DESIGN.md compliance

- **Type:** Priority signal / direction change
- **Status:** Closed
- **Closed reason:** Fully delivered. All major redesign work is complete: planning grid (3 phases), DayCell popup, date input wrapper, settings page tab navigation, drivers page composition, SubTable consistency, capacity page badges, RosterAssigner table, RosterProfileEditor dots. No remaining dense-border tables. All common surfaces aligned with DESIGN.md.
- **Backlog linkage:** PB-032 (done), PB-034 (done), PB-035 (done), PB-037 (done), PB-038 (done), PB-039 (done), PB-041 (done), PB-048 (done), PB-052 (done), PB-047 (done), PB-040 (done), PB-057 (done).

### SMI-006: Custom date picker design

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered. ESC-004 decided Option B (styled date input wrapper). PB-039 completed 2026-03-29 — all date fields now use a styled wrapper with calendar icon trigger.
- **Backlog linkage:** PB-039 (completed).

### SMI-005: DayCell popup positioning and redesign

- **Type:** UX improvement request
- **Status:** Closed
- **Closed reason:** Fully delivered. PB-037 (reposition popup near click target) and PB-038 (visual redesign) both completed 2026-03-29.
- **Backlog linkage:** PB-037 (completed), PB-038 (completed).

### SMI-003: Drivers not visible in planning grid

- **Type:** Bug report
- **Status:** Closed
- **Closed reason:** Fixed. PB-025 completed 2026-03-29 — removed the employment-based filter from the planning grid API. All drivers now appear in the planning grid.
- **Backlog linkage:** PB-025 (completed).

## Input Handling Rules

- The Scrum Master may add large, rough, strategic, or directional input to this file at any time.
- The Product Owner Agent must read and process this file on every run.
- Large inputs must be broken down into smaller, executable backlog items before any work begins.
- Nothing from this file should be executed directly — all work must first be translated into `PRODUCT_BACKLOG.md`.
- If an input requires a decision before it can be safely planned, the Product Owner Agent must create or update an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- Once input has been translated into backlog work, the Product Owner Agent must update its status to `Planned` and add backlog linkage (e.g., `PB-004, PB-005`).
- Inputs that are no longer relevant should be moved to `Closed Inputs` with a brief reason.
