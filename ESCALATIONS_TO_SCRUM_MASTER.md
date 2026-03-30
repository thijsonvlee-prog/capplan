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

### ESC-007: Virtual scrolling approach for 1000-driver planning grid

- **Status:** Open
- **Date / run context:** 2026-03-30 — triggered by SMI-011 (1000-driver scaling initiative)
- **Decision needed:** The planning grid renders all driver rows in the DOM. At 1000 drivers this causes severe scroll jank and multi-second render delays. Virtual scrolling (rendering only visible rows) is needed. The question is whether to use an external library or build it manually.
- **Why it matters:** This is the single biggest frontend bottleneck for the scaling initiative. The backend pagination (PB-093) is ready to proceed, but the frontend cannot consume paginated data efficiently without virtual scrolling. PB-096 and PB-097 are blocked on this decision.
- **Recommendation from Product Owner Agent:** Option A. `react-window` is tiny (6KB), battle-tested, widely used, and the manual alternative would be fragile and time-consuming to build correctly for a complex table with sticky headers, group rows, and horizontal scroll.

**Choose one option:**

- ( ) **Option A — Use `react-window` library** (recommended)
  - Add `react-window` (~6KB gzipped) as a dependency
  - Well-maintained, proven at scale, minimal bundle impact
  - Handles the windowing math; Experience Agent focuses on integration with PlanningGrid
  - Trade-off: Introduces one new external dependency (CLAUDE.md requires explicit approval)

- ( ) **Option B — Use `react-virtuoso` library**
  - Add `react-virtuoso` (~15KB gzipped) as a dependency
  - More feature-rich (auto-sizing rows, grouped items, sticky headers built-in)
  - Better fit for variable-height rows and group headers in PlanningGrid
  - Trade-off: Larger bundle size, more opinionated API

- ( ) **Option C — Manual implementation with IntersectionObserver**
  - No new dependencies
  - Use CSS `overflow` container + IntersectionObserver to lazy-render row batches
  - Trade-off: Significantly more implementation effort, harder to get right for complex table with sticky headers and horizontal scroll, higher risk of regressions

- ( ) **Option D — Defer virtual scrolling, use pagination-only approach**
  - No virtual scrolling. Use server-side pagination with page controls (e.g., show 100 drivers per page)
  - Trade-off: Simpler but changes the UX significantly — planners can no longer see/scroll through all drivers in one view. May require a "load more" or page navigation pattern.

- **What the Scrum Master must do:** Place `(X)` next to exactly one option.
- **Product Owner action after choice:** Unblock PB-096 and PB-097. Update implementation notes with the chosen approach. If Option A or B, add the dependency to the project.

---

## Closed Escalations

### ESC-006: Server error — Vercel environment verification

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-009
- **Decision needed:** Whether auth is needed and whether Vercel environment should be verified.
- **Chosen option:** Option B — Auth is needed. Verify Vercel environment. Ensure `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and at least one provider credential pair are set correctly in Vercel.
- **Product Owner action:** Created PB-088 (auth environment setup documentation) to provide clear setup guidance. PB-084 (role-aware UI) already scheduled to complete the auth UX.
- **Backlog linkage:** PB-088, PB-084.

### ESC-005: Authentication approach for user management

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-008
- **Decision needed:** Which authentication approach should CapPlan use to enable user management and role enforcement?
- **Chosen option:** Option B — NextAuth.js with external provider (Google/Microsoft).
- **Product Owner action:** Created phased backlog items: PB-080 (auth infrastructure — completed), PB-081 (login page — completed), PB-079 (admin user management — completed), PB-082 (role enforcement — completed).
- **Backlog linkage:** PB-080, PB-081, PB-079, PB-082.

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
