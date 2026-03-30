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

### ESC-008: Gebruikersgroepen met autorisatiefilters — scope en fasering

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-015
- **Chosen option:** Option A — Minimal MVP with single-dimension filter, modified to use **Afdeling (Department)** as the filter criterion instead of Werkgever (Employer).
- **Scrum Master note:** "maar laat 'afdeling' het filtercriterium zijn"
- **Backlog linkage:** PB-109 (data model + API, Phase 1), PB-110 (admin UI, Phase 2), PB-111 (enforcement, Phase 3).
- **Product Owner action:** Broken into 3 phased backlog items. Phase 1 (PB-109) is ready for the Delivery Agent. Phase 2 (PB-110) assigned to Experience Agent, blocked on PB-109. Phase 3 (PB-111) assigned to Delivery Agent, blocked on PB-110.

### ESC-007: Virtual scrolling approach for 1000-driver planning grid

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-011
- **Chosen option:** Option A — Use `react-window` library. (Implementation chose manual table virtualization instead to preserve table structure; approved approach, same outcome.)
- **Backlog linkage:** PB-096 (completed).

### ESC-006: Server error — Vercel environment verification

- **Status:** Closed
- **Chosen option:** Option B — Auth is needed. Verify Vercel environment.
- **Backlog linkage:** PB-088.

### ESC-005: Authentication approach for user management

- **Status:** Closed
- **Chosen option:** Option B — NextAuth.js with external provider (Google/Microsoft).
- **Backlog linkage:** PB-080, PB-081, PB-079, PB-082 (all completed).

### ESC-004: Custom date picker — scope and approach

- **Status:** Closed
- **Chosen option:** Option B — Styled date input wrapper.
- **Backlog linkage:** PB-039 (completed).

### ESC-003: Planning grid visual redesign — scope and phasing

- **Status:** Closed
- **Chosen option:** Option B — Phased redesign across 3 cycles. All completed.

### ESC-001: Define MVP scope for connectivity hub

- **Status:** Closed
- **Chosen option:** Option A — Configuration-first MVP.
- **Backlog linkage:** PB-015, PB-016 (completed).

### ESC-002: Conflicting driver status computation between views

- **Status:** Closed
- **Chosen option:** Option A — Employment-based status.
- **Backlog linkage:** PB-003, PB-025 (completed).

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
