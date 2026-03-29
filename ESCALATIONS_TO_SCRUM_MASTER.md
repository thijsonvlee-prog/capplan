# Escalations to Scrum Master

## Purpose

This file is the formal decision log for unresolved product, scope, UX, and technical choices that agents cannot or should not decide autonomously.

The workflow is:

1. The Product Owner Agent (or any agent) presents a decision in multiple-choice format.
2. The Scrum Master responds by placing `(X)` next to exactly one option.
3. The Product Owner Agent treats that choice as the approved decision.
4. The Product Owner Agent translates the choice into backlog planning and execution in `PRODUCT_BACKLOG.md`.

This file is **not** a generic issue list or scratchpad. Every entry must be a concrete decision with clear options.

## Status Definitions

- **Open**: Decision is waiting for the Scrum Master to choose an option.
- **Chosen**: The Scrum Master has selected an option. Awaiting translation into backlog planning.
- **Planned**: The choice has been translated into backlog items in `PRODUCT_BACKLOG.md`.
- **Closed**: Decision is fully resolved and executed. No further action needed.

## Open Escalations

_No open escalations._

---

## Closed Escalations

### ESC-004: Custom date picker — scope and approach

- **Status:** Closed
- **Date / run context:** 2026-03-29 — triggered by SMI-006
- **Decision needed:** How should the custom date picker be scoped?
- **Chosen option:** Option B — Styled date input wrapper.
- **Product Owner action:** PB-039 completed. SMI-006 closed.

### ESC-003: Planning grid visual redesign — scope and phasing

- **Status:** Closed
- **Date / run context:** 2026-03-29 — triggered by SMI-004 and EX-REC-016
- **Decision needed:** How should the planning grid visual redesign be scoped and phased?
- **Chosen option:** Option B — Phased redesign across 3 cycles. All three phases completed.
- **Product Owner action:** All three phases completed.

### ESC-001: Define MVP scope for connectivity hub

- **Status:** Closed
- **Date / run context:** 2026-03-29 — triggered by SMI-001
- **Decision needed:** What should the MVP scope be for the connectivity hub initiative?
- **Chosen option:** Option A — Configuration-first MVP (CSV only, field mapping UI, no scheduled execution)
- **Product Owner action:** Created PB-015 (data model + API) and PB-016 (admin screen UI) as phased backlog items for future cycles.

### ESC-002: Conflicting driver status computation between views

- **Status:** Closed
- **Date / run context:** 2026-03-29 — blocking PB-003
- **Decision needed:** Which computation of driver active/inactive status is authoritative?
- **Chosen option:** Option A — Employment-based status
- **Product Owner action:** PB-003 completed. Regression fixed via PB-025. Both done.

## Escalation Rules

- Prefer multiple-choice decisions over open-ended questions. Present 3-5 clear options.
- Always include one recommended option with a brief justification.
- Keep context short and decision-oriented. Avoid long narrative explanations.
- The Scrum Master should only need to place `(X)` next to one option to make a decision.
- After a choice is made, the Product Owner Agent must translate it into execution planning in `PRODUCT_BACKLOG.md`.
- Escalations move through the status flow: Open → Chosen → Planned → Closed. Do not leave items open indefinitely.
- Any agent can create an escalation, but the Product Owner Agent is responsible for formatting it correctly.
- IDs are sequential (ESC-001, ESC-002, ...) and never reused.
- Blocked backlog items must reference the relevant escalation ID.
- Do not use this file for minor questions or preferences. Escalate only when work is genuinely blocked or a cross-cutting decision is required.
