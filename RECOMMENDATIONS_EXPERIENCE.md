# Experience Agent Recommendations

## Purpose

This file contains recommendations from the Experience Agent for UX, usability, and interaction improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

Recommendations focus on making the Dutch-language UI more intuitive, reducing user friction, and ensuring consistent interaction patterns across all screens.

## Recommended Next Improvements

### EX-REC-001: Add inline validation feedback to driver creation form

- **Title:** Inline validation on driver form
- **Problem:** When a user submits the driver creation form with missing required fields, no inline error messages appear. The form silently fails or shows a generic error.
- **Proposed improvement:** Add field-level validation messages (in Dutch) that appear immediately when the user leaves a required field empty. Use the existing `showValidation` pattern.
- **Expected user value:** Planners can correct mistakes immediately without guessing which field is wrong. Reduces time to complete driver entry.
- **Priority:** P2 High
- **Effort:** Small (1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Driver creation is a core daily workflow. Missing validation creates frustration for new planners.

### EX-REC-002: Improve confirmation dialogs with specific context

- **Title:** Contextual delete confirmation dialogs
- **Problem:** Some delete confirmation dialogs use generic text like "Weet u het zeker?" without specifying what will be deleted.
- **Proposed improvement:** Update all delete dialogs to include the name or description of the item being deleted (e.g., "Chauffeur Jan de Vries verwijderen?").
- **Expected user value:** Users can confirm they are deleting the correct item, reducing accidental data loss.
- **Priority:** P3 Medium
- **Effort:** Small (1 cycle)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** This is a low-effort, high-trust improvement that aligns with the existing UX guidelines in CLAUDE.md.

## Risks / Watch-outs

- Validation changes must not interfere with existing form submission logic in the planning grid.
- Dialog text changes must remain in Dutch and use consistent tone.

## Items Intentionally Not Recommended

- **Dark mode support:** Not recommended at this stage. The design token system supports it structurally, but there is no user demand and the effort is significant.
- **Drag-and-drop reordering in tables:** The current sort/filter approach works well. Drag-and-drop adds complexity without clear user value.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
