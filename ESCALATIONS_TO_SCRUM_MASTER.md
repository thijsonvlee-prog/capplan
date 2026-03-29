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

### ESC-001: Define MVP scope for connectivity hub

- **Status:** Open
- **Date / run context:** 2026-03-29 — triggered by SMI-001 in `SCRUM_MASTER_INPUT.md`
- **Decision needed:** What should the MVP scope be for the connectivity hub initiative?
- **Why it matters:** The connectivity hub is a large initiative. Without a clear MVP boundary, there is a risk of overbuilding or delivering something too narrow to be useful. Agents need a defined scope before any planning or implementation can begin.
- **Recommendation from Product Owner Agent:** Option A — start with configuration and manual import only. This is the lowest-risk path that delivers immediate value and can be extended later.

#### Choose one option

> Place `(X)` next to exactly one option.

- [ ] **Option A — Configuration-first MVP**
  - Scope: Admin screen to configure import sources (CSV only). Field mapping UI. No scheduled execution.
  - Impact: Planners can import driver/employment data from CSV files. Fast to build, low risk. Foundation for future API support.

- [ ] **Option B — Configuration + execution MVP**
  - Scope: Everything in Option A, plus a manual "run import" action that processes the configured source and creates/updates records.
  - Impact: End-to-end import flow in one release. More useful immediately, but larger scope and more error handling needed.

- [ ] **Option C — Full integration management MVP**
  - Scope: Everything in Option B, plus scheduled imports, import history/logs, and conflict resolution UI.
  - Impact: Production-ready integration platform. Significantly larger effort. Risk of destabilizing core workflows during development.

- [ ] **Option D — Do not prioritize now**
  - Scope: Defer the connectivity hub entirely. Focus current cycles on stabilizing existing workflows.
  - Impact: No new capability. Frees up capacity for reliability and UX improvements. Revisit in a future cycle.

- **Recommended option:** Option A
- **Trade-offs:** Option A delivers the least functionality but carries the lowest risk and respects the incremental improvement constraint (SMI-002). Options B and C deliver more but increase scope and risk. Option D is safe but delays a strategic initiative.
- **What the Scrum Master must do:** Place `(X)` next to one option above.
- **Product Owner action after choice:** Translate the chosen scope into backlog items in `PRODUCT_BACKLOG.md`, link back to SMI-001, and update this escalation status to `Chosen`.

## Chosen / Awaiting Planning

_None yet._

## Closed Escalations

_None yet._

## Escalation Rules

- Prefer multiple-choice decisions over open-ended questions. Present 3-5 clear options.
- Always include one recommended option with a brief justification.
- Keep context short and decision-oriented. Avoid long narrative explanations.
- The Scrum Master should only need to place `(X)` next to one option to make a decision.
- After a choice is made, the Product Owner Agent must translate it into execution planning in `PRODUCT_BACKLOG.md`.
- Escalations move through the status flow: Open → Chosen → Planned → Closed. Do not leave items open indefinitely.
- Any agent (Experience Agent, Delivery Agent, Product Owner Agent) can create an escalation, but the Product Owner Agent is responsible for formatting it correctly.
- IDs are sequential (ESC-001, ESC-002, ...) and never reused.
- Blocked backlog items must reference the relevant escalation ID.
- Do not use this file for minor questions or preferences. Escalate only when work is genuinely blocked or a cross-cutting decision is required.
