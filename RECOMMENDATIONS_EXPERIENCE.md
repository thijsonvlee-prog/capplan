# Experience Agent Recommendations

## Purpose

This file contains recommendations from the Experience Agent for UX, usability, and interaction improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

PB-001 (empty state guidance for stamtabel managers) has been completed. Empty states across the settings page are now consistent and actionable. The recommendations below reflect a fresh UX scan of the settings area and adjacent flows.

## Recommended Next Improvements

### EX-REC-001: Add inline validation feedback to driver creation form

- **Title:** Inline validation on driver form
- **Problem:** When a user submits the driver creation form with missing required fields, no inline error messages appear. The form silently fails or shows a generic error.
- **Proposed improvement:** Add field-level validation messages (in Dutch) that appear immediately when the user leaves a required field empty. Use the existing `showValidation` pattern already present in StamtabelManager and SkillManager.
- **Expected user value:** Planners can correct mistakes immediately without guessing which field is wrong. Reduces time to complete driver entry.
- **Priority:** P2 High
- **Effort:** Small (1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Driver creation is a core daily workflow. Missing validation creates frustration for new planners. The pattern already exists in other components.

### EX-REC-002: Improve confirmation dialogs with specific context

- **Title:** Contextual delete confirmation dialogs
- **Problem:** Some delete confirmation dialogs use generic text like "Weet u het zeker?" without specifying what will be deleted.
- **Proposed improvement:** Update all delete dialogs to include the name or description of the item being deleted (e.g., "Chauffeur Jan de Vries verwijderen?"). The StamtabelManager and SkillManager already do this correctly — audit remaining screens for consistency.
- **Expected user value:** Users can confirm they are deleting the correct item, reducing accidental data loss.
- **Priority:** P3 Medium
- **Effort:** Small (1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-effort, high-trust improvement that aligns with the existing UX guidelines in CLAUDE.md.

### EX-REC-003: Standardize button styling in SkillManager form

- **Title:** Use CSS component classes consistently in SkillManager input
- **Problem:** The StamtabelManager form inputs use inline Tailwind classes for styling (border, focus ring, etc.), while the SkillManager uses the `input-field` CSS class. This creates a minor inconsistency in border radius, focus style, and sizing between the two form areas on the same page.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class, matching SkillManager and RosterProfileEditor patterns. This also reduces inline style duplication.
- **Expected user value:** Visually consistent input fields across all settings sections. Easier to maintain.
- **Priority:** P4 Low
- **Effort:** Small (< 1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup that improves consistency. Can be done opportunistically.

### EX-REC-004: Add loading states for settings page data fetching

- **Title:** Show loading spinners while stamtabel data loads
- **Problem:** When the settings page loads, each stamtabel section renders with empty state text briefly before data arrives. This can cause a flash of "Nog geen [type] toegevoegd" that may confuse users into thinking their data is missing.
- **Proposed improvement:** Add a loading state using the `.spinner` CSS class that displays while `useApiData` is fetching. Show the empty state only after loading completes and records are genuinely empty.
- **Expected user value:** Users don't see misleading empty states during page load. Clearer feedback on data status.
- **Priority:** P3 Medium
- **Effort:** Small-Medium (requires adding loading state support to StamtabelManager props or useApiData hook)
- **Dependencies:** May need changes to the `useApiData` hook to expose loading state.
- **Suggested owner:** Experience Agent
- **Why now:** The improved empty states from PB-001 make this flash more noticeable because the message is now more prominent. Worth addressing to avoid user confusion.

## Risks / Watch-outs

- EX-REC-004 (loading states) touches the `useApiData` hook, which is used across the entire app. Changes must be backward-compatible.
- Validation changes (EX-REC-001) must not interfere with existing form submission logic in the planning grid.
- Dialog text changes (EX-REC-002) must remain in Dutch and use consistent tone.

## Items Intentionally Not Recommended

- **Dark mode support:** Not recommended at this stage. The design token system supports it structurally, but there is no user demand and the effort is significant.
- **Drag-and-drop reordering in tables:** The current sort/filter approach works well. Drag-and-drop adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The current click-to-cycle interaction works. It's unconventional but functional, and users familiar with it would be disrupted by a redesign.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
