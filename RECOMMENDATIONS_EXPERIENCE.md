# Experience Agent Recommendations

## Summary

PB-033 (focus trap), PB-020 (ConfirmDialog), and PB-031 (page headers for settings/capacity) are now completed. All major screens now have composed page headers. All modal overlays trap keyboard focus. All destructive actions use a custom-styled confirmation dialog with specific context.

**Design alignment with DESIGN.md:**
- All screens now have composed page headers with title, context, and action zones, aligning with DESIGN.md section 7.1.
- Modal interactions are now fully accessible with focus trapping, consistent with product-grade quality expectations.
- Confirmation dialogs use design tokens, danger color treatment, and intentional layout — no longer browser-native popups. Aligns with DESIGN.md section 2.1 (product-grade over template-grade).
- Capacity page comparison buttons now use design tokens instead of hardcoded Tailwind colors.
- The planning grid itself still uses 1px borders extensively (conflicts with section 4.1 No-Line Rule). PB-032 (Phase 1) is ready to address this.
- StamtabelManager form inputs still use inline Tailwind classes instead of `input-field` class (PB-010, deferred).

## Recommended Next Improvements

### EX-REC-016: Planning grid deeper redesign — surface layering and row composition

- **Title:** Redesign planning grid visual structure toward DESIGN.md standard
- **Problem:** The planning grid still uses dense 1px borders for all structure (cells, headers, columns). This conflicts with DESIGN.md section 4.1 (No-Line Rule) and section 7.4 (planning grid is a product surface, not a spreadsheet). Row composition combines name, metadata, and planning cells in a flat table structure without clear tonal hierarchy.
- **Proposed improvement:** Phase 1 (PB-032) replaces border-heavy cell structure with tonal contrast. Phase 2 (PB-034) improves row composition. Phase 3 (PB-035) refines cell rendering.
- **Expected user value:** The planning screen moves from a spreadsheet-like tool to a modern planning product surface. Faster scanning, clearer status comprehension.
- **Priority:** P2 High
- **Effort:** Large (phased across 3 cycles)
- **Dependencies:** PB-033 done. PB-032 is unblocked and ready.
- **Suggested owner:** Experience Agent
- **Why now:** The planning grid is the core product surface and the largest remaining gap between the current UI and the DESIGN.md standard. All prerequisite work (toolbar grouping, focus trap, confirm dialogs, page headers) is now complete.

### EX-REC-017: Add Escape key handling to all modal overlays

- **Title:** Consistent Escape key dismissal for modals
- **Problem:** The new ConfirmDialog supports Escape key to close, but the other 4 modal overlays (ScenarioSelector create, RosterAssigner, bulk selector, DayCell selector) do not have explicit Escape key handling. Users may expect Escape to dismiss any modal.
- **Proposed improvement:** Add `onKeyDown` handler for Escape to the 4 remaining modal overlays, calling the existing close/cancel callback.
- **Expected user value:** Consistent keyboard dismissal across all modals.
- **Priority:** P3 Medium
- **Effort:** Small (4 small additions)
- **Dependencies:** PB-033 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Simple follow-up to PB-033. Low risk, high consistency value.

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

- **Planning grid visual redesign is the largest remaining gap:** The toolbar, page headers, dialogs, and focus trapping are all done. The grid itself (cells, rows, headers, summaries) is now the primary area still below DESIGN.md standard. PB-032 Phase 1 is the critical next step.
- **Escape key inconsistency across modals:** ConfirmDialog supports Escape but other modals do not. Minor but noticeable for keyboard users.
- **StamtabelManager inline button styling:** The "Toevoegen" button in StamtabelManager uses inline Tailwind classes instead of `btn-primary`. Not visually broken but inconsistent with the pattern used everywhere else.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Badge/pill component system:** Premature until more badge variants emerge.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
