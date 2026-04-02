# Experience Agent Recommendations

## Summary

**This cycle (2026-04-02, run 18):** Completed PB-180 (StamtabelManager/SkillManager visual elevation) and PB-181 (capacity comparison buttons). Both were P4 Low visual refinements.

**What was improved:**
- StamtabelManager and SkillManager list items now have hover elevation (shadow-xs), rounded row shapes, smooth transitions, and a distinct editing state (brand accent border + background). Propagates across 4+ stamtabel instances and skills.
- Capacity comparison buttons restyled as pill badges with clear active (solid brand fill) / inactive (bordered, subtle) states and smooth toggle transitions.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8/10.** The application exceeds generic admin UI across all screens. Design tokens are comprehensive (~55 tokens), typography hierarchy is strong (Manrope display + Inter body), and surface layering is consistently applied.
- **Planning grid:** Well-aligned (sections 7.4, 9). Toolbar organized into four zones. Tonal row striping with hover effects.
- **Capacity page:** Well-aligned (sections 7.1, 7.3, 8.3). KPI summary module, grouped toolbar with comparison pills, chart + table sections clearly separated.
- **Settings page:** Well-aligned (sections 2.5, 7.1). StamtabelManager and SkillManager rows now feel elevated and intentional. Tab navigation with icon + badge counts.
- **Drivers page:** Well-aligned (sections 3.2, 7.3). Composed page header, integrated search, tonal row alternation.
- **Mobile experience:** Well-aligned across all screens. Consistent header pattern, entrance animations, touch-friendly targets.
- **Sidebar:** Well-aligned (section 7.8). Dark premium surface, clear active states.

**Where design quality is still below target:**
- Recharts default tooltip/axis styling remains the most visible desktop integration gap.
- CapacityTable uses dense 1px borders and alternating row tints — feels spreadsheet-like (conflicts with DESIGN.md §4.1 No-Line Rule and §7.4).
- RosterProfileEditor 28-day grid is flat and mechanical — no tonal layering or visual rhythm.
- CapacityKPIs cards feel like generic dashboard widgets — lack compositional intentionality.

## Recommended Next Improvements

### EX-REC-056: CapacityTable — tonal layering refactor

- **Problem:** The capacity table uses 1px borders throughout and alternating row tints, creating a spreadsheet-like appearance. This directly conflicts with DESIGN.md §4.1 (No-Line Rule) and §7.4 (avoid harsh grid-line visuals).
- **Proposed improvement:** Replace 1px row borders with tonal surface contrast. Use surface-tertiary for header row, surface-primary for data rows with subtle spacing between groups. Remove most internal borders, relying on spacing and tonal contrast for structure.
- **Expected user value:** The capacity details section feels like a designed data surface, not a raw table.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** CapacityTable is visible on the second most important screen. The gap between the elevated KPI/chart sections and the generic table below is noticeable.

### EX-REC-055: Capaciteitspagina — vergelijkingsknoppen visuele verbetering

- **Status:** Completed (PB-181, 2026-04-02).

### EX-REC-054: StamtabelManager en SkillManager — visuele verhoging lijstitems

- **Status:** Completed (PB-180, 2026-04-02).

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
- **CapacityTable below premium standard.** Dense 1px borders and alternating tints create a spreadsheet feel on the second most important screen. New recommendation EX-REC-056.
- **RosterProfileEditor grid.** Flat, mechanical 28-day grid with stark status colors. Below DESIGN.md standard but low-traffic screen. Not yet recommended for immediate work.
- **Settings tab count growth.** The desktop settings page has 7 tabs. Adding more may need a different navigation pattern.
- **Mobile capacity scenario compare hidden.** The compare feature is desktop-only. May need mobile treatment if multi-scenario comparison is a common mobile use case.
- **Unused mobile-nav CSS classes.** `mobile-nav-overlay` and `mobile-nav-panel` classes in globals.css are no longer used. Tracked as PB-178 for Delivery Agent cleanup.

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
- **Broad StamtabelManager No-Line refactor:** Borders serve usability in the card header/form. Row area now uses tonal layering (PB-180).
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B. Only key screens need mobile optimization.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow validated first.
- **Mobile homescreen route rename:** `/planning` is functionally clean for both homescreen and planning.
- **Mobile capacity scenario compare:** Too complex for small screens. Desktop-only is appropriate until user demand exists.
- **Mobile drivers page visual refresh:** Completed (PB-175). No further work needed.
- **Form validation entrance animation:** Minor polish. Current inline error display is functional and clear.
- **Toast micro-interactions (stagger, exit):** Current slide-in is sufficient. Over-animating risks feeling unserious.
- **CapacityKPIs card redesign:** Current cards are functional. Elevating them would require establishing a new KPI card pattern — not justified without stronger need.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
