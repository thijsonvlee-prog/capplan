# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-096: Virtual scrolling for the planning grid. Only visible rows (~30-50) are now in the DOM at any time, regardless of total driver count. Uses manual table virtualization to preserve sticky header, sticky left columns, group rows, drag-select, and capacity summary. No external dependency added.
- PB-097: Pagination UI for the drivers page. Server-side search with 300ms debounce, pagination controls (first/prev/next/last, page size selector), total count display. All Dutch-labeled.

**Current design alignment with DESIGN.md:**
- Sidebar: fully aligned (section 7.8).
- Settings page: well-aligned (sections 2.5, 7.1, 7.2).
- Login page: well-aligned.
- Header session indicator: well-aligned.
- Capacity page: well-aligned.
- Planning grid toolbar: well-aligned.
- Import source manager: well-aligned.
- Button system: fully aligned.
- Planning grid matrix: partially aligned. Virtual scrolling improves performance but the visual structure (1px row borders, alternating backgrounds) still uses border-based separation rather than pure tonal layering per DESIGN.md.
- Drivers page: partially aligned. Pagination controls are clean and well-integrated. The table itself still reads as standard admin CRUD with alternating backgrounds and row borders.
- Pagination controls: new pattern, well-integrated with existing design tokens and component styles.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.
- The pagination control bar is functional and clean but could feel more product-grade with a stronger visual identity (e.g., page number buttons instead of just arrows, or a more intentional treatment).

## Recommended Next Improvements

### EX-REC-044: Planning grid — integrate paginated data fetching

- **Problem:** The planning grid currently loads all drivers in a single request. Virtual scrolling handles DOM performance, but the data transfer and memory cost of loading all drivers at once remains. At 1000+ drivers, initial load time will be significant.
- **Proposed improvement:** Integrate the paginated `api.planning.getForRange()` endpoint into the planning grid. Load drivers in pages (e.g., 100 per page). Add lightweight pagination or infinite scroll to the grid. The capacity summary row may need to use a separate aggregation API call rather than client-side computation.
- **Expected user value:** Faster initial load, lower memory usage, smooth experience at 1000+ drivers.
- **Priority:** P2 High
- **Effort:** Medium
- **Dependencies:** PB-096 (completed), PB-093 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Virtual scrolling handles the rendering bottleneck, but without paginated data fetching the network and memory bottleneck remains. This completes the scaling story.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Problem:** The drivers table uses alternating row backgrounds, `border-b border-border-subtle` on every row, and a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns.
- **Proposed improvement:** Remove alternating row backgrounds. Introduce subtle row hover as the primary visual differentiation. Consider whether the 9-column table could benefit from column grouping or a denser badge treatment for license/skill columns.
- **Expected user value:** Cleaner, calmer table that feels more intentional and less like a default admin grid.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen. Now that pagination is in place, visual refinement is the next logical step.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. This creates an inconsistency in the typographic hierarchy across complex screens.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and possibly `.settings-section-title`.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up. Should be evaluated visually before applying broadly.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool.
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit.
- **Expected user value:** More intuitive, visual configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The current editor is functional.

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the scenarios list fetch to a shared context or parent component, or accept the minor duplication.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent. Only worth addressing if PlanningGrid is refactored for other reasons.

## Risks / Watch-outs

- **Planning grid row height accuracy.** The virtual scrolling uses fixed row heights (48/38/26px per density). If driver name cells with long names or multi-line content exceed these heights, there could be a slight visual mismatch between spacer height and actual content height. At small scales this is invisible; at large scales with many groups it could cause minor scroll position drift. Monitor in production.
- **PlanningGrid.tsx complexity.** The file is ~721 lines. The GroupRows component was removed and replaced with inline rendering. Future changes to the planning grid row structure should be tested with virtual scrolling enabled.
- **Drivers page — pagination with mutations.** After creating or editing a driver, the list re-fetches the current page. If the mutation causes the driver to move to a different page (e.g., name change affecting sort order), the user won't see the updated driver on the current page. This is expected behavior for paginated lists.
- **Settings tab count growth.** The settings page has 5 tabs with horizontal scroll. If more tabs are added, visual affordance (e.g., fade edges) may be needed.
- **External image domains.** `next.config.mjs` allows Google and Microsoft avatar domains. Additional OAuth providers need their image domains allowlisted.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** The click-to-cycle interaction is unconventional but functional.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Capacity page full redesign:** The page is functional and visually consistent.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Recharts tooltip/axis custom styling:** Would improve premium feel but effort is disproportionate to impact.
- **Planning grid No-Line Rule enforcement:** Should be explored in a dedicated planning grid visual pass.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** ESC-007 approved react-window, but manual table virtualization was chosen to preserve the existing table structure (sticky header, sticky left columns, drag-select, group rows). react-window would require converting from table to div-based layout, which is a much larger and riskier change. The performance goal is achieved equally well.
- **Infinite scroll for drivers page:** Pagination is clearer for operational use. Users know exactly which page they're on and can navigate to specific positions. Infinite scroll introduces complexity with search and data consistency.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
