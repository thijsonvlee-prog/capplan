# Experience Agent Recommendations

## Summary

PB-021 (aria-labels on icon-only buttons) and PB-014 (required field indicators) are now completed. All 16 icon-only buttons across the application have `aria-label` attributes. All required form fields show visual indicators — red asterisks for label-based forms, `*` suffix in placeholders for inline forms.

The application is now compliant with CLAUDE.md's icon-only button accessibility rule. Form usability is improved by setting expectations before submission.

**Design alignment with DESIGN.md:** The application remains materially below the intended design standard in several areas. The completed work addresses usability fundamentals but does not yet move toward the product-grade visual hierarchy, surface layering, and composed page structure described in DESIGN.md. The main gaps are: weak page headers, flat control grouping on the planning screen, generic card styling on settings, and absence of visual personality across all pages.

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
- **Why now:** The planning screen is the primary product surface. DESIGN.md explicitly calls out that it should feel premium and product-led (section 9). Current toolbar layout is the most visible gap between current state and design standard.

### EX-REC-012: Add section grouping and icons to settings page

- **Title:** Improve settings page visual hierarchy and structure
- **Problem:** The settings page renders 8 identical card components (StamtabelManagers, SkillManager, RosterProfileEditor) in a flat vertical list with no category grouping, section headers, or visual differentiation. This conflicts with DESIGN.md sections 2.5 (composed screens), 7.1 (page headers), and 3.2 (anti-pattern: flat screens with weak hierarchy). The page reads like a generic CMS admin panel.
- **Proposed improvement:** Group settings into logical categories (e.g., "Stamgegevens" for werkgevers/afdelingen/locaties/verloftypes, "Competenties" for vaardigheden, "Roosters" for roosterprofielen). Add category headings and optional section icons. Add a brief page introduction.
- **Expected user value:** Easier navigation of settings, clearer mental model of what each section controls, more professional feel.
- **Priority:** P3 Medium
- **Effort:** Small (wrapper divs, section headings, no logic changes)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Quick win that improves one of the most generic-feeling screens. Foundation for future settings improvements.

### EX-REC-013: Improve driver list page header and action structure

- **Title:** Add proper page header to driver overview
- **Problem:** The driver list page has a minimal header: just a search field and an add button in a flat row. No page title visible in the content area, no driver count or summary context. When editing a driver, the form appears inline without clear visual framing. This conflicts with DESIGN.md sections 7.1 (page headers) and 8.2 (action placement).
- **Proposed improvement:** Add a page header zone with title, driver count badge, and grouped action area. Wrap the inline edit form in a more distinct container with clear edit-mode indication.
- **Expected user value:** Clearer page identity, immediate context (how many drivers), better edit experience.
- **Priority:** P3 Medium
- **Effort:** Small (layout additions, no logic changes)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The driver list is a frequently used screen. Current layout is functional but below the composed standard in DESIGN.md.

### EX-REC-008: Add semantic dialog attributes to modal overlays

- **Title:** Add semantic dialog attributes to modal overlays
- **Problem:** Multiple modal components (ScenarioSelector create dialog, RosterAssigner, PlanningGrid column picker, PlanningGrid bulk selector, DayCell status selector) use `fixed inset-0` backdrop overlays without `role="dialog"` or `aria-modal="true"`. Keyboard users and screen reader users cannot navigate these modals properly.
- **Proposed improvement:** Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to each modal container. Consider adding focus trap for keyboard navigation in a follow-up.
- **Expected user value:** Improved accessibility for keyboard and screen reader users. Foundation for proper focus management later.
- **Priority:** P3 Medium
- **Effort:** Small (attribute additions to ~5 components)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Toast accessibility (PB-012) and icon-button labels (PB-021) are done. This is the natural next accessibility improvement. Already backlogged as PB-019.

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
- **Proposed improvement:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens for styling. Replace all `window.confirm()` calls.
- **Expected user value:** Consistent, branded confirmation experience. Better visual hierarchy. Foundation for richer confirm dialogs.
- **Priority:** P4 Low
- **Effort:** Medium (new component + 5 migration points)
- **Dependencies:** Should be done after PB-019 (dialog accessibility) so the new component starts accessible.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent — `window.confirm` works. But it's the most visible UX inconsistency remaining. Already backlogged as PB-020. Recommend scheduling after PB-019.

## Risks / Watch-outs

- **Planning screen toolbar complexity:** EX-REC-011 touches PlanningGrid.tsx, the most complex component (~650 lines, 2 pre-existing lint warnings). Layout restructuring must be done carefully to avoid regressions. However, the change is purely structural (HTML/CSS), not logic.
- **Design standard gap is structural, not cosmetic:** The gap between current state and DESIGN.md cannot be closed through small styling tweaks alone. Several screens need layout-level restructuring (planning toolbar, settings grouping, driver page headers). Recommend staged redesign work rather than attempting everything at once.
- **Placeholder-only forms lack proper labels:** StamtabelManager, SkillManager, RosterProfileEditor, and ScenarioSelector use placeholders instead of explicit `<label>` elements. This limits accessibility and constrains how required indicators can be displayed. A future pass should add proper labels to these forms, but this is a larger change that affects layout.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Focus trap in modals:** Valuable long-term but requires a utility component. Better to add after dialog roles (PB-019) are in place.
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
