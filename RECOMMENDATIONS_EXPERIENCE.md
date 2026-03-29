# Experience Agent Recommendations

## Summary

PB-037 (DayCell popup repositioning), PB-038 (DayCell popup visual redesign), and PB-034 (planning grid Phase 2 row composition) are now completed. The planning grid has progressed significantly toward DESIGN.md alignment through two phases of structural improvement plus the DayCell popup redesign.

**Design alignment with DESIGN.md:**
- Planning grid surface uses tonal layering instead of borders (section 4.1 No-Line Rule) — Phase 1 complete.
- Row composition now has clear typographic hierarchy: semibold last-name-first driver names, subdued `text-caption` metadata, and `btn-icon` action buttons (section 5.2, 7.4).
- DayCell popup is now a contextual menu positioned near the click target, not a centered modal. This aligns with DESIGN.md section 2.2 (planning is the product — minimize workflow friction).
- StatusSelector has color indicator dots, active-state check marks, and chevron navigation icons — feels more product-grade than the previous plain text buttons (section 7.5, 7.6).
- Sticky identity columns now inherit alternating row tones, preventing visual break when scrolling.

**Where design quality is still below target:**
- DayCell rendering uses basic colored fills without chip/badge refinement — Phase 3 (PB-035) addresses this.
- RosterAssigner modal table still uses dense cell borders (PB-040).
- StamtabelManager inputs still use inline Tailwind classes instead of `input-field` class (PB-010, deferred).
- Date picker fields across the app use browser native styling (ESC-004, blocked).

## Recommended Next Improvements

### EX-REC-019: Planning grid Phase 3 — cell rendering and status refinement

- **Title:** Refine DayCell visual output and status representation
- **Problem:** DayCells use basic colored fills (StatusBadge with background color classes). In a dense planning grid, the cells could benefit from more refined spacing, chip treatment, and clearer status comprehension at a glance.
- **Proposed improvement:** Refine DayCell visual output with better spacing within cells, subtle border radius treatment, and improved color contrast. Consider whether compact cells benefit from a dot/icon approach vs. the current code letter.
- **Expected user value:** Faster status comprehension in dense planning views. More polished grid appearance.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-034 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Phase 1 (surface) and Phase 2 (rows) are complete. Cell rendering is the final piece of the planning grid visual redesign.

### EX-REC-018: Improve RosterAssigner modal table styling

- **Title:** Apply surface layering to RosterAssigner roster history table
- **Problem:** The RosterAssigner modal contains a table with dense `border border-border-default` on every cell. This conflicts with DESIGN.md section 4.1 and is visually inconsistent with the now-updated planning grid.
- **Proposed improvement:** Apply the same tonal separator approach used in the planning grid: remove cell borders, use subtle row separators, keep header bottom edge.
- **Expected user value:** Visual consistency between the planning grid and modal tables. More refined modal experience.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort consistency fix. Can be done opportunistically. Not urgent since the table is inside a modal.

### EX-REC-020: Settings page layout composition

- **Title:** Elevate settings page beyond generic admin layout
- **Problem:** The settings page (stamtabellen) is functional but uses a generic list-of-cards layout without strong grouping, hierarchy, or visual rhythm. It reads as a standard admin panel rather than a designed product screen.
- **Proposed improvement:** Group related settings categories visually. Strengthen section headers. Add subtle surface differentiation between categories. Consider whether a sidebar-navigation or tabbed approach would improve the settings experience for users managing many stamtabellen.
- **Expected user value:** Settings feel more organized and less like a technical admin interface. Easier navigation between categories.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** With the planning grid approaching DESIGN.md alignment, the settings page becomes the most visible screen still at generic admin quality. The gap will become more noticeable as other screens improve.

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

- **Phase 3 (PB-035) is the remaining grid gap:** The grid surface and row composition are now strong, but the cells themselves are the final piece. Without Phase 3, the grid will have good macro-level design but basic micro-level rendering.
- **RosterAssigner modal table inconsistency:** It uses dense cell borders while the planning grid does not. Users who interact with both surfaces in the same workflow will notice.
- **DayCell popup max height estimate:** The popup positioning uses a `POPUP_MAX_HEIGHT` constant of 280px. If leave types grow significantly or the sick input layout changes, the actual popup may exceed this estimate and get clipped at viewport edges. Monitor after leave type additions.
- **Last-name-first format change:** Driver names now display as "Achternaam, Voornaam" in the grid. This is a deliberate change for scanning efficiency (common in Dutch professional contexts) but differs from the "Voornaam Achternaam" format used elsewhere in the app (e.g. roster assigner title). Consider standardizing across all views.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Badge/pill component system:** Premature until Phase 3 (PB-035) establishes the chip/badge direction.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
