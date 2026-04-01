# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** Major mobile app redesign initiative (SMI-024). The Scrum Master has directed a full mobile UX overhaul: homescreen with card-based navigation, remove hamburger menu, add back button, app-like feel. Budget: 10 cycles. Additionally, the documentation page must be replaced with a release notes page (SMI-025). All desktop features remain stable. The mobile initiative is the primary work stream for the foreseeable future.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

### PB-170: Mobiele planning — aanpassen aan nieuwe navigatie

### PB-170: Mobiele planning — aanpassen aan nieuwe navigatie

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** After PB-169, the mobile planning view needs to integrate with the new homescreen navigation pattern. The current MobilePlanningView may need header/navigation adjustments to include the back button and match the new app-like feel.
- **Why this matters now:** Part of mobile initiative (SMI-024). Planning is the most-used screen and must feel polished in the new navigation paradigm.
- **Scope notes:**
  - Ensure the mobile planning page has a consistent header with back/home button from PB-169.
  - Review and refine the month calendar view to fit the app-like feel.
  - Ensure smooth transitions from homescreen to planning and back.
  - Do not add edit capability yet (deferred to EX-REC-052).
- **Dependencies:** PB-169
- **Definition of done:** Planning page integrates cleanly with new mobile nav. Back button works. Visual consistency with homescreen. `npm run verify` passes.
- **SMI linkage:** SMI-024

### PB-171: Mobiele capaciteitsweergave

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The capacity page currently renders its desktop layout on mobile. Charts and KPI modules need mobile-optimized layouts.
- **Why this matters now:** Part of mobile initiative (SMI-024). With the homescreen linking to capacity, the page must be usable on mobile.
- **Scope notes:**
  - Create a mobile-optimized layout for the capacity page.
  - KPI cards should stack vertically on mobile.
  - Chart should be responsive or simplified for small screens.
  - Filters should be mobile-friendly (stacked, full-width).
  - Back/home button per PB-169 pattern.
- **Dependencies:** PB-169
- **Definition of done:** Capacity page is usable on mobile with proper layout. KPIs and chart display correctly. Back button works. `npm run verify` passes.
- **SMI linkage:** SMI-024

### PB-172: Mobiele instellingenweergave

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** The settings page uses horizontal tabs and complex forms that don't work well on mobile. With 7 tabs, the current horizontal scroll pattern is adequate on desktop but cramped on mobile.
- **Why this matters now:** Part of mobile initiative (SMI-024). Settings is admin-only but should still be usable on mobile.
- **Scope notes:**
  - Create a mobile-optimized settings layout — consider vertical tab list or card-based section selector.
  - Forms within each tab should be full-width and touch-friendly.
  - StamtabelManager tables should be readable on mobile.
  - Back/home button per PB-169 pattern.
- **Dependencies:** PB-169
- **Definition of done:** Settings page is navigable and usable on mobile. Tabs/sections accessible. Forms functional. Back button works. `npm run verify` passes.
- **SMI linkage:** SMI-024

### PB-173: Mobiele app-feel — transities en polish

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Ready
- **Problem / opportunity:** To truly feel like a native app, the mobile experience needs smooth transitions between screens, consistent motion design, and polished touch interactions.
- **Why this matters now:** Final phase of mobile initiative (SMI-024). The SM explicitly wants it to "feel like an app." This item covers the polish layer.
- **Scope notes:**
  - Add page transition animations (slide-in/out or fade) between homescreen and subpages.
  - Ensure all tap targets meet mobile guidelines (min 44px).
  - Review and refine spacing, padding, and touch interactions across all mobile screens.
  - Consider adding a subtle loading state between page transitions.
  - Test across all mobile screens for visual consistency.
- **Dependencies:** PB-169, PB-170, PB-171, PB-172
- **Definition of done:** Mobile experience has smooth transitions, consistent spacing, polished interactions. Feels like a native app, not a responsive website. `npm run verify` passes.
- **SMI linkage:** SMI-024

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

_No blocked items._

---

## Completed Recently

### PB-169: Mobiel homescreen met kaartnavigatie en terugknop

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Created `MobileHomescreen.tsx` with card-based navigation (hero Planning card with brand gradient, 2-column grid for Capaciteit, Chauffeurs, Instellingen, Releasenotes). Removed hamburger menu and slide-over sidebar on mobile. Header shows CapPlan branding on mobile homescreen, back arrow on subpages. MobilePlanningView receives `onBackToHome` callback with Home icon button. Desktop unchanged. `npm run verify` passes.

### PB-174: Documentatiepagina vervangen door releasenotes-pagina

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Replaced `/documentatie` page with a chronological release notes viewer. Structured data array with collapsible date sections, category badges (UX, Functioneel, Beveiliging, etc.), and bullet lists. Sidebar label updated from "Documentatie" to "Releasenotes". Homescreen card links to `/documentatie`. Page title updated in Header. All content in Dutch. `npm run verify` passes.

### PB-168: Fix mobiele sidebar sluit direct bij openen (useEffect mount-bug)

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Added `useRef` mount guard in `Sidebar.tsx` to skip the `onClose()` call on initial mount. The useEffect now only triggers `onClose()` when `pathname` actually changes after the first render. Desktop behavior unchanged. `npm run verify` passes.

### PB-165: Fix mobiele hamburger-menu (z-index bug)

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-01
- **Implementation note:** Added `relative z-50` to header element in `Header.tsx`. Partial fix — z-index was correct but a separate mount-trigger bug in Sidebar.tsx remained. See PB-168 for the full fix.

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
