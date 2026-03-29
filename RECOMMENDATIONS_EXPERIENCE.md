# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-062: Capacity page scenario toggle now uses brand colors (`brand-50`/`brand-700`) instead of undefined warning tokens. Correct semantic signaling.
- PB-063: Manrope typeface loaded via `next/font/google` and applied to `.text-page-title`. Page titles now have distinct typographic weight, creating stronger hierarchy on every screen.
- PB-064: Header bar border removed (No-Line Rule compliance). Redundant "CapPlan" label removed. Tonal surface contrast provides separation.

**Current design alignment with DESIGN.md:**
- Sidebar: well-aligned (section 7.8). Calm, dark, well-spaced, clear active states.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Composed tabs, clear hierarchy.
- Typography: improved. Manrope on page titles creates editorial contrast per section 5.1/5.3. Inter remains for body/labels/data.
- Header: improved. No-Line Rule now followed. Clean tonal separation.
- Capacity page: improved. Scenario toggle uses correct brand semantics. Toolbar grouping is good.
- Planning grid: partially aligned. Status chips, tonal control groups, and row composition are good. Toolbar second row and grid border structure have room for improvement.
- Drivers page: partially aligned. Page header is composed. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid toolbar second row has loose control arrangement without clear grouping.
- Settings tab navigation uses `border-bottom` which conflicts with No-Line Rule (but serves a functional tab-indicator purpose — borderline acceptable).

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

### EX-REC-037: Planning grid toolbar second row — tighter grouping

- **Problem:** The planning grid's second toolbar row contains search, grouping dropdown, column picker, totals toggle, and status legend. These controls are loosely arranged in a flex row without clear visual grouping. The status legend floats on the right as colored badges. Per DESIGN.md section 7.2, controls should be grouped by meaning, and the status legend should be treated as first-class information (section 8.3).
- **Proposed improvement:** Wrap search + grouping in a `.control-group`. Wrap column picker + totals toggle in a separate `.control-group`. Give the status legend its own visual zone. This matches the pattern already used in the first toolbar row.
- **Expected user value:** Clearer visual organization of planning controls. Status legend becomes easier to scan.
- **Priority:** P3 Medium
- **Effort:** Medium (PlanningGrid.tsx is complex — changes must be careful)
- **Dependencies:** None, but must follow PlanningGrid.tsx care rules from CLAUDE.md.
- **Suggested owner:** Experience Agent
- **Why now:** The first toolbar row has good grouping. Extending the same pattern to the second row creates consistency and improves the core planning screen.

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

## Risks / Watch-outs

- **PlanningGrid.tsx complexity.** Any change to the planning toolbar (EX-REC-037) must be verified carefully against typecheck, lint, and visual behavior. The file has known exhaustive-deps warnings that are pre-existing and non-blocking.
- **Manrope font weight on Vercel.** The font is loaded via `next/font/google` with `display: swap`. Verify on deployed build that Manrope renders correctly and does not cause layout shift.
- **Consistency after partial typographic changes.** Manrope on page titles + Inter on section titles is the intended hierarchy. If Manrope is extended further (EX-REC-038), verify the contrast still reads well and doesn't flatten the hierarchy.
- **Drivers table column density.** Removing alternating backgrounds (EX-REC-036) only helps if the remaining visual treatment (hover, spacing) provides enough row distinction at high driver counts.

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
