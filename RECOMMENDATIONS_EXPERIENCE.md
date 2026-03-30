# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-016: Connectivity hub admin screen. New "Connectiviteit" tab in settings page with full CRUD for CSV import sources. Includes visual field mapping editor with arrow indicators, mapping preview chips on list items, composed empty state, and consistent interaction patterns (toast, confirm dialog, validation).

**Current design alignment with DESIGN.md:**
- Sidebar: well-aligned (section 7.8). Calm, dark, well-spaced, clear active states.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Composed tabs, clear hierarchy. New Connectiviteit tab follows the same pattern.
- Typography: improved. Manrope on page titles creates editorial contrast per section 5.1/5.3.
- Header: fully aligned. All three major pages show contextual subtitles per section 7.1.
- Capacity page: well-aligned. Scenario toggle uses brand semantics.
- Planning grid toolbar: well-aligned. Both rows use consistent `.control-group` pattern with labels.
- Design tokens: warning scale matches the nuance of success and danger families.
- Import source manager: well-aligned. Card-based layout, clear hierarchy, visual field mapping, composed empty state. Follows existing settings tab pattern.
- Planning grid matrix: partially aligned. Status chips and tonal row composition are good. Grid border structure and row composition have room for improvement.
- Drivers page: partially aligned. Page header is composed with contextual subtitle. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.

## Recommended Next Improvements

### EX-REC-036: Drivers table — reduce generic admin feel

- **Problem:** The drivers table uses alternating row backgrounds (`bg-surface-secondary/50` on odd rows), `border-b border-border-subtle` on every row, and a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns.
- **Proposed improvement:** Remove alternating row backgrounds (they add noise, not clarity). Introduce subtle row hover as the primary visual differentiation. Consider whether the 9-column table could benefit from column grouping or a denser badge treatment for license/skill columns.
- **Expected user value:** Cleaner, calmer table that feels more intentional and less like a default admin grid.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen. The alternating backgrounds are easy to remove and the result would be cleaner.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is now applied to page titles but not to section titles (`.text-section-title`) or modal headers. The typographic contrast between Manrope page titles and Inter section titles is intentional, but modal headers and form section headers could benefit from Manrope to reinforce hierarchy within complex screens.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and possibly `.settings-section-title`. Keep `.text-section-title` on Inter to maintain the intended contrast with page titles.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections. More cohesive editorial feel.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up. Should be evaluated visually before applying broadly.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool. DESIGN.md section 2.1 says screens should not feel like "lightly styled CRUD."
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit, or a drag-connect style interface. Also consider adding CSV file preview (upload a sample CSV to auto-detect column names) as a future enhancement.
- **Expected user value:** More intuitive, visual configuration experience. Reduced manual typing errors for column names.
- **Priority:** P4 Low
- **Effort:** Medium (card layout) / Large (CSV preview)
- **Dependencies:** PB-016 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The current editor is functional. This is a polish item for when the connectivity hub sees regular use.

### EX-REC-042: Deduplicate scenarios list fetch between PlanningGrid and ScenarioSelector

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`. While `useApiData` prevents redundant network requests within a single component lifecycle, the two components maintain separate state copies of the same data.
- **Proposed improvement:** Lift the scenarios list fetch to a shared context or parent component, or accept the minor duplication as tolerable given the small payload size.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent. The duplication is minimal and the scenarios list is small. Only worth addressing if PlanningGrid is refactored for other reasons.

## Risks / Watch-outs

- **PlanningGrid.tsx complexity.** The file is ~685 lines. Any further changes to the planning toolbar or grid must be verified carefully against typecheck, lint, and visual behavior. The file has known exhaustive-deps warnings that are pre-existing and non-blocking.
- **Manrope font weight on Vercel.** The font is loaded via `next/font/google` with `display: swap`. Verify on deployed build that Manrope renders correctly and does not cause layout shift.
- **Consistency after partial typographic changes.** Manrope on page titles + Inter on section titles is the intended hierarchy. If Manrope is extended further (EX-REC-038), verify the contrast still reads well.
- **Settings tab count growth.** The settings page now has 4 tabs. If more configuration categories are added (e.g., scheduled imports, user management), the tab bar may need responsive treatment or reorganization.
- **Import source API wrapper pattern.** The import source API returns `{ data: ... }` unlike other endpoints that return arrays directly. The `api.ts` client unwraps this. If other APIs are standardized to this pattern, the inconsistency should be resolved.
- **Drivers table column density.** Removing alternating backgrounds (EX-REC-036) only helps if the remaining visual treatment (hover, spacing) provides enough row distinction at high driver counts.
- **Planning grid No-Line Rule.** The grid's 1px row borders serve a functional purpose in dense data. Replacing them with pure tonal separation risks reducing scanability. Should be explored in a dedicated visual pass.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid interaction:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Capacity page full redesign:** The page is functional and visually consistent with grouped toolbar. Not warranted.
- **Full sidebar redesign:** Already meets DESIGN.md section 7.8.
- **Recharts tooltip/axis custom styling:** Would improve premium feel but effort is disproportionate to impact. Recharts customization is brittle.
- **Planning grid No-Line Rule enforcement:** The grid's 1px row borders serve a functional purpose in dense data. This should be explored in a dedicated planning grid visual pass, not as a standalone change.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen. A separate nav entry is not warranted until the connectivity hub has its own execution/monitoring features.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
