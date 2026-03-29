# Experience Agent Recommendations

## Purpose

This file contains recommendations from the Experience Agent for UX, usability, and interaction improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-012 (toast accessibility) and PB-013 (loading spinners for SkillManager/RosterProfileEditor) have been completed. All settings page components now show consistent loading spinners, and toast notifications are announced by screen readers.

A fresh UX scan was performed across the settings page, driver form, scenario selector, and modal patterns. The recommendations below reflect the current state of the application after this cycle's work.

The most impactful remaining improvements are: adding visible required field indicators (already backlogged as PB-014), adding dialog accessibility to modals (PB-019), and standardizing StamtabelManager input styling (PB-010).

## Recommended Next Improvements

### EX-REC-006: Add visible required field indicators to forms

- **Title:** Mark required fields with visual indicators
- **Problem:** No form in the application visually marks required fields before submission. Users must submit and encounter errors to learn which fields are mandatory. This applies to: DriverForm (voornaam, achternaam), StamtabelManager (code, omschrijving), SkillManager (vaardigheidsnaam), RosterProfileEditor (profielnaam), ScenarioSelector (naam), and sub-table forms (begindatum).
- **Proposed improvement:** Add a red asterisk (`*`) after the label text of required fields, using `text-danger-600` for consistency with validation errors. Apply this across all forms.
- **Expected user value:** Users immediately know which fields are required without trial-and-error submission.
- **Priority:** P3 Medium
- **Effort:** Small (many small edits across form components)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Inline validation (PB-005) and loading states (PB-006, PB-013) are done. Required field indicators complement these by setting expectations before submission. Already backlogged as PB-014.

### EX-REC-008: Add semantic dialog attributes to modal overlays

- **Title:** Add semantic dialog attributes to modal overlays
- **Problem:** Multiple modal components (ScenarioSelector create dialog, RosterAssigner, PlanningGrid column picker, PlanningGrid bulk selector, DayCell status selector) use `fixed inset-0` backdrop overlays without `role="dialog"` or `aria-modal="true"`. Keyboard users and screen reader users cannot navigate these modals properly.
- **Proposed improvement:** Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to each modal container. Consider adding focus trap for keyboard navigation in a follow-up.
- **Expected user value:** Improved accessibility for keyboard and screen reader users. Foundation for proper focus management later.
- **Priority:** P3 Medium
- **Effort:** Small (attribute additions to ~5 components)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Toast accessibility (PB-012) is now done. This is the natural next accessibility improvement. Already backlogged as PB-019.

### EX-REC-003: Standardize input field styling in StamtabelManager

- **Title:** Use CSS component classes consistently in StamtabelManager inputs
- **Problem:** The StamtabelManager form inputs (lines 63-70) use inline Tailwind classes for styling (border, focus ring, padding, etc.), while SkillManager, RosterProfileEditor, DriverForm, and all other components use the `input-field` CSS class from `globals.css`. This creates a minor inconsistency in border radius, focus style, and sizing within the settings page.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class, matching all other components.
- **Expected user value:** Visually consistent input fields across the entire settings page and application.
- **Priority:** P4 Low
- **Effort:** Small (two class replacements in one file)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup. Can be done opportunistically alongside other settings page work. Already backlogged as PB-010.

### EX-REC-009: Replace window.confirm with custom confirmation component

- **Title:** Replace native browser confirmation dialogs
- **Problem:** All delete confirmation dialogs use `window.confirm()` (found in SubTable, ScenarioSelector, SkillManager, RosterProfileEditor). This renders a browser-native dialog that cannot be styled, does not match the application's design, and varies across browsers/platforms.
- **Proposed improvement:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens for styling. Replace all `window.confirm()` calls.
- **Expected user value:** Consistent, branded confirmation experience. Better visual hierarchy. Foundation for richer confirm dialogs.
- **Priority:** P4 Low
- **Effort:** Medium (new component + 4 migration points)
- **Dependencies:** None, but should be done after PB-019 (dialog accessibility) so the new component starts accessible.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent — `window.confirm` works. But it's the most visible UX inconsistency remaining. Already backlogged as PB-020. Recommend scheduling after PB-019.

### EX-REC-010: Add aria-label to icon-only action buttons in settings components

- **Title:** Add accessible labels to icon-only buttons
- **Problem:** Edit (Pencil) and delete (Trash2) icon-only buttons in SkillManager and RosterProfileEditor lack `aria-label` attributes. Screen reader users cannot identify what these buttons do. The CLAUDE.md rules require all icon-only buttons to have `aria-label`.
- **Proposed improvement:** Add `aria-label="Bewerken"` to edit buttons and `aria-label="Verwijderen"` to delete buttons across SkillManager and RosterProfileEditor. SubTable and StamtabelManager should also be checked.
- **Expected user value:** Screen reader users can identify button actions. Compliance with codebase rules.
- **Priority:** P3 Medium
- **Effort:** Small (attribute additions to ~8 buttons)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** CLAUDE.md requires `aria-label` on icon-only buttons. This is a gap discovered during the current scan. Quick fix with broad accessibility impact.

## Risks / Watch-outs

- EX-REC-010 (aria-labels) is a compliance gap with CLAUDE.md rules — should be prioritized before more complex work.
- EX-REC-009 (custom confirm dialog) is the largest remaining item. Must ensure the new component handles async confirmation flow correctly without breaking existing delete patterns. Should follow PB-019 (dialog roles) for consistency.
- PlanningGrid.tsx remains the most complex component. Any UX changes touching that file should be verified carefully against the 2 pre-existing lint warnings.

## Items Intentionally Not Recommended

- **Dark mode support:** Not recommended at this stage. The design token system supports it structurally, but there is no user demand and the effort is significant.
- **Drag-and-drop reordering in tables:** The current sort/filter approach works well. Drag-and-drop adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The current click-to-cycle interaction works. It's unconventional but functional, and users familiar with it would be disrupted by a redesign.
- **Focus trap in modals:** Valuable long-term, but requires a utility component or library. Better to add after dialog roles (EX-REC-008/PB-019) are in place. Can be a follow-up.
- **Search loading indicators:** The planning grid and driver list search fields work reactively. Adding debounce + spinner would improve perceived performance but adds complexity for marginal gain at current data volumes.
- **Placeholder-to-label migration:** Many inputs use placeholder text as pseudo-labels. While not ideal for accessibility, the current pattern is consistent across the app and changing it would require significant layout adjustments. Monitor for user feedback.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
