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

### SMI-001: Connectivity hub for external data sources

- **Type:** Initiative
- **Status:** Planned
- **Input:** Develop a connectivity hub where external sources such as file imports and APIs can be configured. Planners should be able to connect workforce data from external systems (HR, payroll, fleet management) without requiring developer intervention.
- **Why this matters:** CapPlan currently operates as a standalone tool. Connecting it to existing data sources would eliminate manual data entry, reduce errors, and make the tool viable for organizations with established IT landscapes.
- **Expected outcome:** A configuration screen where administrators can set up import sources (CSV, API endpoints) and map external fields to CapPlan entities (drivers, employments, skills).
- **Constraints / preferences:** Start small. An MVP that handles CSV import with field mapping is preferred over a full integration platform. Do not introduce external dependencies without approval.
- **Product Owner action:** Escalated to ESC-001. Scrum Master chose Option A (Configuration-first MVP: CSV only, field mapping UI, no scheduled execution). Created PB-015 (data model + API) and PB-016 (admin screen UI) as phased backlog items for future cycles.
- **Backlog linkage:** PB-015, PB-016.

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Planned
- **Input:** While core workflows (planning grid, roster assignment, driver management) are still stabilizing, all improvements must be incremental. Avoid broad redesigns, large refactors, or architectural changes that touch multiple domains at once.
- **Why this matters:** Multiple agents operate on this codebase. Large cross-cutting changes increase the risk of conflicts, regressions, and broken deploys. Stability and predictability are more valuable than speed right now.
- **Expected outcome:** Each cycle delivers small, focused, independently verifiable improvements. No single change should touch more than 2-3 files outside its primary domain.
- **Constraints / preferences:** If a valuable improvement requires broad changes, break it into smaller phases. Each phase must be independently deployable and pass `npm run verify`.
- **Product Owner instruction:** Apply this constraint when prioritizing and scoping all backlog items. Flag any proposed work that violates this constraint.
- **Backlog linkage:** Applied as a standing constraint to all backlog items.

## Closed Inputs

_None yet._

## Input Handling Rules

- The Scrum Master may add large, rough, strategic, or directional input to this file at any time.
- The Product Owner Agent must read and process this file on every run.
- Large inputs must be broken down into smaller, executable backlog items before any work begins.
- Nothing from this file should be executed directly — all work must first be translated into `PRODUCT_BACKLOG.md`.
- If an input requires a decision before it can be safely planned, the Product Owner Agent must create or update an escalation in `ESCALATIONS_TO_SCRUM_MASTER.md`.
- Once input has been translated into backlog work, the Product Owner Agent must update its status to `Planned` and add backlog linkage (e.g., `PB-004, PB-005`).
- Inputs that are no longer relevant should be moved to `Closed Inputs` with a brief reason.
