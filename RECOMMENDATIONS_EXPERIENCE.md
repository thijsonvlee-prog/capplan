# Experience Agent Recommendations

## Summary

PB-052 (SubTable tonal separator consistency) is now completed. The SubTable component used in driver edit tabs (Dienstverband, Functie, Rooster) now uses the same tonal separator pattern as the main drivers table and planning grid: subtle row separators, alternating row backgrounds, card surface wrapping, and `text-label` header styling.

**Design alignment with DESIGN.md:**
- Planning grid fully aligned across all three phases: surface layering, row composition, cell rendering (sections 4.1, 5.2, 7.4, 7.5).
- DayCell popup functions as a contextual menu near the click target (section 2.2).
- Date inputs across all forms use a styled wrapper with calendar icon (section 7.7).
- Settings page uses tab navigation with section framing (sections 2.5, 7.1, 7.2).
- Drivers page uses composed header with subtitle, tonal table rows, view-mode transitions, and form section headers (sections 2.5, 7.1, 7.2, 7.3).
- SubTable in driver edit tabs now uses tonal separators, card surface, and consistent header styling (sections 4.1, 7.4).
- StamtabelManager inputs use the shared `input-field` class (section 7.7).
- Active records in SubTable use `bg-success-50` (semantically correct — success token for positive state, per section 4.3).

**Where design quality is still below target:**
- RosterAssigner modal table still uses dense cell borders (PB-040 planned).
- Capacity page status badges use basic inline styles, not the chip pattern (PB-047 planned).
- RosterProfileEditor grid uses bare STATUS_COLORS without dot indicators.
- Sidebar has not been evaluated against DESIGN.md section 7.8.

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

- **Title:** Apply tonal separators to RosterAssigner roster history table
- **Problem:** The RosterAssigner modal contains a table with dense `border border-border-default` on every cell. This conflicts with DESIGN.md section 4.1 and is visually inconsistent with the updated planning grid, drivers table, and now SubTable.
- **Proposed improvement:** Apply the same tonal separator approach: remove cell borders, use subtle row separators, keep header bottom edge. Same pattern now used in SubTable.
- **Expected user value:** Visual consistency between the planning grid and modal tables. More refined modal experience.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort consistency fix. The SubTable pattern is now established — applying it to RosterAssigner is straightforward. Already planned as PB-040.

### EX-REC-024: RosterProfileEditor status indicators

- **Title:** Add dot indicators to RosterProfileEditor grid status cells
- **Problem:** The RosterProfileEditor grid uses bare `STATUS_COLORS` for cell backgrounds without the compact dot indicators used in the planning grid. This is a minor visual inconsistency in the settings flow.
- **Proposed improvement:** Add small status dots to RosterProfileEditor grid cells, matching the planning grid pattern.
- **Expected user value:** Consistent status visual language across all grid-like surfaces.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low priority — the RosterProfileEditor is a low-frequency settings screen. Recommend only when higher-priority work is complete.

## Risks / Watch-outs

- **Planning grid redesign is complete — do not regress:** All three phases are done. Any future changes to PlanningGrid.tsx, DayCell.tsx, or StatusBadge.tsx should preserve the tonal hierarchy, chip patterns, and dot indicators.
- **SubTable active row highlight uses success-50:** The `bg-success-50` token is semantically appropriate for "active" records (positive state). If the success token palette changes, SubTable active rows will change too.
- **RosterAssigner modal table inconsistency:** Uses dense cell borders while the planning grid, drivers table, and SubTable do not. Users who interact with both surfaces in the same workflow will notice. This is the last remaining dense-border table in common workflows.
- **DayCell popup max height estimate:** The popup positioning uses a `POPUP_MAX_HEIGHT` constant of 280px. If leave types grow significantly, the actual popup may exceed this and get clipped at viewport edges.
- **Name format now consistent:** Driver names display as "Achternaam, Voornaam" in both the drivers table and planning grid. The RosterAssigner title still uses "Voornaam Achternaam" — consider aligning when that modal is next updated.
- **Date input showPicker compatibility:** The `showPicker()` API used by DateInput's calendar button is supported in modern browsers but may not work in older browsers. The native click-through on the picker indicator provides a fallback.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). The native calendar popup is functional and maintained by browsers.
- **Settings tab URL persistence:** Could persist active tab via URL hash or query param. Low impact — settings is a low-frequency page.
- **Driver detail page / route-based navigation:** The current inline edit pattern works for the data volume. A dedicated detail route would add complexity without clear benefit at this scale.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
