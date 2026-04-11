# Experience Agent Recommendations

## Summary

**This cycle (2026-04-11):** Experience Agent run 21. Both Experience Agent items in the `Ready` section of `PRODUCT_BACKLOG.md` shipped: PB-206 (capacity chart custom tooltip + axis styling) and PB-207 (extend Manrope to section titles and modal headers). Fresh post-implementation UX scan done across the capacity page, settings, drivers, planning, and modal surfaces.

**What was improved this cycle:**

- **PB-206 — Capaciteitsgrafiek volledig in de huisstijl.** Replaced Recharts' default Tooltip, Legend, axis, and grid rendering on `CapacityChart.tsx` with a design-system-aligned implementation:
  - **Custom tooltip** (`CapacityChartTooltip`) on `surface-primary` with `shadow-dropdown`, `border-border-subtle`, a `text-caption` uppercase date label, and per-series rows combining a colored dot + series name in `text-text-secondary` + right-aligned `tabular-nums font-semibold` value in `text-text-primary`.
  - **Custom legend** (`CapacityChartLegend`) with small rounded swatches and `text-text-secondary` labels, replacing the default Recharts legend bar.
  - **Axes**: `tick={{ fill: "#9ca3af" /* --color-text-tertiary */ }}`, `tickLine={false}`, Y-axis `axisLine={false}`, X-axis baseline in `border-default`.
  - **Grid**: horizontal-only with a `"2 4"` dash pattern in `border-default` — calmer than the stock `"3 3"` and aligned with DESIGN.md §6.1 ("restrained ambient … only where elevation is genuinely helpful").
  - **Cursor**: soft `border-default` fill at 25% opacity instead of the default hard grey block, so the hover state dissolves into the grid.
  - All hex strings carry inline design-token comments per the CLAUDE.md Recharts exception rule.
- **PB-207 — Manrope uitgebreid naar sectie- en modaaltitels.** Added `font-family: var(--font-display)` to both `.text-section-title` and `.settings-section-title` in `globals.css`, and aligned both at `0.9375rem / 600 / letter-spacing: -0.01em`. Previously `.text-section-title` was `0.8125rem / 600` without Manrope, producing a weak mid-tier between the Manrope page title and the Inter label. The new tier strengthens the 3-step hierarchy (page title → section title → label) across all modals (ConfirmDialog, ScenarioSelector, RosterAssigner, the PlanningGrid bulk-status modal), the settings cards, the capacity page sections, the drivers page sub-sections, and the planning grid sub-section. No behavior change, typography only.

**Cross-check of adjacent areas after implementation:**
- Swept all `.tsx` files for `from "recharts"` imports — `CapacityChart.tsx` is the only chart in the product, so PB-206's polish covers the entire chart surface. No other Recharts widget needs a second pass.
- Swept `<h1-h6>` usages. `text-page-title`, `text-section-title`, and `settings-section-title` cover nearly all structural headings. A few inline-styled headings remain (login page brand label, sidebar brand label, mobile homescreen card titles, release note entry titles) — these are deliberately small/plain and are not candidates for Manrope. No unexpected inline section titles surfaced.
- Verified the new `.text-section-title` size bump (13 → 15px) does not crowd adjacent content in any call site — all 16 usages are standalone h2/h3 elements or label-like div headers with their own vertical rhythm (mb-2 / mb-3). No layout regressions expected.
- Checked that the capacity chart's `ResponsiveContainer` still operates inside its fixed `.mobile-capacity-chart-container` height (250px mobile, 350px desktop). The margin adjustment is within the existing container.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8.5/10.** The capacity page is now fully design-system integrated end-to-end (KPIs → chart → table). Section-title typography is uniform. The remaining gaps are narrow and well-known.
- **Planning grid:** Well-aligned (§7.4, §9). Four-zone toolbar, tonal row striping, full aria-label coverage, shared tab system on DriverForm.
- **Capacity page:** Fully aligned (§7.1, §7.3, §8.3, §6.1). Chart tooltip/legend/axis/grid now use design tokens.
- **Settings page:** Well-aligned (§2.5, §7.1). Section titles now Manrope.
- **Drivers page:** Well-aligned (§3.2, §7.3). Sub-table empty states actionable, row alternation clean, shared tab bar.
- **Modals:** Well-aligned (§7.3). All modal headers now use Manrope section-title typography.
- **Sidebar:** Well-aligned (§7.8).
- **Mobile:** Well-aligned.

**Where design quality is still below target:**
- RosterProfileEditor 28-day grid is still flat and mechanical (EX-REC-055, already in Deferred).
- StamtabelManager card headers visually distinct from the new larger section-title tier — see EX-REC-063 below for a tiny follow-up scan.

## Recommended Next Improvements

_EX-REC-049 and EX-REC-038 shipped this cycle as PB-206 and PB-207 and are recorded in the 11 april 2026 release notes entry._

### EX-REC-055: RosterProfileEditor — tonal layering and weekend differentiation

- **Problem:** The 28-day roster profile grid uses a plain HTML table with minimal styling. All days look identical regardless of weekday/weekend. No tonal contrast between weeks. Status cells are small (32px) with no visual rhythm. The grid feels flat and mechanical compared to the rest of the settings page, which uses tonal layering and hover elevation. Below DESIGN.md §7.4 standard (avoid harsh grid-line visuals, use spacing and tonal contrast).
- **Proposed improvement:** Add alternating week-row tonal layering (surface-secondary for even weeks). Visually distinguish weekend columns (Za/Zo) with a subtle background tint. Slightly increase cell size for touch friendliness. Add subtle rounded corners to the grid container.
- **Expected user value:** The roster profile editor feels intentionally designed rather than a raw grid. Weekday/weekend distinction helps planners quickly validate patterns.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** With EX-REC-049 shipped, this is the most visible remaining screen-level gap against DESIGN.md. Low traffic but the last "generic admin table" surface in the product.

### EX-REC-063: SubTable "Actief" marker — chip treatment instead of inline text (new)

- **Problem:** `src/components/drivers/SubTable.tsx:93` renders the active record indicator as plain `text-success-600 text-xs font-medium` text ("Actief") in the Einddatum column. Now that PB-207 has lifted the section-title hierarchy and PB-199 has cleaned up the empty state and row layering, this plain-text marker is the weakest visual element left in the driver form's sub-tables. A small chip/badge would make the active row instantly scannable without over-coloring the table.
- **Proposed improvement:** Wrap the "Actief" label in a compact success-tone chip (`inline-flex items-center px-1.5 py-0.5 rounded-full bg-success-100 text-success-700 text-[0.6875rem] font-medium uppercase tracking-wide`), and keep the `bg-success-50` row highlight unchanged. One visual change, zero layout impact.
- **Expected user value:** Driver form sub-tables scan faster — the active row is signaled both by tonal row highlight and by a compact chip in the same row, matching the chip pattern already used in the planning grid.
- **Priority:** P4 Low
- **Effort:** Trivial (single JSX edit)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Natural follow-through on the PB-199 SubTable cleanup. Visible in every driver edit flow. Low risk.

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

- **Section title size bump.** PB-207 lifted `.text-section-title` from 0.8125rem (13px) to 0.9375rem (15px). All 16 call sites were verified, but any future caller that embeds the class in a tight horizontal layout should double-check the extra height does not push adjacent content. Mitigation: the class comments in `globals.css` now document the intended hierarchy tier.
- **Recharts hex coupling.** `CapacityChart.tsx` hardcodes four hex values (`#9ca3af`, `#4b5563`, `#e2e5eb`) that mirror design tokens. If any of `--color-text-tertiary`, `--color-text-secondary`, or `--color-border-default` changes in `globals.css`, the inline hex strings must be updated in the same commit. Inline comments document the token binding, but there is no automatic guard.
- **Custom chart tooltip has no dark-mode story.** The tooltip uses `surface-primary` classes directly, which are currently defined as `#ffffff`. If dark mode is ever introduced, the tooltip will inherit automatically, but the Recharts-side hex strings will not. Out of scope for now.
- **Mobile planning is read-only.** Monitor user demand for edit capability (EX-REC-052).
- **RosterProfileEditor grid.** Flat, mechanical 28-day grid. See EX-REC-055.
- **Settings tab count growth.** The desktop settings page has 7 tabs. Adding more may need a different navigation pattern.

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

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
