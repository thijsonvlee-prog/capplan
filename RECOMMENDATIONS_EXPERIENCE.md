# Experience Agent Recommendations

## Summary

**This cycle (2026-04-08):** Experience Agent run 18. No Experience Agent items were in the `Ready` section of `PRODUCT_BACKLOG.md` (the only ready items, PB-196/PB-197, are Delivery Agent validation-consolidation refactors). Cycle was therefore used for a fresh UX/design scan plus one small, focused header-structure fix surfaced during the scan.

**What was improved this cycle:**
- **Duplicate page title on desktop eliminated (EX-REC-057).** `Header.tsx` was rendering `<h1 class="text-page-title">` for every route in `PAGE_TITLES`, and three screens (Capaciteit, Chauffeurs, Instellingen) ALSO render their own composed page-header with the same title — producing two identical Manrope headings on the same desktop view, which directly violates DESIGN.md §2.5 (composed screens with one clear title anchor). Added a `DESKTOP_PAGES_WITH_OWN_TITLE` exception set to `Header.tsx` so the header bar suppresses its title only on those three routes, only on desktop. Mobile behaviour is unchanged (those pages hide their in-body title on small screens, so the header bar is still their sole title source). Planning and Releasenotes continue to rely on the header bar because they have no composed page-header of their own. `npm run verify` passes.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 8/10.** The application exceeds generic admin UI across all screens. Design tokens are comprehensive (~55 tokens), typography hierarchy is strong (Manrope display + Inter body), and surface layering is consistently applied.
- **Header structure:** Now aligned with DESIGN.md §2.5 (composed screens with one clear title anchor). Desktop no longer duplicates the page title on the three screens with their own composed page-header.
- **Planning grid:** Well-aligned (sections 7.4, 9). Toolbar organized into four zones. Tonal row striping with hover effects.
- **Capacity page:** Well-aligned (sections 7.1, 7.3, 8.3). KPI summary module, grouped toolbar with comparison pills, chart + table sections clearly separated. **Chart remains the gap** — default Recharts tooltip/axis styling.
- **Settings page:** Well-aligned (sections 2.5, 7.1). StamtabelManager and SkillManager rows use tonal layering with hover elevation and brand accent editing state.
- **Drivers page:** Well-aligned (sections 3.2, 7.3). Composed page header, integrated search, tonal row alternation.
- **Mobile experience:** Well-aligned across all screens. Consistent header pattern, entrance animations, touch-friendly targets.
- **Sidebar:** Well-aligned (section 7.8). Dark premium surface, clear active states.
- **Release notes page:** Well-composed with expandable sections and category badges. Title now renders cleanly once via the header bar (no duplication).

**Where design quality is still below target:**
- Recharts default tooltip/axis styling remains the most visible desktop integration gap (EX-REC-049).
- RosterProfileEditor 28-day grid is flat and mechanical — no tonal layering, no weekend differentiation, no visual rhythm (EX-REC-055).
- StatusSelector "Bevestigen" button for ziek overrides `btn-primary` with `bg-danger-500` — semantically wrong, a confirm is not a destructive action (EX-REC-059, new).

## Recommended Next Improvements

_EX-REC-057 shipped directly this cycle (duplicate page title on desktop) and is recorded in the release notes as the 8 april 2026 entry._

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

### EX-REC-059: StatusSelector "Bevestigen" button uses danger color override

- **Problem:** `src/components/planning/StatusSelector.tsx:141` renders the sick-percentage confirm button as `className="btn-primary w-full justify-center bg-danger-500 hover:bg-danger-600"`. The `bg-danger-*` classes override `btn-primary`'s brand background, producing a red CTA on a non-destructive action. Per DESIGN.md §4.2, color must be functional and intentional — danger red is reserved for destructive and error states. Confirming a sick percentage is a neutral planning action, not a destructive one. The red button also visually competes with the actual delete affordances elsewhere in the product, weakening the semantic system.
- **Proposed improvement:** Drop the `bg-danger-500 hover:bg-danger-600` override and let the button render as standard `btn-primary w-full justify-center`. The SICK context is already conveyed by the modal title/flow and the sick-percentage input above the button.
- **Expected user value:** Consistent, trustable button semantics; the red-for-destructive rule stays intact.
- **Priority:** P4 Low
- **Effort:** Trivial (1-line change)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Single-line fix surfaced by this cycle's fresh scan. Low risk and low friction; can be bundled with any future StatusSelector work.

### EX-REC-060: SubTable default empty state and row alternation

- **Problem:** `src/components/drivers/SubTable.tsx:61` renders a generic default empty message `"Geen records"` as plain grey text with no guidance. Per CLAUDE.md §6, empty states must provide guidance on what the user can do next and must not use the word "records". Most callers pass a meaningful `emptyMessage` prop (e.g. `"Geen dienstverbanden"`), but those values also lack a next-step hint and the default fallback is silently incorrect. In addition, alternating data rows use `bg-surface-secondary/50` (opacity trick on line 86), which creates a muddy tonal value instead of the clean surface layering used in StamtabelManager and SkillManager.
- **Proposed improvement:** (1) Replace the default empty string with an actionable Dutch fallback and update the caller sites (employment, functie, roosterassignment) to include a next-step hint pattern ("Nog geen X voor deze chauffeur. Gebruik 'Toevoegen' om een X vast te leggen."). (2) Change row alternation to solid `surface-primary` / `surface-secondary` without the `/50` modifier.
- **Expected user value:** Empty sub-tables tell planners what to do instead of looking broken; row striping reads cleaner and aligns with the rest of the driver form.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-traffic but visible in every driver edit flow. Tiny, safe cleanup.

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

- **Header title source coupling.** The duplicate-title fix introduces an exception set (`DESKTOP_PAGES_WITH_OWN_TITLE`) in `Header.tsx`. Any future page that adds its own composed page-header must also be added to that set, otherwise the title will duplicate again. Mitigation: the inline comment in `Header.tsx` documents the contract; the set is trivially discoverable.
- **Mobile planning is read-only.** Planners must use desktop to make schedule changes. Monitor user demand for mobile edit capability (EX-REC-052).
- **Recharts default styling.** The capacity chart's tooltip/axis styling is still Recharts default. Now the most visible remaining integration gap on the capacity page. See EX-REC-049.
- **RosterProfileEditor grid.** Flat, mechanical 28-day grid with stark status colors. Below DESIGN.md standard but low-traffic screen. See EX-REC-055.
- **Semantic color drift in StatusSelector.** The "Bevestigen" button on the sick modal uses `bg-danger-500` override. Low blast radius but a bad pattern precedent. See EX-REC-059.
- **Settings tab count growth.** The desktop settings page has 7 tabs. Adding more may need a different navigation pattern.
- **Mobile capacity scenario compare hidden.** The compare feature is desktop-only. May need mobile treatment if multi-scenario comparison is a common mobile use case.

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

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
