# Experience Agent Recommendations

## Summary

PB-058 (RosterAssigner name format) and PB-059 (Capacity page control bar grouping) are now completed.

**What was improved:**
- RosterAssigner modal title now displays driver names as "Achternaam, Voornaam", matching the drivers table and planning grid convention.
- Capacity page toolbar now has two contained control groups (period/zoom and compare) with `bg-surface-tertiary` backgrounds, tonal dividers, and structured internal spacing. Compare buttons use elevated pills with subtle shadow instead of flat bordered toggles.

**Design alignment with DESIGN.md:**
- Planning grid: fully aligned across all phases (sections 4.1, 5.2, 7.4, 7.5).
- Capacity page: toolbar now meets section 7.2 (grouped controls, clear sections, distinct groups). Table and chart are already aligned.
- Drivers page: composed header, tonal table rows, form section headers (sections 2.5, 7.1, 7.2, 7.3).
- Settings page: tab navigation with section framing (sections 2.5, 7.1, 7.2).
- Sidebar: calm, dark, well-spaced with clear active states (section 7.8).
- All tables: tonal separators, alternating rows, no dense border grids (section 4.1).
- All forms: date inputs with styled wrapper, input-field classes, validation patterns (section 7.7).

**Where design quality is still below target:**
- No major remaining gaps identified in common workflows. The application has reached a consistent visual standard across all core screens.

## Recommended Next Improvements

_No new recommendations at this time. All previously identified Experience Agent improvements have been completed._

The remaining backlog items (PB-018 foreign key validation, PB-015/016 connectivity hub) are owned by the Delivery Agent and Product Owner respectively.

## Risks / Watch-outs

- **New table components must follow the tonal separator pattern.** All existing tables use alternating rows with subtle tonal separators. Any new table must follow this — do not revert to dense 1px border grids.
- **Status chip pattern is universal.** `status-chip-compact` + `status-dot` is used in planning grid, capacity table, and RosterProfileEditor. New status displays should use this pattern.
- **Toolbar grouping pattern now exists.** The capacity page toolbar uses `bg-surface-tertiary` + tonal dividers for control grouping. If other pages need grouped toolbars, follow this pattern.
- **RosterProfileEditor cell size.** The `w-8 h-8` cells with `gap-0.5` are tight with the status dot. If additional information is added, cell size may need to increase.
- **DayCell popup max height.** The `POPUP_MAX_HEIGHT` constant of 280px may need adjustment if leave types grow significantly.

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
- **Capacity page full redesign:** The page is functional and now visually consistent with grouped toolbar. A full redesign is not warranted.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
