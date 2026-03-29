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

### SMI-005: DayCell popup positioning and redesign

- **Type:** UX improvement request
- **Status:** Planned
- **Input:** Denk alvast na over wat er nodig is om de pop-up/dropdown bij het aanklikken van een daycell te verbeteren. Nu is het zo dat je klikt op een daycell, dan vervolgens komt de pop-up in het midden van je scherm (ver weg van je muis), je wil dus eigenlijk dat dit makkelijker werkt. Ook het ontwerp hiervan mag mooier.
- **Why this matters:** The DayCell popup is part of the core planning workflow. Appearing in screen center forces the user to move their attention away from the cell they just clicked. Positioning near the click target and improving the visual design directly improves planning efficiency.
- **Product Owner action:** Created PB-037 (reposition popup near click target) and PB-038 (redesign popup appearance). PB-037 is ready for next cycle. PB-038 depends on PB-037 positioning work.
- **Backlog linkage:** PB-037, PB-038.

### SMI-006: Custom date picker design

- **Type:** UX improvement request
- **Status:** Planned
- **Input:** Implementeer een mooiere datumselectie scherm, in alle datumvelden komt nu een lelijk (soort standaard) datum selectiescherm, maar dit mag een custom design zijn dat aansluit bij de rest van de applicatie.
- **Why this matters:** All date fields use the browser's native date picker, which looks inconsistent with the application's design system. A custom date picker aligned with the design tokens would significantly improve perceived quality.
- **Product Owner action:** ESC-004 decided: Option B (styled date input wrapper). PB-039 updated and moved to Ready for next cycle.
- **Backlog linkage:** PB-039.

### SMI-004: Bigger design steps toward DESIGN.md compliance

- **Type:** Priority signal / direction change
- **Status:** Planned
- **Input:** Er moeten grotere stappen gemaakt worden in het redesign om te voldoen aan design.md. Stuur aan op grotere verbeteringen, minder schaven aan bestaand ontwerp, maar echt componenten en schermen opnieuw ontwerpen obv design.md. Luister dus ook goed naar de aanbevelingen van de experience agent.
- **Why this matters:** The Scrum Master is signaling that incremental polish is no longer sufficient. The product needs visible, meaningful redesign steps.
- **Product Owner action:** Design items elevated to P2 High. Planning grid phased redesign approved (ESC-003 → Option B). Phase 1 complete. Phase 2 (PB-034) promoted to ready. DayCell popup redesign (SMI-005) aligns with this direction.
- **Backlog linkage:** PB-020, PB-031, PB-033, PB-032, PB-034, PB-035, PB-037, PB-038.

### SMI-002: Keep improvements incremental during stabilization

- **Type:** Constraint
- **Status:** Planned (updated by SMI-004)
- **Input:** While core workflows (planning grid, roster assignment, driver management) are still stabilizing, all improvements must be incremental. Avoid broad redesigns, large refactors, or architectural changes that touch multiple domains at once.
- **Update (2026-03-29):** SMI-004 relaxes this constraint for design work. Meaningful redesign toward DESIGN.md compliance is now expected, but must still be phased and independently verifiable. Technical/architectural refactors remain subject to the incremental constraint.
- **Expected outcome:** Design improvements may be larger in scope. Technical changes remain small, focused, and independently verifiable. No single change should break the deploy.
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
