# Escalations to Scrum Master

## Purpose

This file tracks decisions and blockers that agents cannot resolve independently. Any agent (Experience Agent, Delivery Agent, Product Owner Agent) can add an escalation. The Scrum Master reviews and resolves escalations, then updates the status here.

## Open Escalations

### ESC-001: Conflicting driver status computation between views

- **Date / run context:** 2026-03-29
- **Title:** Driver active/inactive status computed differently in planning grid vs. driver list
- **Decision needed:** Which computation of driver active/inactive status is authoritative?
- **Why it matters:** Planners see different driver counts depending on which screen they use. This undermines trust in the data and creates confusion during shift planning.
- **Options considered:**
  - Option A: Use the planning grid logic (based on active employment records with date overlap) as the single source of truth.
  - Option B: Use the driver list logic (based on the `isActive` field on the Driver model) as the single source of truth.
  - Option C: Combine both — require an active employment record AND `isActive = true`.
- **Recommended option:** Option A — employment-based status is more accurate and automatically reflects contract changes without manual toggling.
- **Consequences / trade-offs:** Option A requires updating the driver list page to use the same computation. The `isActive` field on Driver may become redundant.
- **Proposed next step:** Scrum Master decides on the correct approach. Once resolved, unblock PB-003 in `PRODUCT_BACKLOG.md`.
- **Status:** Open

## Resolved Escalations

_No resolved escalations yet._

## Escalation Rules

- Any agent can create an escalation when a decision is needed that is outside their authority.
- Each escalation must include all required fields.
- IDs are sequential (ESC-001, ESC-002, ...) and never reused.
- The Scrum Master resolves escalations by updating the `Status` to `Resolved` and adding a decision note.
- Resolved escalations are moved to the `Resolved Escalations` section with the decision documented.
- Blocked backlog items must reference the relevant escalation ID.
- Do not use this file for minor questions or preferences. Escalate only when work is genuinely blocked or a cross-cutting decision is required.
