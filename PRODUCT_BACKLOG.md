# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Mobile app redesign initiative (SMI-024) is complete. All phases delivered: homescreen (PB-169), planning nav integration (PB-170), capacity view (PB-171), settings view (PB-172), and transitions/polish (PB-173). Release notes page (SMI-025/PB-174) also complete. All desktop features remain stable. Next mobile improvement opportunity: edit capability (EX-REC-052, deferred).

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items ready for next cycle._

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-170: Mobiele planning — aanpassen aan nieuwe navigatie

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Mobile planning view now integrates with the homescreen navigation. Header shows "Planning" title with back arrow when in planning mode via new `useMobileTitle` context hook. Removed redundant Home button from driver selector. Smooth entrance animation between homescreen and planning view.

### PB-171: Mobiele capaciteitsweergave

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Capacity page is now mobile-optimized. Controls stack vertically on mobile. Chart height adapts to screen size (250px mobile, 350px desktop). Period selector label truncates instead of overflowing. KPI cards use 2-column grid on mobile. Scenario compare controls hidden on mobile for clarity.

### PB-172: Mobiele instellingenweergave

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Settings page uses card-based section selector on mobile instead of horizontal tabs. Each section card shows icon, title, description, and count badge. Tapping a section opens its content with the section title in the header and back arrow via `useMobileTitle`. Desktop layout unchanged.

### PB-173: Mobiele app-feel — transities en polish

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Added entrance animations (fade + slide-up) across all mobile screen transitions via `mobile-page-enter` CSS class. All tap targets meet 44px minimum on mobile (back button enlarged to 2.75rem, btn-icon gets min-size on mobile). Consistent spacing and touch interaction quality across all mobile screens.

### PB-169: Mobiel homescreen met kaartnavigatie en terugknop

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** Card-based mobile homescreen with hero Planning card, 2-column section grid, back button on subpages. Hamburger menu removed on mobile. Desktop unchanged.

### PB-174: Documentatiepagina vervangen door releasenotes-pagina

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Summary:** `/documentatie` replaced with chronological release notes viewer. Collapsible date sections, category badges. Sidebar label updated to "Releasenotes".

### PB-168: Fix mobiele sidebar sluit direct bij openen

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-165: Fix mobiele hamburger-menu (z-index bug)

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-166: Fix uitlijning vergrootglas in zoekbalken

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-167: Mobiele planning omzetten naar maandkalenderweergave

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01

### PB-163: Deduplicate resolveUserId naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

### PB-164: Deduplicate validateApiFields naar gedeelde module

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-01

---

## Deferred

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first. Can be picked up after PB-170 is done.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** May be addressed as part of PB-171 (mobile capacity view). Otherwise low-priority cosmetic.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Mobile has its own layout. Only relevant if narrow desktop viewport usage is reported.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No user impact. Pick up when capacity allows.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014, DE-REC-030, DE-REC-047.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

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

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement. May be addressed during mobile polish (PB-173).

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

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
- Backlog IDs are sequential and never reused. Next available: PB-175.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
