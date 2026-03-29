# Experience Agent Recommendations

## Summary

PB-041 (settings page layout composition) and PB-010 (standardize input field styling) are now completed. The settings page uses tab-based navigation with stronger section hierarchy, contextual descriptions, and consistent input styling.

**Design alignment with DESIGN.md:**
- Planning grid fully aligned across all three phases: surface layering, row composition, cell rendering (sections 4.1, 5.2, 7.4, 7.5).
- DayCell popup functions as a contextual menu near the click target (section 2.2).
- Date inputs across all forms use a styled wrapper with calendar icon (section 7.7).
- Settings page now uses tab navigation with section framing, moving it from generic admin layout toward composed product screen (sections 2.5, 7.1, 7.2).
- StamtabelManager inputs now use the shared `input-field` class, matching all other form controls (section 7.7).

**Where design quality is still below target:**
- RosterAssigner modal table still uses dense cell borders (PB-040 planned).
- Capacity page status badges use basic inline styles, not the new chip pattern.
- RosterProfileEditor grid uses bare STATUS_COLORS without dot indicators — functional but inconsistent with the planning grid.
- Sidebar and drivers page are functional but have not been evaluated against DESIGN.md section 7.8 and section 7.1 respectively.

## Recommended Next Improvements

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
- **Problem:** The RosterAssigner modal contains a table with dense `border border-border-default` on every cell. This conflicts with DESIGN.md section 4.1 and is visually inconsistent with the updated planning grid.
- **Proposed improvement:** Apply the same tonal separator approach used in the planning grid: remove cell borders, use subtle row separators, keep header bottom edge.
- **Expected user value:** Visual consistency between the planning grid and modal tables. More refined modal experience.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort consistency fix. Can be done opportunistically. Already planned as PB-040.

### EX-REC-022: Drivers page header and layout composition

- **Title:** Evaluate and improve drivers page composition
- **Problem:** The drivers page has not been reviewed against DESIGN.md standards. It likely follows the same pattern as the pre-redesign settings page — functional but potentially generic. As more screens are elevated, inconsistency between redesigned and un-redesigned screens becomes more visible.
- **Proposed improvement:** Review the drivers page header, filter grouping, table layout, and overall composition against DESIGN.md sections 2.5, 7.1, 7.2. Apply tab or surface grouping patterns if needed.
- **Expected user value:** Consistent product quality across all main screens. Users navigating between planning, settings, and drivers should feel the same design standard.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** With planning grid and settings page elevated, the drivers page is the next most visible screen to users. Consistency gap becomes more noticeable.

## Risks / Watch-outs

- **Planning grid redesign is complete — do not regress:** All three phases are done. Any future changes to PlanningGrid.tsx, DayCell.tsx, or StatusBadge.tsx should preserve the tonal hierarchy, chip patterns, and dot indicators.
- **RosterAssigner modal table inconsistency:** It uses dense cell borders while the planning grid does not. Users who interact with both surfaces in the same workflow will notice.
- **DayCell popup max height estimate:** The popup positioning uses a `POPUP_MAX_HEIGHT` constant of 280px. If leave types grow significantly, the actual popup may exceed this and get clipped at viewport edges.
- **Last-name-first format:** Driver names now display as "Achternaam, Voornaam" in the grid but "Voornaam Achternaam" in the roster assigner title. Consider standardizing across all views.
- **Date input showPicker compatibility:** The `showPicker()` API used by DateInput's calendar button is supported in modern browsers but may not work in older browsers. The native click-through on the picker indicator provides a fallback.
- **Tab state not persisted:** The settings page tab selection resets on navigation away and back. This is standard behavior but could be slightly jarring if users frequently switch between settings and other pages mid-configuration.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). The native calendar popup is functional and maintained by browsers. Custom calendar would add significant complexity for marginal quality improvement.
- **Settings tab URL persistence:** Could persist active tab via URL hash or query param. Low impact — settings is a low-frequency page.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
