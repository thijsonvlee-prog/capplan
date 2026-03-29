# Experience Agent Recommendations

## Summary

PB-032 (planning grid Phase 1) and PB-036 (Escape key handling) are now completed. The planning grid no longer uses dense 1px borders on every cell. Structure is created through tonal surface layering, subtle row separators, and sticky column edge shadows. All modal overlays now support Escape key dismissal.

**Design alignment with DESIGN.md:**
- Planning grid now aligns with section 4.1 (No-Line Rule): borders replaced by tonal contrast and minimal separators.
- Header, data, group, and totals rows are visually differentiated through surface hierarchy (section 2.3).
- The grid reads more as a product surface than a spreadsheet (section 7.4), though row composition and cell rendering still need work (Phase 2 and Phase 3).
- All modal interactions now support Escape key, completing the accessible interaction pattern.
- Page headers, toolbar grouping, confirm dialogs, and focus trapping are all complete from prior cycles.

**Where design quality is still below target:**
- Row composition (driver name + metadata + cells) is still flat — Phase 2 (PB-034) addresses this.
- DayCell rendering uses basic colored fills without chip/badge refinement — Phase 3 (PB-035) addresses this.
- RosterAssigner internal table still uses dense `border border-border-default` on every cell (not in scope for PB-032 since it's a modal, not the planning grid surface).
- StamtabelManager inputs still use inline Tailwind classes instead of `input-field` class (PB-010, deferred).

## Recommended Next Improvements

### EX-REC-016: Planning grid Phase 2 — row composition and identity

- **Title:** Improve planning grid row composition
- **Problem:** Row composition combines name, metadata, and planning cells in a flat table structure. Driver identity (name, employee number, metadata) doesn't have clear visual hierarchy within each row.
- **Proposed improvement:** Stronger row identity zone — driver name with more confident typography, metadata as subdued supporting text, clearer visual separation between identity columns and planning columns.
- **Expected user value:** Faster driver identification when scanning. Better visual rhythm across rows.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-032 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Phase 1 surface layering is complete. Row composition is the next structural improvement before cell rendering refinement.

### EX-REC-018: Improve RosterAssigner modal table styling

- **Title:** Apply surface layering to RosterAssigner roster history table
- **Problem:** The RosterAssigner modal contains a table with dense `border border-border-default` on every cell. This conflicts with DESIGN.md section 4.1 and is visually inconsistent with the now-updated planning grid.
- **Proposed improvement:** Apply the same tonal separator approach used in the planning grid: remove cell borders, use subtle row separators, keep header bottom edge.
- **Expected user value:** Visual consistency between the planning grid and modal tables. More refined modal experience.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low effort consistency fix. Can be done opportunistically. Not urgent since the table is inside a modal.

### EX-REC-003: Standardize input field styling in StamtabelManager

- **Title:** Use CSS component classes consistently in StamtabelManager inputs
- **Problem:** The StamtabelManager form inputs use inline Tailwind classes for styling, while all other components use the `input-field` CSS class. Minor inconsistency in border radius, focus style, and sizing.
- **Proposed improvement:** Migrate StamtabelManager form inputs to use the `input-field` class.
- **Expected user value:** Visually consistent input fields across the entire settings page and application.
- **Priority:** P4 Low
- **Effort:** Small (two class replacements in one file)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Simple cleanup. Can be done opportunistically. Already backlogged as PB-010.

## Risks / Watch-outs

- **Phase 2 (PB-034) is the next critical gap:** With Phase 1 complete, the grid surface no longer looks like a spreadsheet, but row composition still feels flat. Phase 2 should be scheduled soon to build on this momentum.
- **RosterAssigner modal table is now the most visible inconsistency:** It uses dense cell borders while the planning grid does not. Users who interact with both surfaces will notice the difference.
- **Sticky column shadow on wide screens:** The `grid-sticky-edge` shadow is subtle by design. On very wide screens with many extra columns, the rightmost sticky column edge might not be immediately obvious. Monitor for user feedback.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Design token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well. Adds complexity without clear user value.
- **Redesign of RosterProfileEditor grid:** The click-to-cycle interaction is unconventional but functional and consistent.
- **Search loading indicators:** Marginal gain at current data volumes.
- **Placeholder-to-label migration in settings forms:** Would improve accessibility but requires significant layout adjustments. Monitor for user feedback.
- **Badge/pill component system:** Premature until Phase 3 (PB-035) establishes the chip/badge direction.
- **Full sidebar redesign:** The sidebar works and is calm. Not a priority over core screen improvements.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
