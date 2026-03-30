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

Ik krijg een 'server error' als ik naar de capplan tool ga: 

Server error
There is a problem with the server configuration.

Check the server logs for more information.

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Planned (updated by SMI-004)
- **Input:** While core workflows (planning grid, roster assignment, driver management) are still stabilizing, all improvements must be incremental. Avoid broad redesigns, large refactors, or architectural changes that touch multiple domains at once.
- **Update (2026-03-29):** SMI-004 relaxes this constraint for design work. Meaningful redesign toward DESIGN.md compliance is now expected, but must still be phased and independently verifiable. Technical/architectural refactors remain subject to the incremental constraint.
- **Expected outcome:** Design improvements may be larger in scope. Technical changes remain small, focused, and independently verifiable. No single change should break the deploy.
- **Product Owner instruction:** Applied as a standing constraint to technical backlog items. Design items follow the updated directive from SMI-004.
- **Backlog linkage:** Applied as a standing constraint to all backlog items.

## Closed Inputs

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
