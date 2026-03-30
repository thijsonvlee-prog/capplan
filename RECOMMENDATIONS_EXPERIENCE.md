# Experience Agent Recommendations

## Summary

**What was improved this cycle:**
- PB-081: Built a complete login page and session UI. Login page (`/login`) uses a split-panel layout with a dark brand panel (left) and clean sign-in panel (right). Google and Microsoft provider buttons with loading states. NextAuth middleware protects all dashboard routes. Header now shows user avatar (or initials fallback), name, and logout button. All text in Dutch.

**Current design alignment with DESIGN.md:**
- Login page: well-aligned. Split-panel composition with strong brand presence, editorial typography, restrained surfaces, and intentional hierarchy. Follows sections 2.1 (product-grade), 2.4 (premium restraint), 2.5 (composed screens), 7.1 (page headers), and 7.7 (inputs). Provider buttons use a reusable `.login-provider-btn` CSS class with design tokens.
- Header session indicator: well-aligned. Compact user presence with avatar, name, and ghost logout button. Does not compete with page title. Follows section 7.2 (toolbar grouping) and 2.4 (restraint).
- Sidebar: well-aligned (section 7.8).
- Settings page: well-aligned (sections 2.5, 7.1, 7.2).
- Typography: improved. Manrope on page titles and login headline creates editorial contrast per section 5.1/5.3.
- Capacity page: well-aligned.
- Planning grid toolbar: well-aligned.
- Import source manager: well-aligned.
- Button system: fully aligned.
- Planning grid matrix: partially aligned. Status chips and tonal row composition are good. Grid border structure and row composition have room for improvement.
- Drivers page: partially aligned. Page header is composed. Table is still table-first with generic CRUD feel.

**Where design quality is still below target:**
- The drivers table still reads as standard admin CRUD with alternating backgrounds, row borders, and table-first layout.
- The planning grid matrix uses 1px row borders for structure. Pure tonal separation would be more aligned with DESIGN.md but risks reducing scanability in dense data.

## Recommended Next Improvements

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

- **Problem:** The drivers table uses alternating row backgrounds (`bg-surface-secondary/50` on odd rows), `border-b border-border-subtle` on every row, and a flat table-first layout. Per DESIGN.md section 3.2, "table-first UI where the table dominates everything else" and "flat screens with weak hierarchy" are anti-patterns.
- **Proposed improvement:** Remove alternating row backgrounds (they add noise, not clarity). Introduce subtle row hover as the primary visual differentiation. Consider whether the 9-column table could benefit from column grouping or a denser badge treatment for license/skill columns.
- **Expected user value:** Cleaner, calmer table that feels more intentional and less like a default admin grid.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Not urgent, but the drivers page is a high-frequency screen.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Problem:** Manrope is now applied to page titles but not to section titles or modal headers. Modal headers and form section headers could benefit from Manrope to reinforce hierarchy within complex screens.
- **Proposed improvement:** Evaluate applying `font-family: var(--font-display)` to modal headers and possibly `.settings-section-title`. Keep `.text-section-title` on Inter to maintain the intended contrast with page titles.
- **Expected user value:** Stronger visual hierarchy within modals and settings sections.
- **Priority:** P4 Low
- **Effort:** Small
- **Dependencies:** None.
- **Suggested owner:** Experience Agent
- **Why now:** Low-risk follow-up. Should be evaluated visually before applying broadly.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Problem:** The field mapping editor uses a functional grid layout with text inputs and dropdowns. While clear and usable, it reads as a standard form rather than a visual configuration tool.
- **Proposed improvement:** Consider a card-based mapping representation where each mapping is a distinct visual unit, or a drag-connect style interface.
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

- **NextAuth middleware route matching.** The middleware matches all dashboard routes. If new top-level routes are added outside the dashboard group, they must be added to the middleware matcher to be protected.
- **External image domains.** `next.config.mjs` now allows `lh3.googleusercontent.com` and `*.live.com` for OAuth avatars. If additional OAuth providers are added, their image domains must be allowlisted.
- **PlanningGrid.tsx complexity.** The file is ~685 lines. Any further changes to the planning toolbar or grid must be verified carefully.
- **Settings tab count growth.** The settings page now has 4 tabs. If more configuration categories are added (e.g., "Gebruikers" for PB-079), the tab bar may need responsive treatment.
- **Drivers table column density.** Removing alternating backgrounds (EX-REC-036) only helps if the remaining visual treatment provides enough row distinction at high driver counts.
- **Planning grid No-Line Rule.** The grid's 1px row borders serve a functional purpose in dense data. Should be explored in a dedicated visual pass.

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
- **Login page animation/transitions:** The current page is clean and fast. Animations would add complexity without clear user value.

## Recommendation Rules

- Recommendations are written by the Experience Agent after reviewing the application.
- Each recommendation must include all required fields.
- IDs are sequential (EX-REC-001, EX-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Experience Agent writes recommendations. Do not scatter suggestions across other files.
