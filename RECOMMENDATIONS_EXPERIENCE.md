# Experience Agent Recommendations

## Summary

**This cycle (2026-04-09):** Experience Agent run 19. Executed both Experience Agent items from the `Ready` section: PB-198 (StatusSelector danger color override) and PB-199 (SubTable empty state + row alternation). Post-implementation fresh scan of the driver form area, StatusSelector, DayCell, and driver list page.

**What was improved this cycle:**
- **StatusSelector "Bevestigen" button (PB-198):** Removed the `bg-danger-500 hover:bg-danger-600` override on the sick-percentage confirm button. The button now renders in standard brand color, preserving the danger-red-for-destructive rule defined in DESIGN.md §4.2.
- **SubTable empty state (PB-199):** Default empty message changed from "Geen records" to an actionable Dutch fallback with next-step guidance. All three caller sites (dienstverbanden, functies, roostertoewijzingen) updated with entity-specific messages. Closes the last CLAUDE.md §6 empty-state gap in driver sub-tables.
- **SubTable row alternation (PB-199):** Replaced `bg-surface-secondary/50` opacity trick with solid `bg-surface-secondary`, consistent with tonal layering in StamtabelManager and SkillManager.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8/10.** Design tokens, typography hierarchy, and surface layering are comprehensive and consistently applied across all major screens.
- **Planning grid:** Well-aligned (§7.4, §9). Toolbar in four zones, tonal row striping. StatusSelector button semantics now correct.
- **Driver form:** Well-aligned (§7.3, §7.7). Sub-table empty states now actionable. Row alternation clean. Some minor quality gaps remain (tab system duplication, skill/license toggle color inconsistency, computed fields token choice).
- **Capacity page:** Well-aligned (§7.1, §7.3, §8.3). Chart tooltip/axis styling remains the gap (EX-REC-049).
- **Settings page:** Well-aligned (§2.5, §7.1).
- **Sidebar:** Well-aligned (§7.8).
- **Mobile:** Well-aligned across all screens.

**Where design quality is still below target:**
- Recharts default tooltip/axis styling on capacity page (EX-REC-049).
- RosterProfileEditor 28-day grid remains flat (EX-REC-055).
- DriverForm tab bar duplicates `.settings-tabs` system with a slightly different active color (EX-REC-061, new).
- DayCell lacks aria-labels and has incomplete tooltip coverage (EX-REC-062, new).

## Recommended Next Improvements

_EX-REC-059 and EX-REC-060 shipped as PB-198 and PB-199 this cycle._

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Problem:** The Recharts AreaChart uses default tooltip and axis styling. The default Recharts tooltip feels generic compared to the rest of the product-grade capacity page. The CartesianGrid uses a plain dashed pattern. Now that both the KPIs above and the table below use the design system consistently, the chart is the most visible remaining gap on this screen.
- **Proposed improvement:** Add a custom tooltip component with the app's design tokens (surface-primary background, shadow-dropdown, text tokens). Style axis ticks with text-text-secondary color. Refine grid line opacity.
- **Expected user value:** The chart feels fully integrated with the design system instead of an embedded third-party widget.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** After PB-182 the capacity table is aligned. The chart is now the only element on the capacity page that still uses default third-party styling.

### EX-REC-055: RosterProfileEditor — tonal layering and weekend differentiation

- **Problem:** The 28-day roster profile grid uses a plain HTML table with minimal styling. All days look identical regardless of weekday/weekend. No tonal contrast between weeks. Status cells are small (32px) with no visual rhythm. The grid feels flat and mechanical compared to the rest of the settings page, which uses tonal layering and hover elevation. Below DESIGN.md §7.4 standard (avoid harsh grid-line visuals, use spacing and tonal contrast).
- **Proposed improvement:** Add alternating week-row tonal layering (surface-secondary for even weeks). Visually distinguish weekend columns (Za/Zo) with a subtle background tint. Slightly increase cell size for touch friendliness. Add subtle rounded corners to the grid container.
- **Expected user value:** The roster profile editor feels intentionally designed rather than a raw grid. Weekday/weekend distinction helps planners quickly validate patterns.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-traffic screen but visible gap in settings page quality. All other settings sections are now at design system standard.

### EX-REC-061: DriverForm tab bar — adopt shared settings-tabs system

- **Problem:** `DriverForm.tsx:114-129` uses hand-rolled inline Tailwind classes for the tab bar (`border-b-2`, `px-4 py-2`, `border-brand-600`, etc.). The design system already defines `.settings-tabs` and `.settings-tab` in `globals.css` with the same visual contract, including `data-active` attribute support. The DriverForm active state uses `text-brand-600` while `.settings-tab` uses `text-brand-700` — a subtle color inconsistency. Adopting the shared system would eliminate ~15 lines of inline styling and ensure tab-bar consistency across all screens.
- **Proposed improvement:** Replace the inline tab classes with `.settings-tabs` / `.settings-tab` and `data-active` attributes. Rename the CSS classes to a more generic name (e.g. `.tab-bar` / `.tab-item`) if needed, since "settings" in the name may be misleading when used in driver forms.
- **Expected user value:** Tab bars look and behave identically across settings and driver forms. Consistent active color.
- **Priority:** P4 Low
- **Effort:** Trivial
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Surfaced during the fresh scan. Simple consistency fix.

### EX-REC-062: DayCell accessibility — aria-labels and tooltip coverage

- **Problem:** `DayCell.tsx:84-97` renders a `<button>` that opens the status selector but has no `aria-label`. Screen readers read only the opaque StatusBadge content or a middle-dot character. Additionally, `title` tooltips are only generated for BASE_ROSTER, LEAVE, and SICK statuses — other statuses (AVAILABLE_EXTRA, DAY_OFF) produce no tooltip. This means users lose hover context on those cells.
- **Proposed improvement:** Add `aria-label` combining driver name, date, and current status label. Extend the `title` builder to cover all statuses using `STATUS_LABELS` from constants.
- **Expected user value:** Better accessibility for screen reader users. Consistent hover tooltips across all planning statuses.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Accessibility gap on the core product surface. Low risk to fix.

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

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. Subtle inconsistency in typographic hierarchy.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and `.settings-section-title`.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk typographic refinement.

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

- **Header title source coupling.** The duplicate-title fix introduces an exception set (`DESKTOP_PAGES_WITH_OWN_TITLE`) in `Header.tsx`. Any future page that adds its own composed page-header must also be added to that set, otherwise the title will duplicate again.
- **Mobile planning is read-only.** Planners must use desktop to make schedule changes. Monitor user demand for mobile edit capability (EX-REC-052).
- **Recharts default styling.** The capacity chart's tooltip/axis styling is still Recharts default. Now the most visible remaining integration gap on the capacity page. See EX-REC-049.
- **RosterProfileEditor grid.** Flat, mechanical 28-day grid with stark status colors. Below DESIGN.md standard but low-traffic screen. See EX-REC-055.
- **DriverForm tab bar divergence.** The driver form uses a hand-rolled tab bar that is almost but not quite identical to the settings tab system. This could grow into a wider consistency issue if more tab-based views are added. See EX-REC-061.
- **DayCell accessibility.** The planning grid's core interactive element (the day cell button) has no aria-labels and incomplete tooltips. This is the most impactful accessibility gap on the primary product surface. See EX-REC-062.
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
- **Capacity page structural redesign:** PB-131 brought the page to product-grade quality. PB-182 further aligned the table.
- **Broad StamtabelManager No-Line refactor:** Borders serve usability in the card header/form. Row area now uses tonal layering (PB-180).
- **Full mobile-first redesign of all screens:** ESC-013 decided Option B. Only key screens need mobile optimization.
- **Mobile planning edit in v1:** Deliberately deferred to v2. Read-only flow validated first.
- **Mobile homescreen route rename:** `/planning` is functionally clean for both homescreen and planning.
- **Mobile capacity scenario compare:** Too complex for small screens. Desktop-only is appropriate until user demand exists.
- **Mobile drivers page visual refresh:** Completed (PB-175). No further work needed.
- **Form validation entrance animation:** Minor polish. Current inline error display is functional and clear.
- **Toast micro-interactions (stagger, exit):** Current slide-in is sufficient. Over-animating risks feeling unserious.
- **CapacityKPIs card redesign:** Current cards are functional. Elevating them would require establishing a new KPI card pattern — not justified without stronger need.
- **CapacityTable further redesign:** PB-182 brought the table to tonal layering standard. Current state is aligned with DESIGN.md §4.1 and §7.4. No further work needed.
- **DocumentatiePage in-body title:** The release notes page relies on the header bar for its title. This is consistent with the header-bar-only pattern for pages without their own composed page-header (same as Planning). No duplication risk.
- **SubTable "Actief" chip treatment:** The plain `text-success-600` text for active records could be upgraded to a chip badge for stronger visual signaling, but the current treatment is functional and readable. The endDate column clearly conveys the information. Elevating this is cosmetic.
- **DriverForm skill/license toggle color unification:** Skills use success-600 and licenses use brand-600 as selected colors. While technically inconsistent, the color difference helps users distinguish the two toggle groups in the same form. Unifying could reduce scanability.
- **DriverForm computed fields token upgrade (surface-tertiary → surface-inset):** The computed section already reads as distinct from editable fields. The surface-tertiary vs surface-inset distinction is subtle (~4 shade steps) and unlikely to improve user comprehension meaningfully.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
