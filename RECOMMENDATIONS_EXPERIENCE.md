# Experience Agent Recommendations

## Summary

**This cycle (2026-04-27):** Experience Agent run 30. Executed PB-219 (ConfirmDialog responsive width). Fresh UX/design scan completed across all modal surfaces and key screens. One new finding: ScenarioSelector create modal uses fixed `w-96` (384px) which overflows on 360px viewports; RosterAssigner modal uses fixed `w-[520px]` which overflows on anything narrower. Both are desktop-oriented workflows but noted for completeness (EX-REC-068).

**What was improved this cycle:**

- ConfirmDialog responsive width (PB-219): Changed from fixed `w-[400px]` to `w-full max-w-[400px] mx-4`. All 10 consumer components (StamtabelManager, SkillManager, UserManager, UserGroupManager, SubTable, ImportSourceManager, RosterProfileEditor, ScenarioSelector, RosterAssigner, plus planning grid bulk delete) now display correctly on viewports from 320px to desktop.

**Current design alignment with DESIGN.md:**
- **Overall product quality: 9/10.** All identified screen-level gaps have been addressed. Remaining recommendations are P3-P4 enhancements for mobile and edge cases.
- **Design token compliance: 100%.** Zero hardcoded Tailwind color classes remain in `.tsx` files.
- **Planning grid:** Fully aligned (§7.4, §9). Four-zone toolbar, tonal row striping, full DayCell aria-label coverage, column header keyboard access complete.
- **Capacity page:** Fully aligned (§7.1, §7.3, §8.3, §6.1). Chart, KPIs, and table all use design tokens.
- **Settings page:** Fully aligned (§2.5, §7.1, §7.4). Section titles Manrope. RosterProfileEditor now has tonal layering and visual rhythm.
- **Drivers page:** Fully aligned (§3.2, §7.3). Sub-table empty states actionable, row alternation clean, shared tab bar, Actief chip in place.
- **Modals:** Fully aligned (§7.3). All modal headers use Manrope section-title typography. Overlays use design tokens. ConfirmDialog responsive on all viewports (PB-219). Two remaining fixed-width modals (ScenarioSelector, RosterAssigner) are desktop-only workflows.
- **Sidebar:** Fully aligned (§7.8). All text colors use sidebar-specific tokens.
- **Mobile:** Well-aligned overall. ConfirmDialog mobile overflow resolved (PB-219). Two desktop-only modals remain fixed-width (EX-REC-068, P4).

**Where design quality is still below target:**
- ScenarioSelector and RosterAssigner modals use fixed widths that would overflow on very narrow viewports, but these are desktop-only workflows (EX-REC-068, P4).
- All other remaining items are P3-P4 enhancements (mobile edit capability, mobile personalization, toolbar responsiveness, mapping builder enhancement).

## Recommended Next Improvements

_EX-REC-064 shipped as PB-214 (2026-04-20). EX-REC-065 shipped as PB-213 (2026-04-20). EX-REC-066 shipped as PB-218 (2026-04-22). EX-REC-055 shipped (2026-04-24). EX-REC-067 shipped as PB-219 (2026-04-27)._

### EX-REC-068: ScenarioSelector and RosterAssigner modal responsive width

- **Problem:** The ScenarioSelector create modal uses `w-96` (384px) and the RosterAssigner modal uses `w-[520px]`. Both would overflow on viewports narrower than their fixed width. However, both modals are accessed exclusively from the planning grid toolbar, which is a desktop-only workflow — the mobile planning view uses a different calendar interface.
- **Proposed improvement:** Apply the same responsive pattern as ConfirmDialog: `w-full max-w-[384px] mx-4` for ScenarioSelector and `w-full max-w-[520px] mx-4` for RosterAssigner. This ensures consistent modal behavior across the application and future-proofs against any mobile access paths.
- **Expected user value:** Consistent modal behavior. Low direct impact since these workflows are desktop-only today.
- **Priority:** P4 Low
- **Effort:** Small (two CSS class changes)
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Very low effort, completes the responsive modal pattern across all modal surfaces in the application. Not urgent since workflows are desktop-only.

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
- **Settings tab count growth.** The desktop settings page has 7 tabs. Adding more may need a different navigation pattern.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** Click-to-cycle is unconventional but functional. Visual refinement completed (EX-REC-055, 2026-04-24).
- **RosterProfileEditor grid visual refinement:** Resolved (EX-REC-055, 2026-04-24). Tonal layering, weekend differentiation, and contained surface treatment now in place.
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
- **Disabled pagination button opacity:** Resolved (PB-214, 2026-04-20).
- **Column header keyboard accessibility:** Resolved (PB-213, 2026-04-20).
- **Shared Badge component:** Multiple badge patterns exist (role, action, category, status) across UserManager, AuditLogViewer, documentatie page, and SubTable. However, each variant serves a distinct context with different sizing and color logic. A shared abstraction would add indirection without reducing complexity.
- **Settings page semantic tab grouping:** Scan suggested splitting the 7 tabs into "Master Data" vs "System Admin" groups. The current flat tab approach works well — mobile already has a card-based section view with descriptions. Adding a grouping layer adds complexity without clear user value at this tab count.
- **Documentatie page chevron rotation animation:** The expand/collapse chevron snaps between ChevronRight and ChevronDown. A CSS rotation transition would be marginally smoother but the current swap is functional and snappy.
- **Header/Sidebar avatar background unification:** Header avatar uses `bg-brand-100` and sidebar uses `bg-white/[0.08]`. The difference is contextually correct — light surface in the header, dark-aware transparency in the sidebar. Unifying would require compromising one context.
- **ConfirmDialog mobile overflow:** Resolved (PB-219, 2026-04-27).

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
