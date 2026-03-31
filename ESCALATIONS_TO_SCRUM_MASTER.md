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

## Planned Escalations

### ESC-013: Mobiele versie — scope en aanpak

- **Status:** Planned
- **Date / run context:** 2026-03-31 — triggered by SMI-019
- **Chosen option:** Option B — Selectieve mobiele weergaven. Maak 2-3 kernschermen mobielvriendelijk: chauffeurlijst met zoeken, individueel chauffeurprofiel, en dag-/weekplanning per chauffeur. Planningsrooster en instellingen blijven desktop-only.
- **Backlog linkage:** PB-154, PB-155, PB-156
- **Product Owner action:** Broken into 3 phased backlog items. PB-154 ✓, PB-155 ✓ completed. PB-156 ready for next cycle (final phase).

---

## Closed Escalations

### ESC-012: API management — scope en fasering

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by SMI-018
- **Chosen option:** Option B — Fase 1: Uitgaande API-connecties.
- **Backlog linkage:** PB-150, PB-151, PB-152, PB-153, PB-158, PB-159 (all completed 2026-03-31)
- **Resolution:** All Phase 1 items delivered and deployed. SMI-018 closed.

### ESC-011: Audittrail op stamdata — aanpak en scope

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by SMI-017
- **Chosen option:** Option B — Aparte audit-logtabel.
- **Backlog linkage:** PB-146, PB-147, PB-148, PB-149 (all completed 2026-03-31)
- **Resolution:** All 4 phases delivered and deployed.

### ESC-010: sickPercentage maximumwaarde — 99 of 100

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by DE-REC-051
- **Resolution:** Option A chosen. PB-139 completed.

### ESC-009: POC capaciteitssamenvatting in planningsrooster — behouden of verwijderen

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by DE-REC-038
- **Resolution:** Option B chosen. CapacitySummaryRow removed. PB-129 completed.

### ESC-008: Gebruikersgroepen met autorisatiefilters — scope en fasering

- **Status:** Closed
- **Chosen option:** Option A — Minimal MVP with Afdeling as filter criterion.
- **Backlog linkage:** PB-109, PB-110, PB-111 (all completed).

### ESC-007: Virtual scrolling approach for 1000-driver planning grid

- **Status:** Closed
- **Chosen option:** Option A — Manual table virtualization.
- **Backlog linkage:** PB-096 (completed).

### ESC-006: Server error — Vercel environment verification

- **Status:** Closed
- **Chosen option:** Option B — Verify Vercel environment.
- **Backlog linkage:** PB-088.

### ESC-005: Authentication approach for user management

- **Status:** Closed
- **Chosen option:** Option B — NextAuth.js with external provider.
- **Backlog linkage:** PB-080, PB-081, PB-079, PB-082 (all completed).

### ESC-004: Custom date picker — scope and approach

- **Status:** Closed
- **Chosen option:** Option B — Styled date input wrapper.
- **Backlog linkage:** PB-039 (completed).

### ESC-003: Planning grid visual redesign — scope and phasing

- **Status:** Closed
- **Chosen option:** Option B — Phased redesign. All completed.

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
