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

### ESC-008: Gebruikersgroepen met autorisatiefilters — scope en fasering

- **Status:** Open
- **Date / run context:** 2026-03-30 — triggered by SMI-015
- **Decision needed:** The Scrum Master requests user group management with authorization filters (data visibility, not functionality). This is a significant new feature with no existing code. Before implementation can start, we need clarity on scope and phasing.

- **Why it matters:** User groups with data filters add row-level security across the application. This touches the data model (new tables), every data-fetching API route (filter enforcement), and the admin UI (group management). Getting the scope right upfront prevents rework.

- **Key questions:**
  1. Which data dimensions should be filterable per group? (e.g., Werkgever/Employer, Afdeling/Department, Locatie/Location, or all three?)
  2. Should a user belong to exactly one group, or multiple groups?
  3. Should filter enforcement apply to all data views (planning, drivers, capacity, settings) or only specific screens?

- **Choose one option:**

  - ( ) **Option A — Minimal MVP: Single-dimension filter (Werkgever only)** (X) maar laat 'afdeling' het filtercriterium zijn
    - Data model: UserGroup with a name and a list of allowed Werkgever IDs. Users are assigned to one group.
    - Enforcement: API routes for drivers, planning, and capacity filter by the user's group Werkgever IDs. Settings/stamtabellen remain unfiltered.
    - UI: New "Gebruikersgroepen" tab in settings (admin only) to create groups, assign werkgevers, and assign users.
    - Phasing: 2 cycles (Phase 1: data model + API + admin UI, Phase 2: enforcement on data routes).
    - Trade-off: Fast to deliver, but may need extension later if more filter dimensions are needed.

  - ( ) **Option B — Multi-dimension filter (Werkgever + Afdeling + Locatie)**
    - Data model: UserGroup with filter rules per dimension (werkgever IDs, afdeling IDs, locatie IDs). Users assigned to one group. Filters are AND-combined (user sees drivers matching ALL active filter dimensions).
    - Enforcement: All data-fetching routes (drivers, planning, capacity) apply group filters. Settings/stamtabellen remain unfiltered.
    - UI: Group management with multi-select per dimension.
    - Phasing: 3 cycles (Phase 1: data model + API, Phase 2: admin UI, Phase 3: enforcement).
    - Trade-off: More flexible but significantly more complex. Filter combinations need careful testing.

  - ( ) **Option C — Multi-dimension filter with multi-group membership**
    - Same as Option B, but users can belong to multiple groups. Effective filter is the union of all group filters (user sees data from ANY of their groups).
    - Phasing: 3-4 cycles.
    - Trade-off: Maximum flexibility, highest complexity. Only justified if real use cases require users to span multiple organizational units.

- **Recommended option:** Option A. Start simple with Werkgever-only filtering. This covers the most common organizational boundary. Extend to more dimensions later if needed — the data model can be evolved without breaking changes.

- **What the Scrum Master must do:** Place `(X)` next to exactly one option above.

- **Product Owner action after choice:** Break the chosen option into phased backlog items (data model, API, UI, enforcement) with clear definitions of done. Assign Phase 1 to Delivery Agent (data model + API), subsequent phases split between agents.

---

## Closed Escalations

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
