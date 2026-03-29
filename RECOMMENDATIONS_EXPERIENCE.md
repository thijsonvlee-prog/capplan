# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-067: Planning grid toolbar second row now has full `.control-group` consistency. The status legend is wrapped in its own visual zone with a "Status" label, matching the tonal surface treatment of the search/grouping and columns/totals groups. All three groups in row 2 now match the first toolbar row's pattern.
- PB-068: ScenarioSelector "Concept" badge now uses `bg-warning-200 text-warning-900` design tokens instead of hardcoded `bg-amber-100 text-amber-700`. CLAUDE.md compliance restored.

**Current design alignment with DESIGN.md:**
- Sidebar: well-aligned (section 7.8). Calm, dark, well-spaced, clear active states.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Composed tabs, clear hierarchy.
- Typography: improved. Manrope on page titles creates editorial contrast per section 5.1/5.3.
- Header: improved. No-Line Rule followed. Clean tonal separation.
- Capacity page: well-aligned. Scenario toggle uses brand semantics. Toolbar grouping is good.
- Planning grid toolbar: now well-aligned. Both rows use consistent `.control-group` pattern with labels. Status legend has its own visual zone per DESIGN.md 8.3.
- Planning grid matrix: partially aligned. Status chips and tonal row composition are good. Grid border structure and row composition have room for improvement.
- Drivers page: partially aligned. Page header is composed. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.
- Warning token set is sparse (only `warning-200`, `warning-300`, `warning-900`). A `warning-50` and `warning-700` would allow more nuanced badge/chip styling consistent with the success and danger token scales.

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
- **Dependencies:** PB-063 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up to PB-063. Should be evaluated visually before applying broadly.

### EX-REC-039: Header contextual enhancements

- **Problem:** The header bar is now clean (no border, no redundant label) but still minimal — just a page title. DESIGN.md section 7.1 describes a composed header zone with contextual subtitle, status, or timeframe where useful, plus grouped utilities and a primary action.
- **Proposed improvement:** For planning and capacity pages, consider adding a contextual subtitle (e.g., current period or scenario name). For the drivers page, consider showing the active driver count. This should be done carefully — the header must remain calm, not cluttered.
- **Expected user value:** Better context at a glance without scrolling into page content. Stronger page opening per DESIGN.md 7.1.
- **Priority:** P3 Medium
- **Effort:** Medium (requires per-page context data to be passed to header)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The header is the right base to build on after PB-064. Adding context improves every page's opening.

### EX-REC-040: Expand warning design token scale

- **Problem:** The warning token set only has 3 values (`warning-200`, `warning-300`, `warning-900`), while success has 8 and danger has 6. This makes it difficult to style warning badges, chips, and backgrounds with the same nuance as other functional colors. The ScenarioSelector "Concept" badge now uses `warning-200`/`warning-900` which works but is less refined than the `success-50`/`success-700` pattern available for positive states.
- **Proposed improvement:** Add `warning-50` (~`#fefce8`), `warning-500` (~`#eab308`), and `warning-700` (~`#a16207`) to the design token set in `globals.css`. This enables consistent badge/chip styling across all functional color families.
- **Expected user value:** More consistent visual language for caution/warning states across the application.
- **Priority:** P4 Low
- **Effort:** Small (3 CSS variable additions)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Quick fix that improves design system completeness. No risk.

## Risks / Watch-outs

- **PlanningGrid.tsx complexity.** The file is ~679 lines. Any further changes to the planning toolbar or grid must be verified carefully against typecheck, lint, and visual behavior. The file has known exhaustive-deps warnings that are pre-existing and non-blocking.
- **Manrope font weight on Vercel.** The font is loaded via `next/font/google` with `display: swap`. Verify on deployed build that Manrope renders correctly and does not cause layout shift.
- **Consistency after partial typographic changes.** Manrope on page titles + Inter on section titles is the intended hierarchy. If Manrope is extended further (EX-REC-038), verify the contrast still reads well and doesn't flatten the hierarchy.
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
