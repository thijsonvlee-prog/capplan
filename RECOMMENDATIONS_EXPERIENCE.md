# Experience Agent Recommendations

## Summary

PB-019 (semantic dialog attributes) and PB-026 (settings page section grouping) are now completed. All 5 modal overlays have `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label` attributes. The settings page now has three logical sections (Stamgegevens, Competenties, Roosters) with section headings and a page introduction.

**Design alignment with DESIGN.md:** The settings page improvement moves the screen from a flat list toward structured grouping, which aligns with DESIGN.md sections 2.5 (composed screens) and 7.1 (page headers). However, the settings page still uses the same card styling throughout — it does not yet use surface layering (section 4.1) or strong hierarchy to feel truly product-grade. The planning screen toolbar and driver list page remain materially below the design standard.

## Recommended Next Improvements

### EX-REC-011: Redesign planning screen control bar grouping

- **Title:** Group planning screen controls into logical sections
- **Problem:** The PlanningGrid toolbar contains period navigation, zoom, density, scenario, search, grouping, column picker, totals toggle, and status legend — all in flat horizontal rows without clear grouping. This conflicts with DESIGN.md sections 7.2 (toolbars grouped by meaning) and 2.5 (screens should feel composed). The planning screen is the core product surface and currently reads as a toolbar salad.
- **Proposed improvement:** Restructure the two control rows into visually distinct groups: `[Navigation + Zoom]` `[View Options: density, columns, totals]` `[Scenario]` on row 1; `[Search + Grouping]` `[Status Legend]` on row 2. Use subtle background containers or spacing to delineate groups.
- **Expected user value:** Faster orientation, reduced cognitive load, planning screen feels more intentional and product-grade.
- **Priority:** P2 High
- **Effort:** Medium (layout restructuring of PlanningGrid toolbar, no logic changes)
- **Dependencies:** None. Should be coordinated carefully given PlanningGrid complexity.
- **Suggested owner:** Experience Agent
- **Why now:** The planning screen is the primary product surface. DESIGN.md explicitly calls out that it should feel premium and product-led (section 9). Current toolbar layout is the most visible gap between current state and design standard. Already backlogged as PB-028.

### EX-REC-013: Improve driver list page header and action structure

- **Title:** Add proper page header to driver overview
- **Problem:** The driver list page has a minimal header: just a search field and an add button in a flat row. No page title visible in the content area, no driver count or summary context. This conflicts with DESIGN.md sections 7.1 (page headers) and 8.2 (action placement).
- **Proposed improvement:** Add a page header zone with title, driver count badge, and grouped action area.
- **Expected user value:** Clearer page identity, immediate context (how many drivers), better edit experience.
- **Priority:** P3 Medium
- **Effort:** Small (layout additions, no logic changes)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The driver list is a frequently used screen. Current layout is functional but below the composed standard in DESIGN.md. Already backlogged as PB-029.

### EX-REC-003: Standardize input field styling in StamtabelManager

- **Title:** Use CSS component classes consistently in StamtabelManager inputs
- **Problem:** The StamtabelManager form inputs use inline Tailwind classes for styling (border, focus ring, padding, etc.), while all other components use the `input-field` CSS class from `globals.css`. This creates a minor inconsistency in border radius, focus style, and sizing within the settings page.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class, matching all other components.
- **Expected user value:** Visually consistent input fields across the entire settings page and application.
- **Priority:** P4 Low
- **Effort:** Small (two class replacements in one file)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup. Can be done opportunistically alongside other settings page work. Already backlogged as PB-010.

### EX-REC-009: Replace window.confirm with custom confirmation component

- **Title:** Replace native browser confirmation dialogs
- **Problem:** All delete confirmation dialogs use `window.confirm()` (found in SubTable, ScenarioSelector, SkillManager, RosterProfileEditor, StamtabelManager). This renders a browser-native dialog that cannot be styled, does not match the application's design, and varies across browsers/platforms.
- **Proposed improvement:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens for styling. Replace all `window.confirm()` calls. Include `role="dialog"` and `aria-modal="true"` from the start.
- **Expected user value:** Consistent, branded confirmation experience. Better visual hierarchy. Foundation for richer confirm dialogs.
- **Priority:** P4 Low
- **Effort:** Medium (new component + 5 migration points)
- **Dependencies:** PB-019 is now completed, so the new component can use dialog attributes immediately.
- **Suggested owner:** Experience Agent
- **Why now:** PB-019 dependency is resolved. `window.confirm` is the most visible UX inconsistency remaining. Already backlogged as PB-020.

### EX-REC-014: Add focus trap to modal overlays

- **Title:** Trap keyboard focus within open modals
- **Problem:** Modal overlays now have semantic dialog attributes (PB-019 done) but do not trap focus. Users can tab out of the modal and interact with background content, which breaks the expected modal interaction pattern.
- **Proposed improvement:** Create a lightweight focus trap utility or hook. Apply to the 4 true modals (ScenarioSelector, RosterAssigner, bulk selector, DayCell selector). The column picker is a dropdown, not a true modal — focus trap is not appropriate there.
- **Expected user value:** Complete keyboard accessibility for modal workflows.
- **Priority:** P3 Medium
- **Effort:** Medium (new utility + integration in 4 components)
- **Dependencies:** PB-019 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Natural next step after PB-019. Without focus trap, dialog semantics are incomplete.

## Risks / Watch-outs

- **Planning screen toolbar complexity:** EX-REC-011/PB-028 touches PlanningGrid.tsx, the most complex component (~650 lines, 2 pre-existing lint warnings). Layout restructuring must be done carefully to avoid regressions. However, the change is purely structural (HTML/CSS), not logic.
- **Design standard gap is structural, not cosmetic:** The gap between current state and DESIGN.md cannot be closed through small styling tweaks alone. The planning screen, driver list, and scenario comparison views all need layout-level work. Recommend staged redesign rather than attempting everything at once.
- **Placeholder-only forms lack proper labels:** StamtabelManager, SkillManager, RosterProfileEditor, and ScenarioSelector use placeholders instead of explicit `<label>` elements. This limits accessibility. A future pass should add proper labels, but this is a larger change that affects layout.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Badge/pill component system:** DriverList uses inline badge styling. Consolidating into reusable classes would be cleaner but is premature until more badge variants emerge.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
