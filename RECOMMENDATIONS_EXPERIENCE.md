# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-079: Built a user management screen as a new "Gebruikers" tab in the settings page. Users are displayed with avatar, name, email, semantic role badges (Admin/Planner/Kijker), and member-since date. Clickable role badges trigger an inline dropdown with a confirmation dialog for role changes. Product-grade card layout with clear hierarchy.

**Current design alignment with DESIGN.md:**
- User management screen: well-aligned. Card layout with avatar-based identity, semantic role badges with icons, clear hierarchy between user identity and metadata. Follows sections 2.1 (product-grade), 2.5 (composed screens), 7.3 (cards and modules). Role badges use functional color: brand for Admin, success for Planner, neutral for Viewer.
- Settings page overall: well-aligned (sections 2.5, 7.1, 7.2). Tab bar now has 5 tabs — still fits on desktop but may need responsive consideration on narrow viewports.
- Login page: well-aligned. Split-panel composition with editorial typography.
- Header session indicator: well-aligned.
- Sidebar: well-aligned (section 7.8).
- Capacity page: well-aligned.
- Planning grid toolbar: well-aligned.
- Import source manager: well-aligned.
- Button system: fully aligned.
- Planning grid matrix: partially aligned. Status chips and tonal row composition are good. Grid border structure has room for improvement.
- Drivers page: partially aligned. Page header is composed. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.
- Settings tab bar may overflow on narrow viewports now that there are 5 tabs.

## Recommended Next Improvements

### EX-REC-045: Settings tab bar responsive treatment

- **Problem:** The settings page now has 5 tabs (Stamgegevens, Competenties, Roosters, Connectiviteit, Gebruikers). On narrow viewports, tab labels may overflow or wrap awkwardly. This was flagged as a risk when PB-079 was scoped.
- **Proposed improvement:** Add horizontal scrolling to `.settings-tabs` with `overflow-x: auto` and scroll-snap, or shorten tab labels on small screens. Could also add a mobile-friendly dropdown or accordion pattern.
- **Expected user value:** Settings remain usable on tablets and narrow browser windows.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** The 5th tab was just added. Better to address before a 6th tab is needed.

### EX-REC-044: Add user identity to sidebar bottom section

- **Problem:** The sidebar bottom section currently shows only "v2.0". Now that users have sessions, the sidebar could display the logged-in user's name or email in the bottom section, consistent with DESIGN.md section 7.8 ("a composed relationship between logo, nav items, and user identity").
- **Proposed improvement:** Replace or augment the version text in the sidebar bottom section with the session user's name/email and role badge. Keep the version text as secondary information.
- **Expected user value:** Stronger identity presence in the primary navigation surface. More product-grade feel.
- **Priority:** P3 Medium
- **Effort:** Small
- **Dependencies:** PB-081 (completed).
- **Suggested owner:** Experience Agent
- **Why now:** Auth session is now available. The sidebar bottom section is underutilized and DESIGN.md specifically calls for user identity in the sidebar.

### EX-REC-036: Drivers table — reduce generic admin feel

- **Problem:** The drivers table uses alternating row backgrounds, `border-b border-border-subtle` on every row, and a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns.
- **Proposed improvement:** Remove alternating row backgrounds. Introduce subtle row hover as the primary visual differentiation. Consider whether the 9-column table could benefit from column grouping or a denser badge treatment for license/skill columns.
- **Expected user value:** Cleaner, calmer table that feels more intentional and less like a default admin grid.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is applied to page titles but not to section titles or modal headers. This creates an inconsistency in the typographic hierarchy across complex screens.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and possibly `.settings-section-title`.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up. Should be evaluated visually before applying broadly.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool.
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit.
- **Expected user value:** More intuitive, visual configuration experience.
- **Priority:** P4 Low
- **Effort:** Medium
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent. The current editor is functional.

### EX-REC-042: Deduplicate scenarios list fetch

- **Problem:** PlanningGrid and ScenarioSelector both independently call `api.scenarios.list()`.
- **Proposed improvement:** Lift the scenarios list fetch to a shared context or parent component, or accept the minor duplication.
- **Expected user value:** No direct user impact. Minor code hygiene.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Not urgent. Only worth addressing if PlanningGrid is refactored for other reasons.

## Risks / Watch-outs

- **Settings tab count growth.** The settings page now has 5 tabs. If more configuration categories are added, the tab bar will need responsive treatment (EX-REC-045). Current tab bar is horizontal-only with no overflow handling.
- **Role enforcement not yet active.** The user management screen allows role assignment, but PB-082 (role enforcement middleware) is not yet implemented. Until then, roles are decorative and all users have full access. This is expected and documented.
- **NextAuth middleware route matching.** The middleware matches all dashboard routes. If new top-level routes are added, they must be added to the middleware matcher.
- **External image domains.** `next.config.mjs` allows Google and Microsoft avatar domains. Additional OAuth providers need their image domains allowlisted.
- **PlanningGrid.tsx complexity.** The file is ~685 lines. Any further changes must be verified carefully.
- **Drivers table column density.** Removing alternating backgrounds (EX-REC-036) only helps if the remaining visual treatment provides enough row distinction at high driver counts.

## Items Intentionally Not Recommended

- **Dark mode support:** No user demand. Token system supports it structurally but effort is significant.
- **Drag-and-drop reordering in tables:** Current sort/filter approach works well.
- **Redesign of RosterProfileEditor grid interaction:** The click-to-cycle interaction is unconventional but functional.
- **Custom calendar popup replacement:** ESC-004 decided Option B (styled wrapper). Browser native is functional.
- **Settings tab URL persistence:** Low-frequency page. Low impact.
- **Driver detail page / route-based navigation:** Current inline edit pattern works for the data volume.
- **Capacity page full redesign:** The page is functional and visually consistent with grouped toolbar.
- **Full sidebar redesign:** Already meets DESIGN.md section 7.8.
- **Recharts tooltip/axis custom styling:** Would improve premium feel but effort is disproportionate to impact.
- **Planning grid No-Line Rule enforcement:** Should be explored in a dedicated planning grid visual pass.
- **Separate sidebar entry for Connectiviteit:** Configuration belongs under Instellingen.
- **Login page animation/transitions:** Clean and fast. Animations would add complexity without clear user value.
- **User deletion from admin panel:** Users are created via OAuth. Deletion should be handled carefully (cascading sessions, preferences). Not needed for MVP.
- **Last login tracking:** The User model doesn't have a lastLogin field. Would require updating the session callback or adding a new field. Low priority — member-since date is sufficient for now.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
