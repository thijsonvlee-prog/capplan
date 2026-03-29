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

### SMI-004: Bigger design steps toward DESIGN.md compliance

- **Type:** Priority signal / direction change
- **Status:** Planned (partially escalated)
- **Input:** Er moeten grotere stappen gemaakt worden in het redesign om te voldoen aan design.md. Stuur aan op grotere verbeteringen, minder schaven aan bestaand ontwerp, maar echt componenten en schermen opnieuw ontwerpen obv design.md. Luister dus ook goed naar de aanbevelingen van de experience agent.
- **Why this matters:** The Scrum Master is signaling that incremental polish is no longer sufficient. The product needs visible, meaningful redesign steps that bring screens closer to the DESIGN.md standard. Experience Agent recommendations should be given higher weight in prioritization.
- **Product Owner action:** Elevated design-focused backlog items to P2 High priority. Created PB-031 (page headers for remaining screens), upgraded PB-020 (custom confirmation dialogs) from P4 Deferred to P2 Ready. Planning grid redesign (EX-REC-016) escalated as ESC-003 due to component complexity. SMI-002 constraint updated to exempt design work from incremental-only restriction.
- **Backlog linkage:** PB-031, PB-020 (upgraded), PB-032 (blocked on ESC-003).

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Planned (updated by SMI-004)
- **Input:** While core workflows (planning grid, roster assignment, driver management) are still stabilizing, all improvements must be incremental. Avoid broad redesigns, large refactors, or architectural changes that touch multiple domains at once.
- **Update (2026-03-29):** SMI-004 relaxes this constraint for design work. Meaningful redesign toward DESIGN.md compliance is now expected, but must still be phased and independently verifiable. Technical/architectural refactors remain subject to the incremental constraint.
- **Expected outcome:** Design improvements may be larger in scope. Technical changes remain small, focused, and independently verifiable. No single change should break the deploy.
- **Constraints / preferences:** If a valuable improvement requires broad changes, break it into smaller phases. Each phase must be independently deployable and pass `npm run verify`.
- **Product Owner instruction:** Applied as a standing constraint to technical backlog items. Design items follow the updated directive from SMI-004.
- **Backlog linkage:** Applied as a standing constraint to all backlog items.

### SMI-001: Connectivity hub for external data sources

- **Type:** Initiative
- **Status:** Planned
- **Input:** Develop a connectivity hub where external sources such as file imports and APIs can be configured.
- **Product Owner action:** Escalated to ESC-001. Scrum Master chose Option A (Configuration-first MVP). Created PB-015 (data model + API) and PB-016 (admin screen UI) as phased backlog items for future cycles.
- **Backlog linkage:** PB-015, PB-016.

## Closed Inputs

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
