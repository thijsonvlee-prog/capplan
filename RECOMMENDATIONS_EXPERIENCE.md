# Experience Agent Recommendations

## Summary

PB-039 (styled date input wrapper) and PB-035 (planning grid Phase 3 cell rendering) are now completed. The planning grid redesign (ESC-003) is fully done across all three phases: surface layering, row composition, and cell rendering.

**Design alignment with DESIGN.md:**
- Planning grid now uses tonal surface layering, strong row identity, and refined status chips with dot indicators (sections 4.1, 5.2, 7.4, 7.5).
- DayCell popup functions as a contextual menu near the click target with color indicators and check marks (section 2.2).
- Date inputs across all forms now use a styled wrapper with calendar icon, consistent with the design token system (section 7.7).
- Empty cells use a subtle midpoint dot instead of a visible dash, reducing visual noise in the grid.
- Status chips use a dot + letter pattern in compact mode for fast scanning at any density.

**Where design quality is still below target:**
- Settings page (stamtabellen) uses generic list-of-cards layout without strong grouping or hierarchy — PB-041 planned.
- RosterAssigner modal table still uses dense cell borders (PB-040).
- StamtabelManager inputs still use inline Tailwind classes instead of `input-field` class (PB-010, deferred).
- Capacity page table uses basic `px-2 py-0.5 rounded` status badges — not yet aligned with the new chip pattern.
- RosterProfileEditor grid uses bare STATUS_COLORS without dot indicators — functional but inconsistent with the planning grid.

## Recommended Next Improvements

### EX-REC-020: Settings page layout composition

- **Title:** Elevate settings page beyond generic admin layout
- **Problem:** The settings page (stamtabellen) is functional but uses a generic list-of-cards layout without strong grouping, hierarchy, or visual rhythm. With the planning grid now at DESIGN.md standard, the settings page is the most visible screen still at generic admin quality.
- **Proposed improvement:** Group related settings categories visually. Strengthen section headers. Add subtle surface differentiation between categories. Consider whether a sidebar-navigation or tabbed approach would improve the settings experience.
- **Expected user value:** Settings feel more organized and less like a technical admin interface. Easier navigation between categories.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The planning grid now fully meets DESIGN.md standards. The settings page is the next largest gap in perceived product quality.

### EX-REC-021: Capacity page status badge consistency

- **Title:** Align capacity page status badges with planning grid chip pattern
- **Problem:** The capacity page (`CapacityTable.tsx`) uses basic `px-2 py-0.5 rounded` status badges without dot indicators. Now that the planning grid uses the refined `status-chip-compact` pattern, the capacity page feels visually dated in comparison.
- **Proposed improvement:** Apply the same `status-chip-compact` + `status-dot` pattern from the planning grid to the capacity table status badges.
- **Expected user value:** Visual consistency between planning and capacity views. Users who switch between these screens will see a unified status language.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Small effort, high consistency impact. Can be done opportunistically.

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

- **Planning grid redesign is complete — do not regress:** All three phases are done. Any future changes to PlanningGrid.tsx, DayCell.tsx, or StatusBadge.tsx should preserve the tonal hierarchy, chip patterns, and dot indicators.
- **RosterAssigner modal table inconsistency:** It uses dense cell borders while the planning grid does not. Users who interact with both surfaces in the same workflow will notice.
- **DayCell popup max height estimate:** The popup positioning uses a `POPUP_MAX_HEIGHT` constant of 280px. If leave types grow significantly, the actual popup may exceed this and get clipped at viewport edges.
- **Last-name-first format:** Driver names now display as "Achternaam, Voornaam" in the grid but "Voornaam Achternaam" in the roster assigner title. Consider standardizing across all views.
- **Date input showPicker compatibility:** The `showPicker()` API used by DateInput's calendar button is supported in modern browsers but may not work in older browsers. The native click-through on the picker indicator provides a fallback.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). The native calendar popup is functional and maintained by browsers. Custom calendar would add significant complexity for marginal quality improvement.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
