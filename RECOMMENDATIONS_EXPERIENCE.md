# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- **PB-126 — ScenarioSelector zone correction:** Moved ScenarioSelector from the "Weergave" (view settings) zone to the "Periode" (period/data context) zone in the planning toolbar. Scenario selection determines which data is shown, not how it is displayed.
- **PB-127 — Drivers page visual quality lift:** Replaced border-based row separation with tonal alternation (matching the planning grid). Upgraded hover to `brand-50`. Integrated the search bar into the card surface as a toolbar zone, creating a composed data surface instead of a disconnected layout.

**Current design alignment with DESIGN.md:**
- Sidebar: fully aligned (section 7.8). Premium, calm, anchoring.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Strong hierarchy, tab navigation, composed zones.
- Login page: well-aligned. Clean, premium, brand-surface split.
- Header: well-aligned. Minimal, composed, contextual subtitle support.
- Planning grid toolbar: fully aligned (section 7.2). Controls grouped by meaning with correct zone semantics.
- Planning grid matrix: fully aligned (section 4.1). Tonal row separation, No-Line Rule respected.
- Planning grid cells (DayCell/StatusBadge): well-designed. Density-responsive, status gradients.
- Drivers page: **now aligned** (sections 3.2, 7.3). Card containment, tonal rows, integrated search toolbar, brand hover. Consistent with planning grid patterns.
- User group manager: well-aligned. Card-based layout, expandable details, modal editor.
- User manager: well-aligned. Avatar display, role badges, inline role editing.
- Toast & ConfirmDialog: product-grade. Accessibility, focus trapping, semantic colors.
- Button system: fully aligned. Clear hierarchy across primary/secondary/icon/danger.
- Capacity page: partially aligned. Clean but not distinctly product-focused. Reads as standard analytics.

**Where design quality is still below target:**
- The capacity page is functional and clean but lacks the visual distinctiveness expected of a product-grade analytics surface (DESIGN.md section 8.3 — KPIs as first-class information).

## Recommended Next Improvements

### EX-REC-047: Capacity page — visual identity lift

- **Problem:** The capacity page is functionally correct and clean, but it reads as a standard analytics dashboard rather than a product-grade analysis surface. Per DESIGN.md section 8.3, "KPIs, totals, warnings, capacity metrics, and operational summaries should be treated as first-class information."
- **Proposed improvement:** Add a summary module above the chart showing key capacity KPIs (total available, total on leave, total sick, utilization %). Improve chart/table visual framing. Consider stronger section headers between chart and table zones.
- **Expected user value:** Capacity analysis feels more actionable and product-grade. Key numbers are visible without reading the full table.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** Capacity data aggregation already exists in `src/lib/aggregation.ts`.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The page works well functionally. Now that the drivers page and planning grid are aligned, the capacity page is the last remaining screen below target.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. This creates an inconsistency in the typographic hierarchy across complex screens with multiple sections.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and `.settings-section-title`. Visual evaluation required before broad application.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk typographic refinement. Should be visually evaluated before applying broadly.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Problem:** The single-row composed toolbar works well on wide screens, but may overflow or wrap awkwardly on narrow viewports (< 1200px). The `flex-wrap` behavior handles this gracefully at a basic level, but the zone structure could break visually when wrapped.
- **Proposed improvement:** Add responsive breakpoint behavior: on narrow screens, stack the toolbar into two rows (Period + Filter on top, View + Status below) while maintaining zone containment.
- **Expected user value:** Consistent toolbar experience across screen sizes.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None. Builds on PB-123.
- **Suggested owner:** Experience Agent
- **Why now:** Low priority. Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.

### EX-REC-044: User group member assignment — batch API

- **Problem:** When saving a group with member changes, the current implementation updates each user individually via sequential API calls. For groups with many member changes, this could be slow.
- **Proposed improvement:** Add a batch member assignment endpoint to `/api/user-groups/[id]/members` that accepts `{ addUserIds, removeUserIds }` and performs all updates in a single transaction.
- **Expected user value:** Faster save experience when adding/removing multiple members.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not blocking. Current sequential approach works for typical group sizes (< 20 users).

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool.
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit.
- **Expected user value:** More intuitive configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The current editor is functional.

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the scenarios list fetch to a shared context or parent component.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent. Only worth addressing if PlanningGrid is refactored for other reasons.

## Risks / Watch-outs

- **Planning grid toolbar wrap behavior.** The single-row toolbar with four zones (now including ScenarioSelector in the Periode zone) may wrap on screens narrower than ~1200px. Current `flex-wrap` handles this, but the visual zone structure may degrade when wrapped. Monitor for user feedback. See EX-REC-048.
- **Tonal row separation at extreme density.** In compact density with 100+ rows, the tonal alternation between transparent and `surface-secondary` provides sufficient contrast for scanability. If users report difficulty distinguishing rows, the `surface-secondary` tone could be strengthened. This now applies to both planning grid and drivers table.
- **Settings tab count growth.** The settings page now has 6 tabs with horizontal scroll. More tabs may need a different navigation pattern (vertical tabs or sub-navigation).
- **Capacity page is the last screen below standard.** Now that planning, drivers, and settings are aligned with DESIGN.md, the capacity page is the most visible remaining gap. Recommend addressing EX-REC-047 in a future cycle.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Full sidebar redesign:** Now fully aligned with DESIGN.md section 7.8.
- **Recharts tooltip/axis custom styling:** Would improve premium feel but effort is disproportionate to impact.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **react-window for planning grid:** Manual table virtualization preserves table structure. Same performance outcome.
- **Infinite scroll for drivers/planning:** Pagination gives users predictable position and page control.
- **Page size selector for planning grid:** Fixed 100 per page is reasonable.
- **FormField wrapper component:** Would reduce repetition across forms, but introducing a new abstraction at this point adds risk and cross-agent coordination overhead. Only recommend if a major form refactor is planned.
- **Skeleton loaders:** Spinner pattern works. Skeleton loaders add complexity without strong user demand.
- **Status legend popover collapse:** Considered during PB-123, but the inline legend provides constant reference while planning. Hiding it behind a click would add friction for the most frequent workflow.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
