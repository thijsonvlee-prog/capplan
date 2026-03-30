# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- No ready tasks were assigned to the Experience Agent in this cycle. All Experience Agent items in the backlog are deferred at P4.
- A fresh UX/design audit was performed across all major screens and components.

**Current design alignment with DESIGN.md:**
- Sidebar: fully aligned (section 7.8). Premium, calm, anchoring.
- Settings page: well-aligned (sections 2.5, 7.1, 7.2). Strong hierarchy, tab navigation, composed zones.
- Login page: well-aligned. Clean, premium, brand-surface split.
- Header: well-aligned. Minimal, composed, contextual subtitle support.
- User group manager: well-aligned. Card-based layout, expandable details, modal editor.
- User manager: well-aligned. Avatar display, role badges, inline role editing.
- Toast & ConfirmDialog: product-grade. Accessibility, focus trapping, semantic colors.
- Button system: fully aligned. Clear hierarchy across primary/secondary/icon/danger.
- Planning grid cells (DayCell/StatusBadge): well-designed. Density-responsive, status gradients.
- Capacity page: partially aligned. Clean but not distinctly product-focused. Reads as standard analytics.
- Drivers page: below standard. Table-first layout, generic admin CRUD feel.
- Planning grid toolbar: below standard. Two loose rows of controls without strong visual zones.
- Planning grid matrix: below standard. 1px border-based row separation violates No-Line Rule from DESIGN.md.

**Where design quality is still below target:**
- The drivers page still reads as standard admin CRUD with a table-first layout, weak hierarchy, and no composed zones beyond the page header.
- The planning grid toolbar uses two rows of loosely grouped controls. Per DESIGN.md section 7.2, controls should be grouped by meaning with visible containment.
- The planning grid matrix relies on 1px borders for row separation. DESIGN.md section 4.1 explicitly states "Do not use 1px borders as the default way to separate major sections."
- The capacity page is functional and clean but lacks the visual distinctiveness expected of a product-grade analytics surface.

## Recommended Next Improvements

### EX-REC-045: Planning grid toolbar — composed control zones

- **Problem:** The planning grid toolbar is two rows of loosely arranged dropdowns, buttons, and inputs. Per DESIGN.md section 7.2, "Avoid long unstructured rows of dropdowns, toggles, pills, and buttons." The controls are functionally grouped via `.control-group` but visually the toolbar still reads as flat form elements.
- **Proposed improvement:** Restructure the toolbar into clearly contained zones: Period zone (date range + zoom), View zone (density + columns + scenario), Filter zone (search + grouping), and Status legend. Use surface containers or stronger whitespace to make zone boundaries visible. Consider collapsing the status legend into a popover to reduce toolbar width.
- **Expected user value:** Faster comprehension of available controls. The planning screen — the core product surface — feels more intentional and composed.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** None. PlanningGrid.tsx changes require careful handling (~800 lines).
- **Suggested owner:** Experience Agent
- **Why now:** The planning screen is the core product surface per DESIGN.md section 2.2. Every session starts here. The toolbar is the first thing users interact with, and it currently reads as admin tooling.

### EX-REC-046: Planning grid matrix — tonal row separation instead of borders

- **Problem:** The planning grid uses 1px `border-b` on every data row and 2px borders for header/totals separation. DESIGN.md section 4.1 explicitly says "Do not use 1px borders as the default way to separate major sections" and recommends surface contrast, spacing, and tonal transitions instead.
- **Proposed improvement:** Replace row borders with alternating tonal backgrounds (e.g., transparent vs `surface-secondary/30` already partially in place). Use stronger surface contrast for header and totals rows. Remove or reduce border reliance.
- **Expected user value:** The planning grid feels less spreadsheet-like and more product-grade. Better alignment with the visual calm expected per DESIGN.md.
- **Priority:** P3 Medium
- **Effort:** Medium
- **Dependencies:** Should be coordinated with EX-REC-045 for a cohesive planning grid visual pass.
- **Suggested owner:** Experience Agent
- **Why now:** Core product surface. The current border-heavy grid is the most visible deviation from DESIGN.md across the entire app.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Problem:** The drivers table uses a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns. The page has a good header zone but the data area below is unframed.
- **Proposed improvement:** Wrap the table in a card container with subtle shadow. Improve row hover treatment. Consider column grouping or denser badge treatment for license/skill columns. Add visual framing around the data zone.
- **Expected user value:** Drivers page feels intentional and composed rather than a default CRUD list.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen. The gap between this page and the settings page (which is well-composed) creates inconsistency.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. This creates an inconsistency in the typographic hierarchy across complex screens with multiple sections.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and `.settings-section-title`. Visual evaluation required before broad application.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk typographic refinement. Should be visually evaluated before applying broadly.

### EX-REC-047: Capacity page — visual identity lift

- **Problem:** The capacity page is functionally correct and clean, but it reads as a standard analytics dashboard rather than a product-grade analysis surface. Per DESIGN.md section 8.3, "KPIs, totals, warnings, capacity metrics, and operational summaries should be treated as first-class information."
- **Proposed improvement:** Add a summary module above the chart showing key capacity KPIs (total available, total on leave, total sick, utilization %). Improve chart/table visual framing. Consider stronger section headers between chart and table zones.
- **Expected user value:** Capacity analysis feels more actionable and product-grade. Key numbers are visible without reading the full table.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** Capacity data aggregation already exists in `src/lib/aggregation.ts`.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The page works well functionally. Recommend after planning grid improvements are complete.

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

- **Planning grid complexity.** PlanningGrid.tsx is ~800 lines and the most complex component. Any visual changes (EX-REC-045, EX-REC-046) must be carefully tested against typecheck, lint, and visual behavior. Recommend these as a coordinated visual pass rather than piecemeal changes.
- **Settings tab count growth.** The settings page now has 6 tabs with horizontal scroll. More tabs may need a different navigation pattern (vertical tabs or sub-navigation).
- **Inconsistency between screens.** Settings and sidebar are product-grade while the planning toolbar and drivers table are below standard. This inconsistency is visible to users who navigate between screens.
- **No-Line Rule adoption scope.** Removing borders from the planning grid is the right direction per DESIGN.md, but must be tested carefully to avoid reducing scanability in dense data views with 100+ rows.

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

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
