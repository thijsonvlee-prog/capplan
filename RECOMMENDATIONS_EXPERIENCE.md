# Experience Agent Recommendations

## Purpose

This file contains recommendations from the Experience Agent for UX, usability, and interaction improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-005 (inline validation on driver form), PB-006 (loading spinners on settings page), and PB-008 (contextual delete dialogs) have been completed. A fresh UX scan was performed across driver management, settings, and planning flows. The recommendations below reflect the current state of the application.

The most impactful remaining improvements are: extending loading spinners to SkillManager and RosterProfileEditor (since StamtabelManager now has them), adding visible required field indicators, and improving modal accessibility.

## Recommended Next Improvements

### EX-REC-005: Add loading spinners to SkillManager and RosterProfileEditor

- **Title:** Extend loading state pattern to remaining settings components
- **Problem:** StamtabelManager now shows a spinner during data fetch (PB-006), but SkillManager and RosterProfileEditor still flash their empty states briefly before data arrives. This creates an inconsistency within the same settings page.
- **Proposed improvement:** Use the new `useApiDataWithLoading` hook in SkillManager and RosterProfileEditor. Show the `.spinner` class during initial load, matching the StamtabelManager pattern.
- **Expected user value:** Consistent loading experience across the entire settings page. No misleading empty state flashes.
- **Priority:** P3 Medium
- **Effort:** Small (< 1 cycle)
- **Dependencies:** None — `useApiDataWithLoading` is already available.
- **Suggested owner:** Experience Agent
- **Why now:** The infrastructure is in place from PB-006. This is a quick consistency fix.

### EX-REC-006: Add visible required field indicators to forms

- **Title:** Mark required fields with visual indicators
- **Problem:** No form in the application visually marks required fields before submission. Users must submit and encounter errors to learn which fields are mandatory. This applies to: DriverForm (voornaam, achternaam), StamtabelManager (code, omschrijving), SkillManager (vaardigheidsnaam), RosterProfileEditor (profielnaam), ScenarioSelector (naam), and sub-table forms (begindatum).
- **Proposed improvement:** Add a red asterisk (`*`) after the label text of required fields, using `text-danger-600` for consistency with validation errors. Apply this across all forms.
- **Expected user value:** Users immediately know which fields are required without trial-and-error submission.
- **Priority:** P3 Medium
- **Effort:** Small (1 cycle — many small edits across form components)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Inline validation (PB-005) is now in place. Required field indicators complement this by setting expectations before submission.

### EX-REC-007: Add toast accessibility with aria-live region

- **Title:** Make toast notifications accessible to screen readers
- **Problem:** The toast container in `Toast.tsx` lacks `role="status"` and `aria-live="polite"` attributes. Screen readers do not announce toast messages, making success/error feedback invisible to users with assistive technology.
- **Proposed improvement:** Add `role="status"` and `aria-live="polite"` to the toast container element. This is a one-line change.
- **Expected user value:** Users with screen readers receive the same feedback as sighted users after mutations.
- **Priority:** P2 High
- **Effort:** Small (< 1 cycle — single attribute addition)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Every CRUD operation now shows a toast (PB-000). Making these accessible has broad impact.

### EX-REC-008: Add dialog accessibility to modals

- **Title:** Add semantic dialog attributes to modal overlays
- **Problem:** Multiple modal components (ScenarioSelector create dialog, RosterAssigner, PlanningGrid column picker, PlanningGrid bulk selector, DayCell status selector) use `fixed inset-0` backdrop overlays without `role="dialog"` or `aria-modal="true"`. Keyboard users and screen reader users cannot navigate these modals properly.
- **Proposed improvement:** Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to each modal container. Consider adding focus trap for keyboard navigation in a follow-up.
- **Expected user value:** Improved accessibility for keyboard and screen reader users. Foundation for proper focus management later.
- **Priority:** P3 Medium
- **Effort:** Small (1 cycle — attribute additions to ~5 components)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort, broad accessibility improvement. Modals are used in core workflows (scenario creation, roster assignment, status selection).

### EX-REC-009: Replace window.confirm with custom confirmation component

- **Title:** Replace native browser confirmation dialogs
- **Problem:** All 6 delete confirmation dialogs use `window.confirm()`, which renders a browser-native dialog that cannot be styled, does not match the application's design, and varies across browsers/platforms.
- **Proposed improvement:** Create a reusable `ConfirmDialog` component using the existing modal pattern (backdrop + card). Use design tokens for styling. Replace all `window.confirm()` calls.
- **Expected user value:** Consistent, branded confirmation experience. Better visual hierarchy. Foundation for richer confirm dialogs (e.g., warning icons, impact description).
- **Priority:** P4 Low
- **Effort:** Medium (1-2 cycles — new component + 6 migration points)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent — `window.confirm` works. But it's the most visible UX inconsistency remaining. Recommend scheduling when higher-priority work is done.

### EX-REC-003: Standardize input field styling in StamtabelManager

- **Title:** Use CSS component classes consistently in StamtabelManager input
- **Problem:** The StamtabelManager form inputs use inline Tailwind classes for styling (border, focus ring, etc.), while SkillManager and other components use the `input-field` CSS class. This creates a minor inconsistency in border radius, focus style, and sizing.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class, matching SkillManager and RosterProfileEditor patterns.
- **Expected user value:** Visually consistent input fields across all settings sections.
- **Priority:** P4 Low
- **Effort:** Small (< 1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup that improves consistency. Can be done opportunistically.

## Risks / Watch-outs

- EX-REC-005 (loading states for SkillManager/RosterProfileEditor) is safe since `useApiDataWithLoading` is already proven in the settings page.
- EX-REC-007 (toast accessibility) is a minimal change but should be tested with a screen reader if possible.
- EX-REC-009 (custom confirm dialog) is the largest item. Must ensure the new component handles async confirmation flow correctly without breaking existing delete patterns.

## Items Intentionally Not Recommended

- **Dark mode support:** Not recommended at this stage. The design token system supports it structurally, but there is no user demand and the effort is significant.
- **Drag-and-drop reordering in tables:** The current sort/filter approach works well. Drag-and-drop adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The current click-to-cycle interaction works. It's unconventional but functional, and users familiar with it would be disrupted by a redesign.
- **Focus trap in modals:** Valuable long-term, but requires a utility component or library. Better to add after dialog roles (EX-REC-008) are in place. Can be a follow-up.
- **Search loading indicators:** The planning grid and driver list search fields work reactively. Adding debounce + spinner would improve perceived performance but adds complexity for marginal gain at current data volumes.
- **Placeholder-to-label migration:** Many inputs use placeholder text as pseudo-labels. While not ideal for accessibility, the current pattern is consistent across the app and changing it would require significant layout adjustments. Monitor for user feedback.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
