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

### ESC-006: Server error — Vercel environment verification

- **Status:** Open
- **Date / run context:** 2026-03-30 — triggered by SMI-009
- **Decision needed:** The server error reported in SMI-009 was caused by the auth middleware crashing when `NEXTAUTH_SECRET` is not set. The code fix is deployed (PB-087). However, if the error persists, the Vercel environment may need verification.
- **Why it matters:** If the Scrum Master intends to use authentication, the OAuth provider credentials must be correctly configured. If not, the fix ensures the app works without auth.
- **Choose one option:**
  - ( ) **Option A — Auth is not needed yet.** The middleware fix (PB-087) should resolve the error. No further action required. The app will work without authentication.
  - ( ) **Option B — Auth is needed. Please verify Vercel environment.** Ensure the following environment variables are set correctly in Vercel: `NEXTAUTH_SECRET` (any random string), `NEXTAUTH_URL` (the deployed URL, e.g. `https://capplan.vercel.app`), `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (from Google Cloud Console), or `AZURE_AD_CLIENT_ID` + `AZURE_AD_CLIENT_SECRET` + `AZURE_AD_TENANT_ID` (from Azure portal). At least one provider pair is required.
  - ( ) **Option C — The error persists after deployment.** Share the Vercel function logs so the Delivery Agent can diagnose further.
- **Recommended option:** Option A — most likely the fix resolves the issue. Auth can be enabled later when provider credentials are configured.
- **What the Scrum Master must do:** Place `(X)` next to one option. If Option B, verify the listed environment variables in Vercel.
- **Product Owner action after choice:** If A, close the escalation. If B, create a backlog item for auth environment verification documentation. If C, create a P1 diagnostic item for Delivery Agent.

---

## Closed Escalations

### ESC-005: Authentication approach for user management

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-008
- **Decision needed:** Which authentication approach should CapPlan use to enable user management and role enforcement?
- **Chosen option:** Option B — NextAuth.js with external provider (Google/Microsoft). Delegates identity to an external provider. No password management needed. Good for organizations already on Microsoft 365.
- **Product Owner action:** Created phased backlog items: PB-080 (auth infrastructure — completed), PB-081 (login page — ready), PB-079 (admin user management — blocked on PB-081), PB-082 (role enforcement — ready). PB-080 delivered. Remaining items are in backlog with clear sequencing.
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
