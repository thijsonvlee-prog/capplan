# Experience Agent Recommendations

## Summary

PB-047 (Capacity page status badge consistency), PB-040 (RosterAssigner modal table styling), and PB-057 (RosterProfileEditor status dot indicators) are now completed. All three were the last remaining visual consistency gaps from the planning grid redesign.

**Design alignment with DESIGN.md:**
- Planning grid fully aligned across all three phases: surface layering, row composition, cell rendering (sections 4.1, 5.2, 7.4, 7.5).
- Capacity table now uses `status-chip-compact` + `status-dot` pattern, tonal separators, alternating rows, and `text-label` headers (sections 4.1, 7.5).
- RosterAssigner modal table uses tonal separators, card surface, alternating rows, and `bg-success-50` for active records (sections 4.1, 7.3).
- RosterProfileEditor grid cells now show status dots consistent with the planning grid (section 7.5).
- Drivers page uses composed header, tonal table rows, and form section headers (sections 2.5, 7.1, 7.2, 7.3).
- SubTable in driver edit tabs uses tonal separators, card surface, and consistent header styling (sections 4.1, 7.4).
- Settings page uses tab navigation with section framing (sections 2.5, 7.1, 7.2).
- DayCell popup functions as a contextual menu near the click target (section 2.2).
- Date inputs across all forms use a styled wrapper with calendar icon (section 7.7).
- Sidebar is calm, dark, well-spaced with clear active states (section 7.8).

**Where design quality is still below target:**
- No remaining dense-border tables in common workflows.
- RosterAssigner title still uses "Voornaam Achternaam" while drivers table and planning grid use "Achternaam, Voornaam" — minor name format inconsistency.
- Capacity page compare scenario buttons could benefit from stronger grouping and visual distinction.

## Recommended Next Improvements

### EX-REC-025: RosterAssigner driver name format consistency

- **Title:** Align RosterAssigner title with "Achternaam, Voornaam" format
- **Problem:** The RosterAssigner modal title displays the driver name as "Voornaam Achternaam" while the drivers table and planning grid use "Achternaam, Voornaam". Users who open the modal from the planning grid see an inconsistent name format.
- **Proposed improvement:** Pass the formatted name from the calling context, or format it in the modal title to match the "Achternaam, Voornaam" convention.
- **Expected user value:** Consistent name presentation across all surfaces.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None — the name is passed as a prop from the parent component.
- **Suggested owner:** Experience Agent
- **Why now:** Very small change. Can be done opportunistically alongside any RosterAssigner work.

### EX-REC-026: Capacity page control bar grouping

- **Title:** Improve capacity page toolbar grouping and visual hierarchy
- **Problem:** The capacity page toolbar (period selector, zoom, compare buttons) is a flat row of controls with weak visual grouping. The compare scenario buttons use small pill-style toggles that don't feel strongly grouped. This is functional but below the DESIGN.md standard for toolbar composition (section 7.2).
- **Proposed improvement:** Group the period/zoom controls into a contained toolbar section. Separate the compare controls into a distinct group with a subtle background or framing. Ensure the primary content area (chart + table) feels clearly separated from controls.
- **Expected user value:** Stronger visual hierarchy on the capacity page. Faster scanning of what controls are available.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The capacity page table is now visually aligned. The control bar is the remaining area that feels generic.

## Risks / Watch-outs

- **All dense-border tables are now resolved:** The planning grid, drivers table, SubTable, capacity table, and RosterAssigner table all use tonal separators. Any new table components must follow this pattern.
- **Status chip pattern is now universal:** `status-chip-compact` + `status-dot` is used in the planning grid, capacity table, and (as dots only) in the RosterProfileEditor. New status displays should use this pattern.
- **RosterProfileEditor grid cell size:** Adding the dot indicator reduces the space for the status code letter. At the current `w-8 h-8` cell size with `gap-0.5`, this is tight but legible. If additional information is added to cells in the future, the cell size may need to increase.
- **DayCell popup max height estimate:** The popup positioning uses a `POPUP_MAX_HEIGHT` constant of 280px. If leave types grow significantly, the actual popup may exceed this and get clipped at viewport edges.
- **Date input showPicker compatibility:** The `showPicker()` API used by DateInput's calendar button is supported in modern browsers but may not work in older browsers. The native click-through on the picker indicator provides a fallback.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid interaction:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Full sidebar redesign:** The sidebar is calm, dark, well-spaced, and meets DESIGN.md section 7.8. Not a priority.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). The native calendar popup is functional and maintained by browsers.
- **Settings tab URL persistence:** Could persist active tab via URL hash or query param. Low impact — settings is a low-frequency page.
- **Driver detail page / route-based navigation:** The current inline edit pattern works for the data volume. A dedicated detail route would add complexity without clear benefit at this scale.
- **Capacity page full redesign:** The page is functional and now visually consistent. The control bar grouping (EX-REC-026) is a small targeted improvement; a full redesign is not warranted.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
