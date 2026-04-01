# Experience Agent Recommendations

## Summary

**This cycle (2026-04-01, run 17):** No Experience Agent tasks were in the backlog. Performed a fresh UX/design audit of all key screens and components against the DESIGN.md standard.

**What was improved:**
- No code changes this cycle. All Experience Agent backlog items are either completed or deferred.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8/10.** The application exceeds generic admin UI across all screens. Design tokens are comprehensive (~55 tokens), typography hierarchy is strong (Manrope display + Inter body), and surface layering is consistently applied.
- **Planning grid:** Well-aligned (sections 7.4, 9). Toolbar organized into four zones (Period, Filter, View, Status). Tonal row striping with hover effects. Status cells with color indicator dots.
- **Capacity page:** Well-aligned (sections 7.1, 7.3, 8.3). KPI summary module, grouped toolbar with subtle dividers, chart + table sections clearly separated.
- **Settings page (desktop):** Well-aligned (sections 2.5, 7.1). Tab navigation with icon + badge counts, color-coded tab groups, section intros.
- **Settings page (mobile):** Well-aligned (sections 2.5, 7.3). Card-based section picker with colored icon backgrounds.
- **Drivers page:** Well-aligned (sections 3.2, 7.3). Composed page header, integrated search, tonal row alternation. Mobile card view.
- **Mobile experience:** Well-aligned across all screens. Consistent header pattern, entrance animations, touch-friendly targets.
- **Sidebar:** Well-aligned (section 7.8). Dark premium surface, clear active states.
- **Toast & ConfirmDialog:** Product-grade. Proper icon treatment, modal backdrop, accessibility.

**Where design quality is still below target:**
- Recharts default tooltip/axis styling remains the most visible desktop integration gap.
- StamtabelManager/SkillManager list items feel utilitarian (basic hover:bg, divide-y pattern). Below the premium feel of other screens.
- RosterProfileEditor 28-day grid lacks visual refinement compared to the planning grid.
- Capacity comparison buttons feel flat — basic padding/color without badge-style treatment.
- Form validation messaging lacks entrance animation or visual hierarchy.

## Recommended Next Improvements

### EX-REC-054: StamtabelManager en SkillManager — visuele verhoging lijstitems

- **Problem:** StamtabelManager and SkillManager list items use a basic `divide-y` separator with flat `hover:bg-surface-secondary`. Inline editing with Check/X icons is functional but feels generic compared to the composed headers, cards, and surfaces used elsewhere in the app.
- **Proposed improvement:** Add subtle hover elevation (shadow-xs on hover), improve row spacing, add a light left-accent border on the active/editing row, and refine the action icon spacing. Keep the inline edit pattern but make it feel more intentional.
- **Expected user value:** Settings screens feel as polished as the planning and capacity screens. Consistent premium feel across the full app.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk refinement. These components are shared across 4+ stamtabel instances and skills, so improvements propagate broadly.

### EX-REC-055: Capaciteitspagina — vergelijkingsknoppen visuele verbetering

- **Problem:** The scenario comparison buttons on the capacity page use basic `px-2.5 py-1` styling with flat color fills. They lack visual weight differentiation from surrounding text and don't communicate their interactive/toggled state clearly enough.
- **Proposed improvement:** Restyle as badge-style pills with subtle borders when inactive and solid fill when active. Add a small transition on toggle. Ensure selected state has clear visual distinction.
- **Expected user value:** Faster recognition of comparison state. The toolbar feels more cohesive and intentional.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Quick visual polish on the second most important screen.

### EX-REC-052: Mobile planning — edit capability (v2)

- **Problem:** The mobile planning view is read-only. Planners who check schedules on mobile may want to make quick status changes (e.g. mark a driver as sick) without returning to desktop.
- **Proposed improvement:** Add tap-to-edit on day cells in the month calendar. Tap a day then show a status selector (bottom sheet or inline). Use the existing `api.planning.upsert()` endpoint. Restrict to PLANNER/ADMIN roles.
- **Expected user value:** Planners can make urgent schedule adjustments on the go without switching to a desktop computer.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-170 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** The mobile initiative is complete. Edit capability is the natural next step. Should be evaluated based on user feedback from the read-only version.

### EX-REC-053: Mobile homescreen — user greeting and scenario context

- **Problem:** The mobile homescreen shows cards without user-specific context. A personalized greeting and active scenario name would make the homescreen feel more operational.
- **Proposed improvement:** Add a greeting area above the card grid showing the user's name and active scenario. Use existing session and scenario API.
- **Expected user value:** The homescreen feels personalized and immediately communicates operational context.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** PB-169 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** Low effort enhancement that could be combined with any future mobile work.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Problem:** The Recharts AreaChart uses default tooltip and axis styling. The default Recharts tooltip feels generic compared to the rest of the product-grade capacity page.
- **Proposed improvement:** Add a custom tooltip component with the app's design tokens (surface-primary background, shadow-dropdown, text tokens). Style axis ticks with text-text-secondary color.
- **Expected user value:** The chart feels fully integrated with the design system instead of an embedded third-party widget.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Most visible remaining integration gap on desktop. Low risk.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. Subtle inconsistency in typographic hierarchy.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and `.settings-section-title`.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk typographic refinement.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Problem:** The single-row composed toolbar may overflow on narrow viewports (< 1200px).
- **Proposed improvement:** Add responsive breakpoint to stack toolbar into two rows on narrow screens.
- **Expected user value:** Consistent toolbar experience across screen sizes.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Only relevant if narrow viewport usage is reported.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout. Could be more visual.
- **Proposed improvement:** Consider a card-based mapping representation.
- **Expected user value:** More intuitive configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. Current editor is functional.

### EX-REC-044: User group member assignment — batch API

- **Problem:** Member changes update each user individually via sequential API calls.
- **Proposed improvement:** Batch member assignment endpoint.
- **Expected user value:** Faster save for large groups.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not blocking. Current approach works for typical group sizes.

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the fetch to a shared context.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent.

## Risks / Watch-outs

- **Mobile planning is read-only.** Planners must use desktop to make schedule changes. Monitor user demand for mobile edit capability (EX-REC-052).
- **Recharts default styling.** The capacity chart's tooltip/axis styling is still Recharts default. See EX-REC-049.
- **Settings tab count growth.** The desktop settings page has 7 tabs. The mobile card list handles this well, but adding more tabs on desktop may need a different navigation pattern.
- **Release notes page data maintenance.** Release notes are embedded as a structured data array. Consider markdown parsing if update frequency becomes burdensome.
- **Mobile capacity scenario compare hidden.** The compare feature is desktop-only. May need mobile treatment if multi-scenario comparison is a common mobile use case.
- **Unused mobile-nav CSS classes.** `mobile-nav-overlay` and `mobile-nav-panel` classes in globals.css are no longer used. Tracked as PB-178 for Delivery Agent cleanup.
- **StamtabelManager/SkillManager below premium standard.** These shared components propagate their generic feel across 5+ settings sections. Tracked as EX-REC-054.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional. Grid visual refinement could be a future polish item but is low priority.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** Manual table virtualization preserves table structure. Same performance outcome.
- **Infinite scroll for drivers/planning:** Pagination gives users predictable position and page control.
- **Page size selector for planning grid:** Fixed 100 per page is reasonable.
- **FormField wrapper component:** Reduces repetition but adds abstraction risk.
- **Skeleton loaders:** Spinner pattern works. Skeleton loaders add complexity without strong user demand.
- **Status legend popover collapse:** Inline legend provides constant reference.
- **Capacity page structural redesign:** PB-131 brought the page to product-grade quality.
- **Broad StamtabelManager No-Line refactor:** Borders serve usability here. Subtle refinement via EX-REC-054 is the right approach.
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B. Only key screens need mobile optimization.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow validated first.
- **Mobile homescreen route rename:** `/planning` is functionally clean for both homescreen and planning.
- **Mobile capacity scenario compare:** Too complex for small screens. Desktop-only is appropriate until user demand exists.
- **Mobile drivers page visual refresh:** Completed (PB-175). No further work needed.
- **Form validation entrance animation:** Minor polish. Current inline error display is functional and clear.
- **Toast micro-interactions (stagger, exit):** Current slide-in is sufficient. Over-animating risks feeling unserious.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
