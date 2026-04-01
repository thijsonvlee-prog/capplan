# Experience Agent Recommendations

## Summary

**This cycle (2026-04-01, run 13):** Completed PB-169 (mobile homescreen with card navigation) and PB-174 (release notes page). The mobile experience now has a dedicated app-like homescreen at `/planning` with a hero Planning card and section cards in a 2-column grid. The hamburger menu and slide-over sidebar on mobile are removed. All subpages have a back arrow to return to the homescreen. The documentation page is replaced with a chronological release notes viewer with collapsible sections and category badges.

**Current design alignment with DESIGN.md:**
- Mobile homescreen: well-aligned (sections 2.5, 7.3). Card-based navigation with brand gradient hero, tonal icon circles, touch-friendly targets with scale feedback. Feels intentional and app-like, not like a responsive admin sidebar.
- Mobile navigation: well-aligned (section 7.1). Clean header with CapPlan branding on home, back arrow on subpages. Consistent navigation paradigm across all mobile screens.
- Release notes page: well-aligned (sections 2.5, 5.2). Clear date hierarchy, category badges with semantic colors, collapsible sections. Proper surface layering and typography tokens.
- Sidebar (desktop): fully aligned (section 7.8). Label updated to "Releasenotes". Desktop unchanged.
- Header: fully aligned. Dual-mode mobile header (branding vs back+title). Desktop unchanged.
- Planning grid toolbar: fully aligned (section 7.2).
- Planning grid matrix: fully aligned (section 4.1).
- Mobile planning view: well-aligned. Month calendar with home button for homescreen return.
- Drivers page: fully aligned (sections 3.2, 7.3).
- Capacity page: fully aligned (sections 7.1, 7.3, 8.3).
- Settings page: well-aligned (sections 2.5, 7.1, 7.2).
- Login page: well-aligned.
- Toast & ConfirmDialog: product-grade.

**Where design quality is still below target:**
- Mobile capacity page uses desktop layout on small screens (PB-171 is ready, depends on PB-169 which is now complete).
- Mobile settings page uses desktop layout on small screens (PB-172 is ready).
- Mobile transitions and polish layer not yet implemented (PB-173).
- Recharts default tooltip/axis styling in the capacity chart is the most visible remaining desktop integration gap.
- Mobile planning view (PB-170) may benefit from further refinement to integrate with the new navigation paradigm, but it already works functionally.

## Recommended Next Improvements

### EX-REC-052: Mobile planning — edit capability (v2)

- **Problem:** The mobile planning view is read-only. Planners who check schedules on mobile may want to make quick status changes (e.g. mark a driver as sick) without returning to desktop.
- **Proposed improvement:** Add tap-to-edit on day cells or in the detail panel. Tap a day → show a status selector (bottom sheet or inline). Use the existing `api.planning.upsert()` endpoint. Restrict to PLANNER/ADMIN roles.
- **Expected user value:** Planners can make urgent schedule adjustments on the go without switching to a desktop computer.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-167 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** The month calendar view is complete. Edit capability is the natural next step for mobile planning productivity. Should be evaluated based on user feedback from the read-only version.

### EX-REC-053: Mobile homescreen — user greeting and scenario context

- **Problem:** The mobile homescreen currently shows cards without user-specific context. Adding a personalized greeting ("Welkom, [naam]") and the active scenario name would make the homescreen feel more operational and personalized.
- **Proposed improvement:** Add a greeting area above the card grid showing the user's name and active scenario. Use existing session and scenario API.
- **Expected user value:** The homescreen feels personalized and immediately communicates operational context.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** PB-169 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** Low effort enhancement that can be added during mobile polish phase (PB-173).

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Problem:** The Recharts AreaChart uses default tooltip and axis styling. The default Recharts tooltip feels generic compared to the rest of the product-grade capacity page.
- **Proposed improvement:** Add a custom tooltip component with the app's design tokens (surface-primary background, shadow-dropdown, text tokens). Style axis ticks with text-text-secondary color. Add subtle grid line styling.
- **Expected user value:** The chart feels fully integrated with the design system instead of an embedded third-party widget.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk polish. The capacity page is structurally aligned. Custom tooltip would complete the integration. This is the most visible remaining integration gap.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. This creates a subtle inconsistency in the typographic hierarchy across complex screens with multiple sections.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and `.settings-section-title`. Visual evaluation required before broad application.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk typographic refinement. Should be visually evaluated before applying broadly.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Problem:** The single-row composed toolbar works well on wide screens, but may overflow or wrap awkwardly on narrow viewports (< 1200px). The `flex-wrap` behavior handles this gracefully at a basic level, but the zone structure could break visually when wrapped.
- **Proposed improvement:** Add responsive breakpoint behavior: on narrow screens, stack the toolbar into two rows (Period + Filter on top, View + Status below) while maintaining zone containment.
- **Expected user value:** Consistent toolbar experience across screen sizes.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low priority. Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool.
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit.
- **Expected user value:** More intuitive configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The current editor is functional and now enhanced with autocomplete from discovered paths. May be revisited later.

### EX-REC-044: User group member assignment — batch API

- **Problem:** When saving a group with member changes, the current implementation updates each user individually via sequential API calls. For groups with many member changes, this could be slow.
- **Proposed improvement:** Add a batch member assignment endpoint to `/api/user-groups/[id]/members` that accepts `{ addUserIds, removeUserIds }` and performs all updates in a single transaction.
- **Expected user value:** Faster save experience when adding/removing multiple members.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not blocking. Current sequential approach works for typical group sizes (< 20 users).

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the scenarios list fetch to a shared context or parent component.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent. Only worth addressing if PlanningGrid is refactored for other reasons.

## Risks / Watch-outs

- **Mobile planning is read-only.** The mobile planning view does not support editing. Planners can view but must use desktop to make changes. Monitor for user demand for mobile edit capability. See EX-REC-052.
- **Mobile capacity and settings not optimized.** Capacity charts and settings forms still render desktop layouts on mobile. PB-171 and PB-172 are now unblocked (PB-169 complete) and ready for next cycle.
- **Mobile transitions not yet implemented.** Page transitions between homescreen and subpages are instant (no animation). PB-173 covers this polish work.
- **Recharts default styling.** The capacity chart's internal tooltip/axis styling is still Recharts default. See EX-REC-049.
- **Settings tab count growth.** The settings page now has 7 tabs with horizontal scroll. Adding more tabs may need a different navigation pattern.
- **Release notes page data maintenance.** Release notes are embedded as a structured data array in the page component. New releases require updating the RELEASES array. Consider moving to a CMS or markdown parsing if update frequency becomes burdensome.
- **Mobile-nav CSS classes retained.** The `mobile-nav-overlay`, `mobile-nav-panel`, and `mobile-menu-btn` CSS classes in globals.css are now only used by the header back button (`mobile-menu-btn`). The overlay/panel classes are unused but retained for potential future use. Can be cleaned up in a maintenance cycle.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** Manual table virtualization preserves table structure. Same performance outcome.
- **Infinite scroll for drivers/planning:** Pagination gives users predictable position and page control.
- **Page size selector for planning grid:** Fixed 100 per page is reasonable.
- **FormField wrapper component:** Would reduce repetition across forms, but introducing a new abstraction at this point adds risk and cross-agent coordination overhead.
- **Skeleton loaders:** Spinner pattern works. Skeleton loaders add complexity without strong user demand.
- **Status legend popover collapse:** The inline legend provides constant reference while planning. Hiding it behind a click adds friction.
- **Capacity page structural redesign:** No longer needed. PB-131 brought the page to product-grade quality.
- **Documentation page redesign:** Now replaced by release notes viewer (PB-174 completed).
- **Broad StamtabelManager No-Line refactor:** Borders serve usability here. Tonal-only separation would reduce clarity for inline-editable list items.
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B (selective mobile views). Only key screens need mobile optimization.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow should be validated first. See EX-REC-052.
- **Mobile homescreen route rename:** Keeping the homescreen on `/planning` is functionally clean. A separate `/home` route would add routing complexity without user benefit.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
