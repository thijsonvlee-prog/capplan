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

### ESC-003: Planning grid visual redesign — scope and phasing

- **Status:** Open
- **Date / run context:** 2026-03-29 — triggered by SMI-004 (bigger design steps directive) and EX-REC-016
- **Decision needed:** How should the planning grid visual redesign be scoped and phased?
- **Why it matters:** The planning grid is the core product surface and the largest gap between the current UI and the DESIGN.md standard. However, `PlanningGrid.tsx` is ~650 lines, the most complex component in the codebase, and CLAUDE.md explicitly says "handle with extreme care." A full visual redesign in one pass carries significant regression risk. The Scrum Master has directed bigger design steps (SMI-004), but this specific component requires careful scoping.
- **Recommendation from Product Owner Agent:** Option B — phased redesign that delivers visible progress per cycle while managing risk.

**Choose one option:**

- ( ) **Option A — Full redesign in one cycle**
  Redesign the entire planning grid visual structure (cells, rows, headers, summaries, group rows) in a single cycle. Maximum alignment with DESIGN.md in one step. High risk: touches the most complex component extensively, difficult to verify, high regression potential.

- ( ) **Option B — Phased redesign across 2-3 cycles** *(recommended)*
  Phase 1: Surface layering and row tonal hierarchy (replace border-heavy structure with tonal contrast, differentiate header/data/group/totals rows). Phase 2: Row composition and identity (improve how driver name, metadata, and planning cells relate). Phase 3: Cell rendering and status refinement (DayCell visual output, spacing, chip treatment). Each phase is independently deployable and verifiable.

- ( ) **Option C — Surface-only quick pass**
  Only replace the most visible border-heavy patterns with tonal contrast. Minimal scope, minimal risk. Leaves row composition and cell rendering unchanged. Fastest but least aligned with DESIGN.md ambitions.

- ( ) **Option D — Defer planning grid redesign, prioritize other screens first**
  Apply DESIGN.md improvements to settings, capacity, and other simpler screens first. Build confidence and patterns before touching the most complex component. Planning grid redesign follows in a later cycle.

**Trade-offs:**
- Option A: Maximum speed, maximum risk. One broken deploy could set back the planning screen.
- Option B: Balanced progress. Each phase delivers visible improvement. Manageable review scope per cycle.
- Option C: Safe but underwhelming given the SM directive for bigger steps.
- Option D: Lowest risk but delays the highest-impact design improvement.

**What the Scrum Master must do:** Place `(X)` next to exactly one option.

**Product Owner action after choice:** Translate chosen option into concrete backlog items with clear scope per phase.

---

## Chosen / Awaiting Planning

_None._

## Closed Escalations

### ESC-001: Define MVP scope for connectivity hub

- **Status:** Planned
- **Date / run context:** 2026-03-29 — triggered by SMI-001
- **Decision needed:** What should the MVP scope be for the connectivity hub initiative?
- **Chosen option:** Option A — Configuration-first MVP (CSV only, field mapping UI, no scheduled execution)
- **Product Owner action:** Created PB-015 and PB-016 as phased backlog items.

### ESC-002: Conflicting driver status computation between views

- **Status:** Closed
- **Date / run context:** 2026-03-29 — blocking PB-003
- **Decision needed:** Which computation of driver active/inactive status is authoritative?
- **Chosen option:** Option A — Employment-based status
- **Product Owner action:** PB-003 completed. Regression fixed via PB-025 (completed). Both are done.

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
