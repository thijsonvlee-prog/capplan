# Experience Agent Recommendations

## Summary

No backlog tasks were assigned to the Experience Agent this cycle. A fresh UX/design scan was performed against DESIGN.md to identify remaining gaps.

**What was improved this cycle:**
- Nothing — no tasks were in Ready status for the Experience Agent.

**Current design alignment with DESIGN.md:**
- Sidebar: well-aligned (section 7.8). Calm, dark, well-spaced, clear active states.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Composed tabs, clear hierarchy.
- Planning grid: partially aligned. Status chips, tonal control groups, and row composition are good. Toolbar second row and grid border structure have room for improvement.
- Capacity page: partially aligned. Toolbar grouping is good. Scenario toggle uses incorrect color semantics (warning instead of brand).
- Drivers page: partially aligned. Page header is composed. Table is still table-first with generic CRUD feel.
- Header component: below target. Thin strip with title + "CapPlan" label. Uses border-bottom instead of tonal separation.

**Where design quality is still below target:**
- Manrope typeface is specified in DESIGN.md section 5.1 for display/headline levels but is not loaded or used anywhere. All text uses Inter.
- The global header bar is minimal and underutilized — weak hierarchy, border-based separation.
- The capacity page active scenario toggle uses `warning-50`/`warning-700` instead of brand colors, creating a misleading semantic signal.
- The drivers table still reads as standard admin CRUD: alternating row backgrounds, row borders, table-first layout.

## Recommended Next Improvements

### EX-REC-033: Add Manrope typeface for display and headline levels

- **Problem:** DESIGN.md section 5.1 specifies Manrope for display and headline levels. Currently, only Inter is loaded. Page titles and section headers lack the editorial weight and typographic contrast intended by the design system.
- **Proposed improvement:** Add Manrope via `next/font/google`. Apply it to `.text-page-title` and optionally to other display-level elements. Keep Inter for body, labels, and dense data.
- **Expected user value:** Stronger visual hierarchy on every page. Page openings feel more intentional and product-grade. Clear typographic distinction between headlines and body content.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** None. Font addition is isolated.
- **Suggested owner:** Experience Agent
- **Why now:** This is a low-risk, high-impact change that affects every screen. It directly addresses a gap between the current implementation and DESIGN.md section 5.1/5.3.

### EX-REC-034: Fix capacity page scenario toggle color semantics

- **Problem:** The active scenario toggle on the capacity page uses `bg-warning-50 text-warning-700`, which semantically implies caution/warning. The correct semantic is active selection, which should use brand colors.
- **Proposed improvement:** Change selected scenario toggle from `warning-50`/`warning-700` to `brand-50`/`brand-700` (or `brand-600`/`text-inverse` for stronger emphasis).
- **Expected user value:** Correct semantic signaling. Active selection no longer looks like a warning state.
- **Priority:** P3 Medium
- **Effort:** Small (single line change)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Trivial fix. The current color is semantically wrong and creates inconsistency with brand color usage elsewhere.

### EX-REC-035: Strengthen header component composition

- **Problem:** The header bar (`Header.tsx`) is a thin 56px strip with just a page title on the left and "CapPlan" text on the right. It uses `border-b border-border-default` for separation, which conflicts with DESIGN.md's No-Line Rule (section 4.1). The right side is mostly empty. Per DESIGN.md section 7.1, every major screen should have a composed header zone.
- **Proposed improvement:** Remove the border-bottom, use tonal surface contrast instead (e.g., `bg-surface-primary` on `bg-surface-secondary` content area already provides contrast). Remove the redundant "CapPlan" label (already shown in sidebar). Optionally add contextual breadcrumbs or a scenario indicator for planning/capacity pages.
- **Expected user value:** Cleaner visual separation. Stronger page opening. Better alignment with No-Line Rule.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The header appears on every page. Removing the border and redundant label is a quick win for design consistency.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Problem:** The drivers table uses alternating row backgrounds (`bg-surface-secondary/50` on odd rows), `border-b border-border-subtle` on every row, and a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns.
- **Proposed improvement:** Remove alternating row backgrounds (they add noise, not clarity — the tonal row separators already handle visual grouping). Optionally introduce subtle row hover as the primary visual differentiation. Consider whether the 9-column table could benefit from column grouping or a denser badge treatment for license/skill columns.
- **Expected user value:** Cleaner, calmer table that feels more intentional and less like a default admin grid.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen. The alternating backgrounds are easy to remove and the result would be cleaner.

### EX-REC-037: Planning grid toolbar second row — tighter grouping

- **Problem:** The planning grid's second toolbar row contains search, grouping dropdown, column picker, totals toggle, and status legend. These controls are loosely arranged in a flex row without clear visual grouping. The status legend floats on the right as colored badges. Per DESIGN.md section 7.2, controls should be grouped by meaning, and the status legend should be treated as first-class information (section 8.3).
- **Proposed improvement:** Wrap search + grouping in a `.control-group`. Wrap column picker + totals toggle in a separate `.control-group`. Give the status legend its own visual zone (either a tonal surface or distinct placement). This matches the pattern already used in the first toolbar row.
- **Expected user value:** Clearer visual organization of planning controls. Status legend becomes easier to scan.
- **Priority:** P3 Medium
- **Effort:** Medium (PlanningGrid.tsx is complex — changes must be careful)
- **Dependencies:** None, but must follow PlanningGrid.tsx care rules from CLAUDE.md.
- **Suggested owner:** Experience Agent
- **Why now:** The first toolbar row has good grouping. Extending the same pattern to the second row creates consistency and improves the core planning screen.

## Risks / Watch-outs

- **PlanningGrid.tsx complexity.** Any change to the planning toolbar (EX-REC-037) must be verified carefully against typecheck, lint, and visual behavior. The file has known exhaustive-deps warnings that are pre-existing and non-blocking.
- **Manrope font loading.** Adding a second font increases initial page load slightly. Use `next/font/google` with `display: swap` and limit to the weights actually needed (600, 700).
- **Consistency after partial changes.** If Manrope is added to page titles but not section titles, ensure the hierarchy still reads well. The contrast between Manrope headlines and Inter body should feel intentional, not accidental.
- **Drivers table column density.** Removing alternating backgrounds only helps if the remaining visual treatment (hover, spacing, borders) provides enough row distinction at high driver counts.

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
