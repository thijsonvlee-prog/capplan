# Experience Agent Recommendations

## Summary

PB-028 (planning toolbar grouping) and PB-029 (driver list page header) are now completed. The planning screen toolbar is grouped into logical sections (Period, View, Search & Filter, Display Options) using subtle surface containers. The driver list page now has a composed page header with title, count badge, search icon, and prominent primary action.

New reusable CSS patterns were added to `globals.css`: `.control-group`, `.control-group-label`, `.page-header`, `.page-header-row`, `.page-header-context`, `.count-badge`. These can be applied to other screens to move them toward the DESIGN.md standard.

**Design alignment with DESIGN.md:**
- The planning toolbar now aligns with DESIGN.md sections 7.2 (toolbars grouped by meaning) and 2.5 (composed screens). Controls are no longer flat rows of loose elements.
- The driver list page now aligns with DESIGN.md sections 7.1 (page headers) and 8.2 (action placement). The page has clear identity, context, and a dominant primary action.
- The planning grid itself still uses 1px borders extensively (conflicts with section 4.1 No-Line Rule). The grid structure, row composition, and summary placement need deeper redesign work to reach the product-grade standard described in section 7.4.
- Other screens (settings, scenario comparison) have not yet received page header treatment.

## Recommended Next Improvements

### EX-REC-015: Apply page header pattern to settings and capacity screens

- **Title:** Extend page header pattern to remaining screens
- **Problem:** The settings page and capacity comparison page lack composed page headers. They open with content directly, without title context or primary action structure. This is inconsistent with the now-improved driver list and planning screen.
- **Proposed improvement:** Apply the `.page-header` pattern to settings page and capacity/comparison screens. Add titles, contextual subtitles where useful, and clear action zones.
- **Expected user value:** Consistent screen identity across the app. Every major screen immediately communicates its purpose.
- **Priority:** P3 Medium
- **Effort:** Small (pattern already exists, apply to 2-3 screens)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The page header pattern is established and reusable. Applying it broadly is low-effort and high-consistency value.

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

### EX-REC-009: Replace window.confirm with custom confirmation component

- **Title:** Replace native browser confirmation dialogs
- **Problem:** All delete confirmation dialogs use `window.confirm()` (found in SubTable, ScenarioSelector, SkillManager, RosterProfileEditor, StamtabelManager). This renders a browser-native dialog that cannot be styled, does not match the application's design, and varies across browsers/platforms.
- **Proposed improvement:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens for styling. Replace all `window.confirm()` calls. Include `role="dialog"` and `aria-modal="true"` from the start.
- **Expected user value:** Consistent, branded confirmation experience. Better visual hierarchy. Foundation for richer confirm dialogs.
- **Priority:** P3 Medium
- **Effort:** Medium (new component + 5 migration points)
- **Dependencies:** PB-019 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** PB-019 dependency is resolved. `window.confirm` is the most visible UX inconsistency remaining. Already backlogged as PB-020.

### EX-REC-016: Planning grid deeper redesign — surface layering and row composition

- **Title:** Redesign planning grid visual structure toward DESIGN.md standard
- **Problem:** The planning grid still uses dense 1px borders for all structure (cells, headers, columns). This conflicts with DESIGN.md section 4.1 (No-Line Rule) and section 7.4 (planning grid is a product surface, not a spreadsheet). Row composition combines name, metadata, and planning cells in a flat table structure without clear tonal hierarchy. Summary/totals row is not visually distinct enough from the main scheduling matrix.
- **Proposed improvement:** Replace border-heavy cell structure with tonal contrast and spacing. Differentiate header, data rows, group rows, and totals through surface layering. Improve row identity composition. This is a significant visual redesign that should be planned and scoped carefully.
- **Expected user value:** The planning screen moves from a spreadsheet-like tool to a modern planning product surface. Faster scanning, clearer status comprehension, reduced visual fatigue in daily use.
- **Priority:** P2 High
- **Effort:** Large (touches core PlanningGrid rendering, GroupRows, CapacitySummaryRow, DayCell visual output)
- **Dependencies:** PB-028 (completed). Should be done in isolation without concurrent PlanningGrid changes.
- **Suggested owner:** Experience Agent
- **Why now:** The toolbar is now grouped. The grid visual structure is the next and largest gap between the planning screen and the DESIGN.md standard. This is the core product surface and the most impactful design improvement remaining.

### EX-REC-003: Standardize input field styling in StamtabelManager

- **Title:** Use CSS component classes consistently in StamtabelManager inputs
- **Problem:** The StamtabelManager form inputs use inline Tailwind classes for styling, while all other components use the `input-field` CSS class. Minor inconsistency in border radius, focus style, and sizing.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class.
- **Expected user value:** Visually consistent input fields across the entire settings page and application.
- **Priority:** P4 Low
- **Effort:** Small (two class replacements in one file)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup. Can be done opportunistically. Already backlogged as PB-010.

## Risks / Watch-outs

- **Planning grid visual redesign is the largest remaining gap:** The toolbar grouping (PB-028) is a meaningful step, but the grid itself (cells, rows, headers, summaries) still uses spreadsheet-style borders and flat rendering. Closing this gap (EX-REC-016) is high-value but requires careful scoping — it touches the most complex component.
- **Page header inconsistency:** With the driver list now having a composed header, screens without one (settings, capacity) will feel inconsistent. EX-REC-015 addresses this quickly.
- **Placeholder-only forms lack proper labels:** StamtabelManager, SkillManager, RosterProfileEditor, and ScenarioSelector use placeholders instead of explicit `<label>` elements. This limits accessibility. A future pass should add proper labels, but this is a larger change.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Badge/pill component system:** DriverList uses inline badge styling. Consolidating into reusable classes would be cleaner but is premature until more badge variants emerge.
- **Full sidebar redesign:** The sidebar works. DESIGN.md section 7.8 describes an ideal, but the current sidebar is calm and functional. Not a priority over core screen improvements.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
