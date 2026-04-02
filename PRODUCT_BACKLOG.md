# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Desktop homescreen (SMI-026) is escalated as ESC-014, awaiting Scrum Master scope decision. All ready items are P4 Low code cleanup (Delivery Agent). No critical or high-priority work pending.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-176: Verplaats COMPARE_COLORS naar module scope en constants

- **ID:** PB-176
- **Title:** Verplaats COMPARE_COLORS naar module scope en constants
- **Problem / opportunity:** `COMPARE_COLORS` is defined inside the `CapacityChart` component function, creating a new array reference on every render. Also uses hardcoded hex values without referencing design tokens.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Trivial fix that improves render stability and centralizes color definitions. Combines two related recommendations.
- **Scope notes:** Move `COMPARE_COLORS` outside the component to module scope. Add comments referencing design token equivalents. Optionally move to `src/domain/constants.ts` if reuse is likely.
- **Dependencies:** None.
- **Definition of done:** `COMPARE_COLORS` is at module scope (not inside the component function). Hex values have comments referencing tokens. Verify passes.
- **Implementation note:** Combines DE-REC-047 and DE-REC-014.
- **Source:** DE-REC-047 + DE-REC-014

### PB-177: Verwijder ongebruikte type-exports uit domain/types.ts

- **ID:** PB-177
- **Title:** Verwijder ongebruikte type-exports uit domain/types.ts
- **Problem / opportunity:** `PlanningEntryOptions` and `UserContext` are defined but never imported anywhere. Dead code creates confusion.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Quick cleanup. No risk.
- **Scope notes:** Remove only types confirmed unused via grep. Do not remove types that may be used indirectly.
- **Dependencies:** None.
- **Definition of done:** Unused types removed. Verify passes. No other files affected.
- **Implementation note:** See DE-REC-041.
- **Source:** DE-REC-041

### PB-178: Opruimen ongebruikte mobiele CSS-klassen

- **ID:** PB-178
- **Title:** Opruimen ongebruikte mobiele CSS-klassen
- **Problem / opportunity:** `mobile-nav-overlay` and `mobile-nav-panel` CSS classes in globals.css are no longer used after the mobile navigation overhaul removed the hamburger menu.
- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Ready
- **Why this matters now:** Dead CSS from the mobile redesign. Quick cleanup.
- **Scope notes:** Confirm classes are unused via grep, then remove from globals.css. Do not remove any CSS class that is still referenced.
- **Dependencies:** None.
- **Definition of done:** Unused mobile-nav CSS classes removed. Verify passes.
- **Implementation note:** Flagged in Experience Agent risks/watch-outs.
- **Source:** EX-REC risks

### PB-180: StamtabelManager en SkillManager — visuele verhoging lijstitems

- **ID:** PB-180
- **Title:** StamtabelManager en SkillManager — visuele verhoging lijstitems
- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Completed
- **Completed:** 2026-04-02
- **Summary:** Replaced divide-y separator with padded container. Rows now have rounded-md shape, hover:shadow-xs elevation, and transition-all animation. Editing state has brand-50 background, brand-600 left accent border, and shadow-xs — clearly distinct from idle rows. Action icon gap widened from 1 to 1.5. Applied consistently to both StamtabelManager and SkillManager.
- **Source:** EX-REC-054

### PB-181: Capaciteitspagina — vergelijkingsknoppen visuele verbetering

- **ID:** PB-181
- **Title:** Capaciteitspagina — vergelijkingsknoppen visuele verbetering
- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Completed
- **Completed:** 2026-04-02
- **Summary:** Comparison buttons restyled as pill-shaped badges (rounded-full) with border. Inactive state: white background, border-default, text-secondary. Hover: border transitions to brand-300 and text to brand-700. Active state: solid brand-600 fill with inverse text. Transition-all for smooth toggle feedback.
- **Source:** EX-REC-055

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

### Desktop homescreen (SMI-026)

- **Status:** Blocked — awaiting Scrum Master scope decision
- **Escalation:** ESC-014
- **Summary:** Scrum Master wil een desktop startscherm. Scope en aanpak moeten gekozen worden voordat dit gepland kan worden. Zie ESC-014 voor de opties.

---

## Completed Recently

### PB-179: Fix mobiele navigatie — planning en instellingen knoppen werken niet

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Root cause: React useState functional updater bug in `useMobileTitle` hook. `setMobileBackAction(fn)` was interpreted as a functional updater, immediately executing the back action instead of storing it. Fixed by wrapping: `setMobileBackAction(() => fn)`. One-line fix in `src/hooks/useHeaderSubtitle.tsx`.

### PB-175: Mobiele chauffeurspagina — visuele opfrisbeurt

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Entrance animation and improved card spacing on mobile drivers page.

### PB-170–174: Mobiele app-ervaring compleet

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Mobile planning nav (PB-170), capacity view (PB-171), settings view (PB-172), transitions/polish (PB-173), release notes page (PB-174). Full mobile initiative delivered.

### PB-163–164: Deduplicatie consolidatie

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01
- **Summary:** resolveUserId (PB-163) and validateApiFields (PB-164) deduplicated to shared modules.

---

## Deferred

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first.

### EX-REC-053: Mobiel startscherm — begroeting en scenario-context

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-effort personalization enhancement. Can be combined with any future mobile work cycle.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Most visible remaining desktop integration gap. Low risk but no user demand driving it.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Only relevant if narrow desktop viewport usage is reported.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No user impact. Pick up when capacity allows.

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor optimization. Low urgency.

### DE-REC-063: weeklyHours range validation on roster assignment routes

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Trivial validation gap on a single numeric field. Near-zero risk.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick optimization but not user-facing.

### DE-REC-065: API response data path configuration

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural Phase 1 follow-up but not blocking.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Partially addressed by PB-176.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-182.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
