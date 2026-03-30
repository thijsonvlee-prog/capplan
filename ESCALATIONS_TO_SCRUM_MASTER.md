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

### ESC-005: Authentication approach for user management

- **Status:** Open
- **Date / run context:** 2026-03-30 — triggered by SMI-008 (focus on functionality: admin panel with user management)
- **Decision needed:** Which authentication approach should CapPlan use to enable user management and role enforcement?
- **Why it matters:** The Scrum Master wants an admin panel with user management. The database already has a User model with roles (ADMIN, PLANNER, VIEWER), but no authentication or authorization is implemented. Building user CRUD and role enforcement requires choosing an auth strategy first. This is an architectural decision that affects the entire application.
- **Choose one option:**
  - ( ) **Option A — NextAuth.js (Auth.js) with credentials provider.** Self-hosted, no external dependency. Login with email/password stored in the CapPlan database. Simple to implement, full control. Requires building password hashing, session management. No SSO.
  - ( ) **Option B — NextAuth.js with external provider (Google/Microsoft).** Same library but delegates identity to an external provider. No password management needed. Requires users to have Google/Microsoft accounts. Good for organizations already on Microsoft 365.
  - ( ) **Option C — Clerk or similar managed auth service.** Hosted authentication with pre-built UI components. Fastest to implement. Adds an external dependency and potential cost. Pre-built user management dashboard.
  - ( ) **Option D — Simple session-based auth (custom).** Minimal custom implementation: login form, bcrypt passwords, HTTP-only session cookie. No library dependency. Full control but more manual work. No SSO or social login.
- **Recommended option:** Option A (NextAuth.js with credentials). It balances simplicity, control, and extensibility. Can add external providers later if needed. Well-documented for Next.js App Router. No external service dependency.
- **Trade-offs:** Option A/D require password management (hashing, reset flow). Option B/C reduce implementation effort but add external dependencies. Option C adds recurring cost.
- **What the Scrum Master must do:** Place `(X)` next to exactly one option.
- **Product Owner action after choice:** Create phased backlog items: auth infrastructure → login page → user CRUD admin screen → role enforcement middleware.

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
