# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-103: Login page simplified to Google-only with Dutch "under construction" notice. Microsoft button hidden, backend config intact.
- PB-105: Planning grid paginated data fetching. Drivers are loaded in pages of 100. Pagination controls (first/prev/next/last) appear below the grid. Page resets on scenario/date change. All existing interactions preserved.

**Current design alignment with DESIGN.md:**
- Sidebar: fully aligned (section 7.8).
- Settings page: well-aligned (sections 2.5, 7.1, 7.2).
- Login page: well-aligned. Clean, premium, brand-surface split.
- Header session indicator: well-aligned.
- Capacity page: well-aligned.
- Planning grid toolbar: well-aligned.
- Import source manager: well-aligned.
- Button system: fully aligned.
- Planning grid matrix: partially aligned. Virtual scrolling and pagination handle performance well. Visual structure (1px row borders, alternating backgrounds) still uses border-based separation rather than pure tonal layering per DESIGN.md.
- Drivers page: partially aligned. Pagination controls are clean and well-integrated. The table itself still reads as standard admin CRUD.
- Pagination controls (both pages): consistent pattern, well-integrated with design tokens.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.
- Client-side name filter on planning grid only searches the current page. Server-side search on for-range API would improve this.
- Capacity summary row shows totals for current page only. A separate aggregation API call would provide full-dataset totals.

## Recommended Next Improvements

### EX-REC-045: Planning grid — server-side search for paginated mode

- **Problem:** The planning grid name filter now only searches within the current page of 100 drivers. Users cannot search across all drivers without paging through manually.
- **Proposed improvement:** Add a `search` query parameter to the `/api/planning/for-range` endpoint (matching the pattern already used in `/api/drivers`). Update the planning grid to use server-side search with debounced input, resetting to page 1 on search change.
- **Expected user value:** Users can quickly find any driver by name regardless of which page they're on.
- **Priority:** P2 High
- **Effort:** Small
- **Dependencies:** PB-105 (completed).
- **Suggested owner:** Delivery Agent (API change) + Experience Agent (frontend integration)
- **Why now:** Pagination makes client-side search insufficient. This is the most impactful follow-up to PB-105.

### EX-REC-046: Capacity summary — full-dataset totals via aggregation API

- **Problem:** The capacity summary row at the bottom of the planning grid now shows totals only for the current page of drivers. This gives an incomplete picture of overall capacity.
- **Proposed improvement:** Use the existing `/api/planning/capacity` endpoint (or extend it) to fetch full-dataset capacity totals independently of pagination. Display these in the summary row regardless of current page.
- **Expected user value:** Accurate capacity overview without needing to view all pages.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-105 (completed).
- **Suggested owner:** Delivery Agent (API) + Experience Agent (frontend)
- **Why now:** Completes the capacity picture after pagination was introduced.

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

- **Planning grid client-side filter limitation.** The name filter only searches the current page of drivers. This could confuse users who search for a driver on a different page and see "Geen chauffeurs gevonden." EX-REC-045 addresses this.
- **Capacity summary page-scoped totals.** The capacity summary row shows totals for the current page only, not the full dataset. This could mislead planners relying on aggregate numbers. EX-REC-046 addresses this.
- **Planning grid row height accuracy.** Virtual scrolling uses fixed row heights (48/38/26px per density). Long driver names could cause minor scroll position drift.
- **PlanningGrid.tsx complexity.** The file is ~770 lines. Future changes should be tested with both virtual scrolling and pagination enabled.
- **Settings tab count growth.** The settings page has 5 tabs with horizontal scroll. More tabs may need visual affordance.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Capacity page full redesign:** The page is functional and visually consistent.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Recharts tooltip/axis custom styling:** Would improve premium feel but effort is disproportionate to impact.
- **Planning grid No-Line Rule enforcement:** Should be explored in a dedicated planning grid visual pass.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** Manual table virtualization preserves table structure. Same performance outcome.
- **Infinite scroll for drivers page:** Pagination is clearer for operational use.
- **Infinite scroll for planning grid:** Pagination gives users predictable position and page control. Infinite scroll adds complexity with virtual scrolling already in place.
- **Page size selector for planning grid:** Fixed 100 per page is reasonable. Configurable page size adds UI complexity without strong user demand.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
