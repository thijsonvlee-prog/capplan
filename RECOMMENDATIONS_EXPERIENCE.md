# Experience Agent Recommendations

## Summary

**This cycle (2026-04-01, run 11):** Completed three items: PB-165 (mobile hamburger z-index fix — P1 critical), PB-166 (search icon alignment), PB-167 (mobile planning month calendar rewrite). The mobile planning view is now a full month calendar with week numbers, status color dots, tap-to-detail, and month navigation. The hamburger menu is fixed and mobile navigation is fully functional again.

**Current design alignment with DESIGN.md:**
- Sidebar: fully aligned (section 7.8). Premium, calm, anchoring. Responsive — hidden on mobile, accessible via slide-over.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Strong hierarchy, tab navigation, composed zones. 7 tabs including Auditlog.
- Import source manager (Connectiviteit tab): well-aligned. Source type selector, API configuration with surface layering, test connection with inline feedback, response structure preview with interactive path discovery, field mapping editor with autocomplete support.
- Audit log viewer: well-aligned. Filter card, expandable rows, semantic badges, tonal row separation, pagination.
- Login page: well-aligned. Clean, premium, brand-surface split.
- Header: well-aligned. Minimal, composed, contextual subtitle support. Hamburger menu on mobile with proper z-index layering.
- Planning grid toolbar: fully aligned (section 7.2). Controls grouped by meaning.
- Planning grid matrix: fully aligned (section 4.1). Tonal row separation, No-Line Rule respected.
- Mobile planning view: well-aligned. Month calendar grid with week numbers, status dots, tap-to-detail panel. Composed header with driver info and month navigation. Today highlight. Driver selector with card-based layout.
- Drivers page: fully aligned (sections 3.2, 7.3). Card containment, tonal rows, integrated search. Mobile-optimized with card layout.
- Capacity page: fully aligned (sections 7.1, 7.3, 8.3). KPI summary module, section headers.
- User group manager: well-aligned. Card-based layout, expandable details, modal editor.
- User manager: well-aligned. Avatar display, role badges, inline role editing.
- Toast & ConfirmDialog: product-grade. Accessibility, focus trapping, semantic colors.
- Button system: fully aligned. Clear hierarchy across primary/secondary/icon/danger.
- Mobile layout shell: aligned. Slide-over sidebar, overlay backdrop, smooth animations, auto-close on navigate.

**Where design quality is still below target:**
- All major desktop screens are aligned with DESIGN.md. Remaining opportunities are polish-level refinements, not structural gaps.
- Mobile content views for capacity and settings are not yet optimized for mobile viewports — they use desktop layouts on small screens. These are lower-priority screens for mobile use.
- The documentation page is minimal (single card with download button on a full page), but it is a low-traffic utility page and not a core product surface.
- Recharts default tooltip/axis styling in the capacity chart is the most visible remaining integration gap.
- Settings tab count is now 7. Horizontal scrolling tabs handle this adequately but the pattern may need revisiting if more tabs are added.

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


### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Problem:** The Recharts AreaChart uses default tooltip and axis styling. The default Recharts tooltip feels generic compared to the rest of the product-grade capacity page.
- **Proposed improvement:** Add a custom tooltip component with the app's design tokens (surface-primary background, shadow-dropdown, text tokens). Style axis ticks with text-text-secondary color. Add subtle grid line styling.
- **Expected user value:** The chart feels fully integrated with the design system instead of an embedded third-party widget.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk polish. The capacity page is structurally aligned. Custom tooltip would complete the integration. This is the most visible remaining integration gap.

### EX-REC-052: Mobile planning — edit capability (v2)

- **Problem:** The mobile planning view (PB-156) is read-only. Planners who check schedules on mobile may want to make quick status changes (e.g. mark a driver as sick) without returning to desktop.
- **Proposed improvement:** Add tap-to-edit on status blocks in the mobile planning view. Tap a day block → show a status selector bottom sheet. Use the existing `api.planning.upsert()` endpoint. Restrict to PLANNER/ADMIN roles.
- **Expected user value:** Planners can make urgent schedule adjustments on the go without switching to a desktop computer.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-156 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** The read-only mobile flow is complete. Edit capability is the natural next step for mobile planning productivity. Should be evaluated based on user feedback from the read-only version.

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
- **Mobile capacity and settings not optimized.** Capacity charts and settings forms still render desktop layouts on mobile. These are lower-priority mobile screens — capacity is primarily a desktop analysis tool, settings is admin-only.
- **Planning grid toolbar wrap behavior.** The single-row toolbar with four zones may wrap on screens narrower than ~1200px. Current `flex-wrap` handles this, but the visual zone structure may degrade when wrapped. Monitor for user feedback. See EX-REC-048.
- **Recharts default styling.** The capacity chart now lives within a product-grade page, but the chart's internal tooltip/axis styling is still Recharts default. See EX-REC-049.
- **Settings tab count growth.** The settings page now has 7 tabs with horizontal scroll. Adding more tabs may need a different navigation pattern (e.g. vertical tabs or grouped sections).
- **StamtabelManager border usage.** The StamtabelManager component uses `border border-border-subtle` on the outer card and `border-b` between sections. This is a minor tension with the No-Line Rule from DESIGN.md, but the borders serve a structural role here since these are inline-editable list items where clear row separation aids usability. Not a priority to change.
- **API credential storage.** API credentials (passwords, tokens, API keys) are stored in the database as JSONB. The UI masks them appropriately, but the API returns them in full. If this application becomes multi-tenant or externally accessible, credential values should be redacted from GET responses.
- **Month calendar data volume.** The month calendar fetches ~35 days of planning entries per driver per month view. This is a larger payload than the previous 1-7 day view. For drivers with dense planning data, monitor API response time. The current approach is acceptable for typical data volumes.

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
- **Documentation page redesign:** Low-traffic utility page. A single card with a download button is adequate for its purpose.
- **Broad StamtabelManager No-Line refactor:** Borders serve usability here. Tonal-only separation would reduce clarity for inline-editable list items.
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B (selective mobile views). Only key screens need mobile optimization. PB-154/155/156/167 now complete.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow should be validated first. See EX-REC-052.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
