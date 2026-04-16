# Experience Agent Recommendations

## Summary

**This cycle (2026-04-16):** Experience Agent run 23. No Ready tasks in backlog. Fresh full-application UX/design scan completed to identify new improvement opportunities.

**What was improved this cycle:**

No implementation this cycle — no Experience Agent tasks were in Ready status.

**Fresh scan findings (2026-04-16):**
Two genuinely new issues identified during the full-application design scan:

1. **Disabled pagination button opacity (EX-REC-064).** The `.btn-icon` CSS class has no `:disabled` rule. All 16 pagination buttons across 4 components use inline `disabled:opacity-30 disabled:cursor-not-allowed` — the 30% opacity is too faint for a premium product. Centralizing this in the CSS class would improve visual clarity and eliminate inline repetition.

2. **Sortable column headers lack keyboard accessibility (EX-REC-065).** The `<th>` elements in the planning grid have `onClick` handlers for sorting but no `role="button"`, `tabIndex`, or `onKeyDown`. Keyboard-only and screen reader users cannot sort columns. This was not previously flagged because DayCell accessibility (PB-202) focused on grid cells, not column headers.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8.5/10.** Unchanged from previous cycle. The remaining gaps are narrow and well-documented.
- **Planning grid:** Well-aligned (§7.4, §9). Four-zone toolbar, tonal row striping, full DayCell aria-label coverage. Column header keyboard access is the one remaining a11y gap (EX-REC-065).
- **Capacity page:** Fully aligned (§7.1, §7.3, §8.3, §6.1). Chart, KPIs, and table all use design tokens.
- **Settings page:** Well-aligned (§2.5, §7.1). Section titles Manrope.
- **Drivers page:** Fully aligned (§3.2, §7.3). Sub-table empty states actionable, row alternation clean, shared tab bar, Actief chip in place.
- **Modals:** Well-aligned (§7.3). All modal headers use Manrope section-title typography.
- **Sidebar:** Well-aligned (§7.8).
- **Mobile:** Well-aligned.

**Where design quality is still below target:**
- RosterProfileEditor 28-day grid is still flat and mechanical (EX-REC-055, already in Deferred).
- Disabled pagination buttons are too faint at 30% opacity (EX-REC-064, new).
- Planning grid column headers are not keyboard-accessible (EX-REC-065, new).

## Recommended Next Improvements

_EX-REC-063 shipped as PB-210 (2026-04-13). EX-REC-064 and EX-REC-065 are new this cycle._

### EX-REC-064: Centralize disabled state on .btn-icon and improve opacity

- **Problem:** The `.btn-icon` CSS class has no `:disabled` pseudo-class rule. All 16 pagination buttons across `PlanningGrid.tsx`, `DriverList.tsx`, `MobilePlanningView.tsx`, and `AuditLogViewer.tsx` repeat `disabled:opacity-30 disabled:cursor-not-allowed` inline. The 30% opacity is too faint — disabled buttons nearly disappear, which weakens the interactive hierarchy (DESIGN.md §7.6: buttons must communicate priority clearly). The same pattern applies to `.btn-icon-danger`.
- **Proposed improvement:** Add `:disabled` rules to `.btn-icon` and `.btn-icon-danger` in `globals.css`: `opacity: 0.4; cursor: not-allowed; pointer-events: none;`. Then remove the 16 inline `disabled:opacity-30 disabled:cursor-not-allowed` declarations. Single CSS edit + 4 component files cleanup.
- **Expected user value:** Disabled buttons are visibly distinct but not invisible. Consistent styling maintained in one place.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Pure consistency fix. The pattern is already established but not centralized. Improves design token discipline (one place to adjust disabled state) and removes 16 inline repetitions.

### EX-REC-065: Planning grid sortable column headers — keyboard accessibility

- **Problem:** The `<th>` elements for "Chauffeur" and extra columns in `PlanningGrid.tsx` (lines 490–517) have `onClick` handlers for sorting but no `role="button"`, `tabIndex={0}`, or `onKeyDown` handler. Keyboard-only users and screen readers cannot trigger sort actions. PB-202 resolved DayCell accessibility but did not cover column headers.
- **Proposed improvement:** Add `role="columnheader" aria-sort={...}` and `tabIndex={0}` plus `onKeyDown` (Enter/Space triggers sort) to the sortable `<th>` elements. Add `aria-label` with current sort direction. Small, focused edit in `PlanningGrid.tsx`.
- **Expected user value:** Keyboard users can sort the planning grid without a mouse. Screen readers announce sort state.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Accessibility is a product quality baseline, not optional polish. DayCell was addressed (PB-202); column headers are the remaining gap in the planning grid's interactive elements.

### EX-REC-055: RosterProfileEditor — tonal layering and weekend differentiation

- **Problem:** The 28-day roster profile grid uses a plain HTML table with minimal styling. All days look identical regardless of weekday/weekend. No tonal contrast between weeks. Status cells are small (32px) with no visual rhythm. The grid feels flat and mechanical compared to the rest of the settings page, which uses tonal layering and hover elevation. Below DESIGN.md §7.4 standard (avoid harsh grid-line visuals, use spacing and tonal contrast).
- **Proposed improvement:** Add alternating week-row tonal layering (surface-secondary for even weeks). Visually distinguish weekend columns (Za/Zo) with a subtle background tint. Slightly increase cell size for touch friendliness. Add subtle rounded corners to the grid container.
- **Expected user value:** The roster profile editor feels intentionally designed rather than a raw grid. Weekday/weekend distinction helps planners quickly validate patterns.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** This is the most visible remaining screen-level gap against DESIGN.md. Low traffic but the last "generic admin table" surface in the product.

### EX-REC-052: Mobile planning — edit capability (v2)

- **Problem:** The mobile planning view is read-only. Planners who check schedules on mobile may want to make quick status changes (e.g. mark a driver as sick) without returning to desktop.
- **Proposed improvement:** Add tap-to-edit on day cells in the month calendar. Tap a day then show a status selector (bottom sheet or inline). Use the existing `api.planning.upsert()` endpoint. Restrict to PLANNER/ADMIN roles.
- **Expected user value:** Planners can make urgent schedule adjustments on the go without switching to a desktop computer.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** PB-170 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** The mobile initiative is complete. Edit capability is the natural next step. Should be evaluated based on user feedback from the read-only version.

### EX-REC-053: Mobile homescreen — user greeting and scenario context

- **Problem:** The mobile homescreen shows cards without user-specific context. A personalized greeting and active scenario name would make the homescreen feel more operational.
- **Proposed improvement:** Add a greeting area above the card grid showing the user's name and active scenario. Use existing session and scenario API.
- **Expected user value:** The homescreen feels personalized and immediately communicates operational context.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** PB-169 (completed)
- **Suggested owner:** Experience Agent
- **Why now:** Low effort enhancement that could be combined with any future mobile work.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Problem:** The single-row composed toolbar may overflow on narrow viewports (< 1200px).
- **Proposed improvement:** Add responsive breakpoint to stack toolbar into two rows on narrow screens.
- **Expected user value:** Consistent toolbar experience across screen sizes.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Only relevant if narrow viewport usage is reported.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout. Could be more visual.
- **Proposed improvement:** Consider a card-based mapping representation.
- **Expected user value:** More intuitive configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. Current editor is functional.

### EX-REC-044: User group member assignment — batch API

- **Problem:** Member changes update each user individually via sequential API calls.
- **Proposed improvement:** Batch member assignment endpoint.
- **Expected user value:** Faster save for large groups.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not blocking. Current approach works for typical group sizes.

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the fetch to a shared context.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent.

## Risks / Watch-outs

- **Recharts hex coupling.** `CapacityChart.tsx` hardcodes four hex values (`#9ca3af`, `#4b5563`, `#e2e5eb`) that mirror design tokens. If any of `--color-text-tertiary`, `--color-text-secondary`, or `--color-border-default` changes in `globals.css`, the inline hex strings must be updated in the same commit. Inline comments document the token binding, but there is no automatic guard.
- **Custom chart tooltip has no dark-mode story.** The tooltip uses `surface-primary` classes directly, which are currently defined as `#ffffff`. If dark mode is ever introduced, the tooltip will inherit automatically, but the Recharts-side hex strings will not. Out of scope for now.
- **Mobile planning is read-only.** Monitor user demand for edit capability (EX-REC-052).
- **RosterProfileEditor grid.** Flat, mechanical 28-day grid. See EX-REC-055.
- **Settings tab count growth.** The desktop settings page has 7 tabs. Adding more may need a different navigation pattern.
- **Planning grid column headers keyboard gap.** Sortable `<th>` elements lack keyboard handlers. Keyboard-only users cannot sort columns. See EX-REC-065.
- **Disabled button visibility.** 30% opacity on disabled pagination buttons is too faint. See EX-REC-064.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional. Grid visual refinement could be a future polish item but is low priority.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** Manual table virtualization preserves table structure. Same performance outcome.
- **Infinite scroll for drivers/planning:** Pagination gives users predictable position and page control.
- **Page size selector for planning grid:** Fixed 100 per page is reasonable.
- **FormField wrapper component:** Reduces repetition but adds abstraction risk.
- **Skeleton loaders:** Spinner pattern works. Skeleton loaders add complexity without strong user demand.
- **Status legend popover collapse:** Inline legend provides constant reference.
- **Capacity page structural redesign:** PB-131 brought the page to product-grade quality. PB-182 aligned the table. PB-206 aligned the chart. The page is now fully integrated end-to-end.
- **Broad StamtabelManager No-Line refactor:** Borders serve usability in the card header/form. Row area uses tonal layering (PB-180).
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B. Only key screens need mobile optimization.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow validated first.
- **Mobile homescreen route rename:** `/planning` is functionally clean for both homescreen and planning.
- **Mobile capacity scenario compare:** Too complex for small screens.
- **Mobile drivers page visual refresh:** Completed (PB-175).
- **Form validation entrance animation:** Minor polish. Current inline error display is functional and clear.
- **Toast micro-interactions (stagger, exit):** Current slide-in is sufficient. Over-animating risks feeling unserious.
- **Custom select component replacement:** Native HTML `<select>` elements are used throughout. While a custom select would feel more premium, it would introduce significant complexity and likely require an external dependency. The `.input-field` class provides adequate styling. Not worth the risk.
- **Icon size CSS classes (icon-sm, icon-md, icon-lg):** Scan found mixed icon sizing (Lucide `size={}` props, Tailwind `w-4 h-4`, arbitrary values). However, icon sizing is already largely consistent within each component and the variation is minor. Adding a new abstraction layer is not worth the churn.
- **Empty state icon illustrations:** Empty states could be visually richer with icons. However, the current text-based empty states are clear, actionable, and consistent. Adding icons to every empty state adds visual weight without clear UX benefit.
- **Form validation error icons:** Validation errors use plain red text. Adding error icons would be more premium but the current pattern is consistent, clear, and functional across all forms.
- **Capacity chart interactive legend:** Legend items could toggle series visibility. Standard in dashboards but adds interaction complexity for a chart that works well as-is.
- **CapacityKPIs card redesign:** Current cards are functional.
- **CapacityTable further redesign:** PB-182 brought the table to tonal layering standard.
- **DocumentatiePage in-body title:** The release notes page relies on the header bar for its title.
- **DriverForm skill/license toggle color unification:** Skills use success-600 and licenses use brand-600. The color difference helps users distinguish the two toggle groups in the same form.
- **DriverForm computed fields token upgrade (surface-tertiary → surface-inset):** The computed section already reads as distinct from editable fields. Token distinction is subtle.
- **Manrope on sidebar brand label or mobile homescreen card titles:** These are intentionally small/plain Inter labels. Switching to Manrope would add weight without improving legibility at small sizes.
- **Capacity chart series color recoloration:** The status chart colors are intentionally semantically stable (green for base/extra, yellow for leave, red for sick). Changing them would break a system-wide convention.
- **Single-file chart tooltip extraction:** The custom tooltip and legend are local to `CapacityChart.tsx` — they are the only chart in the product and do not need to be extracted into a reusable module yet.
- **DriverForm tab bar divergence:** Resolved (PB-203).
- **DayCell accessibility gaps:** Resolved (PB-202).
- **SubTable default empty state:** Resolved (PB-199).
- **StatusSelector danger color override:** Resolved (PB-198).
- **Desktop duplicate page title:** Resolved (EX-REC-057, 2026-04-08).
- **SubTable "Actief" plain text marker:** Resolved (PB-210, 2026-04-13).

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
