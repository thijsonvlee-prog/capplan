# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-070: Header contextual enhancements. Created a `HeaderSubtitleProvider` context with `useHeaderSubtitle` hook. The shared header bar now shows contextual subtitles on the capacity page (active scenario name or "Basisplanning") and the drivers page (driver count). Subtitles use `.text-caption` styling, visually subordinate to the page title. This aligns with DESIGN.md 7.1 (composed header zone with contextual subtitle).
- PB-069: Warning design token scale expanded. Added `warning-50`, `warning-500`, `warning-700` to complete the warning color family. ScenarioSelector "Concept" badge updated to use softer `warning-50`/`warning-700` for a more refined treatment consistent with the `success-50`/`success-700` pattern.

**Current design alignment with DESIGN.md:**
- Sidebar: well-aligned (section 7.8). Calm, dark, well-spaced, clear active states.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Composed tabs, clear hierarchy.
- Typography: improved. Manrope on page titles creates editorial contrast per section 5.1/5.3.
- Header: improved. Contextual subtitles on 2 pages per section 7.1. No-Line Rule followed.
- Capacity page: well-aligned. Scenario toggle uses brand semantics. Header shows active scenario.
- Planning grid toolbar: well-aligned. Both rows use consistent `.control-group` pattern with labels.
- Design tokens: warning scale now matches the nuance of success and danger families.
- Planning grid matrix: partially aligned. Status chips and tonal row composition are good. Grid border structure and row composition have room for improvement.
- Drivers page: partially aligned. Page header is composed with contextual subtitle. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.
- Header contextual subtitles could be extended to the planning page (active scenario) if PlanningGrid is refactored to expose scenario data upward.

## Recommended Next Improvements

### EX-REC-041: Planning page header subtitle

- **Problem:** The planning page header currently shows only the page title. The capacity and drivers pages now show contextual subtitles (scenario name, driver count). The planning page could show the active scenario name for consistency, but PlanningGrid currently fetches `activeScenarioId` without the scenario name — ScenarioSelector fetches the list separately.
- **Proposed improvement:** Have PlanningGrid (or a small wrapper) call `useHeaderSubtitle` with the active scenario name. This requires either lifting the scenarios list fetch to PlanningGrid or reading it from ScenarioSelector's data.
- **Expected user value:** Consistent contextual header across all major pages. Immediate orientation on which scenario is active.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** PB-070 (completed). Requires minor data flow change in PlanningGrid.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort, high consistency value. Natural follow-up to PB-070.

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
- **Dependencies:** PB-063 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up to PB-063. Should be evaluated visually before applying broadly.

## Risks / Watch-outs

- **PlanningGrid.tsx complexity.** The file is ~679 lines. Any further changes to the planning toolbar or grid must be verified carefully against typecheck, lint, and visual behavior. The file has known exhaustive-deps warnings that are pre-existing and non-blocking.
- **Manrope font weight on Vercel.** The font is loaded via `next/font/google` with `display: swap`. Verify on deployed build that Manrope renders correctly and does not cause layout shift.
- **Consistency after partial typographic changes.** Manrope on page titles + Inter on section titles is the intended hierarchy. If Manrope is extended further (EX-REC-038), verify the contrast still reads well and doesn't flatten the hierarchy.
- **HeaderSubtitleProvider context.** The new context is lightweight and only stores a string. Performance impact is negligible. But pages that unmount should clean up their subtitle (the hook handles this via useEffect cleanup).
- **Drivers table column density.** Removing alternating backgrounds (EX-REC-036) only helps if the remaining visual treatment (hover, spacing) provides enough row distinction at high driver counts.
- **Planning grid No-Line Rule.** The grid's 1px row borders serve a functional purpose in dense data. Replacing them with pure tonal separation risks reducing scanability. Should be explored in a dedicated visual pass, not as a standalone change.

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
- **Planning grid No-Line Rule enforcement:** The grid's 1px row borders serve a functional purpose in dense data. Replacing them with pure tonal separation risks reducing scanability. This should be explored in a dedicated planning grid visual pass, not as a standalone change.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
