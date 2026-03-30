# CapPlan — Project Handbook for Claude Code Agents

> **This file is the primary steering document for all Claude Code runs and scheduled agents.**
> Read it fully before making any changes. Adhere to every rule unless explicitly overridden by the user.

---

## 1. Project Purpose & Scope

CapPlan is a **driver workforce planning tool** (Dutch-language UI) for managing chauffeur schedules, rosters, capacity, and employment data. It serves planners and administrators in a transport/logistics context.

**Core entities:** Driver, PlanningEntry, Scenario, RosterProfile, RosterAssignment, Employment, Function, Skill, ImportSource, User, Settings (stamtabellen: Employer, Department, Location, LeaveType).

**Key features:**
- Planning grid: daily status management per driver across configurable date ranges
- Capacity analysis: aggregated availability charts and tables per scenario
- Driver management: employment records, functions, roster assignments, skills, licenses
- Scenario planning: duplicate and compare what-if planning scenarios
- Settings: master data (stamtabellen), skills, roster profiles, connectivity hub (CSV import configuration)
- Authentication: NextAuth.js with Google/Microsoft OAuth (infrastructure ready, role enforcement pending)

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) + React 18 + TypeScript (strict mode) |
| Database | PostgreSQL (Neon serverless) via Prisma 7 with `@prisma/adapter-pg` |
| Auth | NextAuth.js v4 with `@next-auth/prisma-adapter` (Google + Azure AD providers) |
| Hosting | Vercel (serverless functions) |
| Styling | Tailwind CSS v4 + design tokens in `globals.css` |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Dates | date-fns 4 |
| Env | `DATABASE_URL` (Neon/Vercel), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, provider credentials |

---

## 3. Git / Branch / Deploy Workflow

- **Always work on and push to the `claude/driver-planning-tool-Qv7lL` branch.** This is the production branch that Vercel deploys from.
- Do NOT create new feature branches or PRs unless explicitly asked.
- **Never push to `master` or `main`.**
- Run `npm run verify` (prisma generate + typecheck + lint) before every commit. Do not push code that fails verify.
- Migrations run automatically on deploy via `scripts/migrate.mjs` + `prisma migrate deploy`.
- `npm run build` requires `DATABASE_URL` — it only succeeds on Vercel or with a local DB connection.

---

## 4. Architecture & Code Conventions

### Data Access
- **All data access goes through API routes** (`src/app/api/`) using Prisma directly.
- Frontend fetches data via `src/lib/api.ts` (fetch wrapper with namespaced methods). **Never import Prisma, repositories, or server-only modules in components.**
- Prisma client is generated to `src/generated/prisma/` (gitignored). Always run `npx prisma generate` before typecheck.
- Prisma singleton lives in `src/lib/prisma.ts` using `PrismaPg` adapter with global dev-mode caching.
- Shared API route helpers live in `src/lib/api-route-utils.ts` — use them for transforms, includes, validation, and utilities. Do not duplicate logic that already exists there.

### Business Logic
- Business logic belongs in **API routes** or **shared lib files** (`src/lib/`), never in React components.
- Aggregation logic lives in `src/lib/aggregation.ts`. Do not redefine aggregation in components.
- Shared constants (MONTH_SHORT, DEFAULT_PERIOD_DAYS, UNKNOWN_LABEL, STATUS_COLORS, etc.) live in `src/domain/constants.ts`.
- Domain types live in `src/domain/types.ts`. Domain enums (PlanningStatus, EmploymentType, UserRole) live in `src/domain/enums.ts`.

### Component Structure
- `PlanningGrid.tsx` (~700 lines) is the most complex component — a convergence point for performance, UX, design, and tech debt. **Handle with extreme care.** Any change must be verified against typecheck, lint, and visual behavior.
- All stamtabel managers (werkgevers, afdelingen, locaties, verloftypes) use the shared `StamtabelManager` component — improvements there propagate broadly.
- `ImportSourceManager.tsx` handles connectivity hub (CSV import source config + file upload).
- `DriverForm.tsx` (~475 lines) uses tab-based organization for driver details, employment, functions, and roster assignments.

### Authentication
- Auth config lives in `src/lib/auth.ts` (NextAuth options with Prisma adapter).
- Auth route handler at `src/app/api/auth/[...nextauth]/route.ts`.
- `AuthProvider` wraps the app in `src/app/layout.tsx` via `SessionProvider`.
- Session includes `user.id` and `user.role` via custom session callback.
- Providers are conditionally loaded — only active if env vars are set.
- **Role enforcement is NOT yet implemented.** Roles exist in the User model (ADMIN/PLANNER/VIEWER) but are not checked on routes or pages.

### Hooks
- `useApiData` / `useApiDataWithLoading`: cached data fetching with 30s freshness window.
- `mutate()`: mutation wrapper that auto-invalidates all caches.
- `useFocusTrap`: modal focus management.
- `useHeaderSubtitle`: page-level subtitle context for the header bar.

---

## 5. Data & API Guidelines

### Database / Prisma (21 models)
- **Use batch operations** (`createMany`, `updateMany`, `deleteMany`) instead of loops with individual queries. Neon serverless has per-query round-trip cost.
- Use `prisma.groupBy` for aggregations instead of `findMany` + in-memory counting.
- Wrap multi-step mutations in `prisma.$transaction` when data consistency matters.
- Add composite indexes for frequently queried column combinations. Verify with `EXPLAIN ANALYZE`.
- **Never modify the Prisma schema without creating a migration** (`npx prisma migrate dev --name <description>`). If DATABASE_URL is unavailable, create the migration SQL manually following the existing migration format.
- Do not add columns, tables, or indexes speculatively. Only add what the current task requires.

### API Routes (27 route files)
- Return consistent response shapes: `{ data: ... }` for success, `{ error: ... }` for failures.
- Validate required fields on input. Use `validateRequired()` and `validateForeignKeys()` from `api-route-utils.ts`.
- Limit relation includes — use `select` to fetch only needed fields, especially for list endpoints.
- Do not introduce N+1 query patterns. Check that loops do not contain awaited Prisma calls.
- All error messages returned to the client must be in Dutch.

### Frontend Data Fetching
- Use `useApiData` / `useApiDataWithLoading` hooks and `api.ts` fetch wrapper for all API calls.
- Invalidate caches via the global `invalidate()` pattern (or `mutate()` wrapper) after mutations.
- Show loading spinners during fetches and error states on failure.
- Apply optimistic updates only where the pattern already exists (PlanningGrid). Do not add new optimistic update patterns without strong justification.

---

## 6. UX / UI Guidelines

### Language & Tone
- **The entire UI is in Dutch.** All labels, placeholders, empty states, error messages, tooltips, and HTML `<title>` must be in Dutch.
- Avoid technical jargon: use "gegevens" not "records", "dienstverband" not "subtabellen".
- Spell out abbreviations or add tooltips. Do not use cryptic symbols.

### Interaction Patterns
- **Every destructive action requires a confirmation dialog** (via `ConfirmDialog` component) that shows what will be deleted (name, date — not "dit record").
- **Every mutation (create/update/delete) shows a toast notification** via `showToast()` from `src/components/ui/Toast.tsx`. Exception: high-frequency actions like planning grid drag-select.
- **No silent validation.** If a form submit fails validation, show an inline error message immediately. Use the `showValidation` boolean pattern.
- Empty states must provide guidance on what the user can do next, not just "Geen records".
- Computed/read-only fields must be visually distinct from editable fields (use `bg-surface-tertiary`).

### Consistency Rules
- Use existing component patterns before creating new ones. Check `StamtabelManager`, `SubTable`, `Toast`, `SkillManager`, `ImportSourceManager` for reference.
- New icon-only buttons must have `aria-label` attributes.
- Dropdown placeholders: use "-- Selecteer --" consistently.
- Loading states: use the `.spinner` CSS class from `globals.css`.

---

## 7. Design System & Styling

### Design Philosophy

CapPlan aims to be a premium, modern B2B planning product — not a generic admin tool. See `DESIGN.md` for the full creative direction.

**Core principles:**
1. **Product-grade over template-grade** — must not look like a default admin dashboard.
2. **Planning is the product** — the planning screen is the core surface, prioritizing scanability, hierarchy, and operational confidence.
3. **Clarity through space, hierarchy, and surfaces** — tonal layering and spacing over heavy borders.
4. **Premium restraint** — calm neutrals, selective color, refined and modern.
5. **Composed screens** — each screen has a clear header zone, action zone, content grouping, and visual rhythm.

### Design Tokens (~55 tokens in `globals.css`)
- **Never use hardcoded Tailwind color classes** (gray-200, blue-600, etc.) in components. Always use design tokens.
- Token categories:
  - **Brand:** 10 shades (brand-50 through brand-900), primary accent at brand-600 (#254ded)
  - **Surfaces:** 4 levels (primary #ffffff, secondary #f8f9fb, tertiary #f1f3f6, inset #ebeef3)
  - **Text:** 4 levels (primary, secondary, tertiary, inverse)
  - **Borders:** 3 levels (default, subtle, strong)
  - **Sidebar:** 5 tokens (dark bg #0f1729, text, active text, hover, active state)
  - **Functional:** success (8), danger (7), warning (7) — use for status-specific styling
  - **Shadows:** xs, card, dropdown, modal
  - **Radius:** sm (0.25rem), md (0.5rem), lg (0.75rem), xl (1rem)

### Typography
- **Manrope** (`--font-display`): page titles and display headings.
- **Inter** (`--font-sans`): body text, labels, UI elements, data presentation.

### Component CSS Classes (in `globals.css`)
| Category | Classes |
|---|---|
| Buttons | `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-icon`, `.btn-icon-danger` |
| Forms | `.input-field`, `.form-label` |
| Typography | `.text-page-title`, `.text-section-title`, `.text-label`, `.text-caption` |
| Layout | `.page-header`, `.page-header-row`, `.page-header-context`, `.count-badge` |
| Controls | `.control-group`, `.control-group-label` |
| Planning | `.planning-grid`, `.status-chip-compact`, `.status-dot`, `.grid-sticky-edge` |
| Settings | `.settings-tabs`, `.settings-tab`, `.settings-tab-badge`, `.settings-section-intro`, `.settings-section-title`, `.settings-section-desc` |
| Date input | `.date-input-wrapper`, `.date-input-native`, `.date-input-icon` |
| Feedback | `.spinner`, `.animate-slide-in` |
| Drivers | `.drivers-form-header` |

### Surface Hierarchy
- `surface-primary` (#ffffff): cards, modules, inputs, elevated content.
- `surface-secondary` (#f8f9fb): app background, page content area.
- `surface-tertiary` (#f1f3f6): table headers, read-only fields, grouped controls.
- `surface-inset` (#ebeef3): deeper nesting, group header rows.

### Status Colors (semantically stable)
- **Basisrooster** (Base roster): success/green family.
- **Aanvullend beschikbaar** (Extra capacity): deeper/saturated green.
- **Verlof** (Leave): warning/amber family.
- **Ziek** (Sick): danger/red family.
- **Neutral/empty**: surface variants, subdued greys.

### Rules
- Do not add new design tokens without a clear, reusable need across multiple components.
- Do not introduce external UI libraries or CSS frameworks. Build on the existing token system.
- One exception: Recharts requires hex strings — document any hex values with a comment referencing the corresponding token.
- Prefer tonal layering and spacing over 1px borders for structure.
- Use existing component CSS classes before writing inline styles.

---

## 8. Performance & Scalability

- **Use `React.memo`** on components rendered in large quantities (DayCell is already wrapped — maintain this).
- **Use `useMemo`** for expensive computations in render (chart data, aggregated columns, Map lookups).
- Use Map-based lookups for O(1) access in hot paths (PlanningGrid, DriverForm). Do not use `.find()` in render loops over large arrays.
- Avoid creating new inline arrow functions in render that serve as cache keys or callbacks to memoized children.
- Batch DB writes: roster assignment generates up to 364 entries — always use `createMany`/`updateMany`.
- Keep API payloads lean: use `select` on Prisma queries, avoid loading full relation trees for list views.
- Do not add pagination preemptively. Add it when actual data volumes require it.
- Performance observability is available via `src/lib/perf.ts` — use `getSlowEvents()` and `getRouteStats()` to find real bottlenecks before optimizing.

---

## 9. Security & Robustness

- **Authentication infrastructure is in place** (NextAuth.js with Google/Microsoft providers) but **role enforcement is NOT yet implemented.** Do not rely on roles for access control until enforcement middleware is added.
- Validate and sanitize all user input in API routes before passing to Prisma.
- Do not expose internal error details (stack traces, Prisma errors) in API responses. Return user-friendly Dutch error messages.
- Do not store secrets in code. Use environment variables.
- Security headers are configured in `next.config.mjs` (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- The User model has roles (ADMIN/PLANNER/VIEWER) in the schema. These will be enforced once role enforcement middleware is implemented.

---

## 10. Build Stability & Verification

- **Always run `npm run verify` before committing.** This runs: `prisma generate` → `tsc --noEmit` → `eslint .`
- `npm install` triggers `prisma generate` via postinstall.
- ESLint uses flat config (`eslint.config.mjs`) with direct `eslint-config-next/core-web-vitals` import. Do **not** use `FlatCompat` or `next lint`.
- `src/generated/` is in ESLint ignores — do not remove this.
- There are 2 known ESLint warnings in `PlanningGrid.tsx` (react-hooks/exhaustive-deps). These are pre-existing and non-blocking.
- If verify fails, **fix the issue before committing**. Do not skip hooks or bypass checks.

---

## 11. Agent Collaboration Rules

Multiple scheduled agents (Product Owner, UX/Design, Technical/Functional) operate on this codebase. Follow these rules to prevent conflicts:

### Before Starting
1. Read this entire `CLAUDE.md`.
2. Run `npm run verify` to confirm clean starting state.

### During Work
- **Make small, focused, logically grouped changes.** Do not combine unrelated fixes in one commit.
- **Respect existing patterns and decisions.** Do not rename variables, restructure files, change naming conventions, or alter UX patterns without a strong, documented reason.
- **Do not refactor broadly.** Fix what you are tasked to fix. Leave adjacent code alone.
- **Do not change architecture ad hoc.** Data access patterns, component structure, and token systems are deliberate choices.
- **Check cross-domain impact.** If your change touches `PlanningGrid.tsx`, `globals.css`, `api-route-utils.ts`, `constants.ts`, `aggregation.ts`, or `auth.ts`, verify that no other domain is affected.
- **Prefer stability over cleverness.** A straightforward solution that other agents can understand is better than an elegant one that requires context.

### After Finishing
- Run `npm run verify` and confirm 0 errors.

### Conflict Prevention
- Do not rewrite files that another agent is likely working on simultaneously.
- Do not move or rename files without explicit instruction.
- Do not change the design token system, CSS class names, or component API signatures unless that is your primary task.
- Do not delete code you do not fully understand. Investigate first.
- If in doubt about whether a change is safe, document the concern and skip it.

---

## 12. What Agents Must NOT Do

- **Do not push to `master` or `main`.**
- **Do not skip `npm run verify`.**
- **Do not introduce external dependencies** without explicit approval.
- **Do not add speculative features, configs, or abstractions** beyond the current task.
- **Do not write English text in the UI.** All user-facing text is Dutch.
- **Do not use hardcoded color values** in `.tsx` files. Use design tokens.
- **Do not create N+1 query patterns** in API routes.
- **Do not modify Prisma schema without a migration.**
- **Do not make broad refactors** (renaming conventions, restructuring directories, changing API contracts) unless explicitly tasked.
- **Do not remove or alter existing confirm dialogs, toast notifications, or validation patterns.**
- **Do not commit code that fails typecheck or lint.**

---

## 13. Key File Reference

| File / Directory | Purpose |
|---|---|
| **App structure** | |
| `src/app/layout.tsx` | Root layout (AuthProvider, fonts, metadata) |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout (Sidebar, Header, Toast, HeaderSubtitle) |
| `src/app/(dashboard)/planning/page.tsx` | Planning page |
| `src/app/(dashboard)/capacity/page.tsx` | Capacity analysis page |
| `src/app/(dashboard)/drivers/page.tsx` | Driver management page |
| `src/app/(dashboard)/settings/page.tsx` | Settings page (tabs: Stamgegevens, Competenties, Roosters, Connectiviteit) |
| `src/app/(dashboard)/documentatie/page.tsx` | Documentation page |
| `src/app/page.tsx` | Root redirect to /planning |
| **API routes** | |
| `src/app/api/drivers/` | Driver CRUD + sub-records (employment, functions, roster-assignments) |
| `src/app/api/planning/` | Planning entries (CRUD, bulk, capacity, for-range) |
| `src/app/api/scenarios/` | Scenario CRUD + duplicate + active |
| `src/app/api/settings/` | Stamtabel CRUD + skills |
| `src/app/api/roster-profiles/` | Roster profile CRUD |
| `src/app/api/import-sources/` | Import source CRUD + CSV upload |
| `src/app/api/preferences/` | User preferences |
| `src/app/api/auth/[...nextauth]/` | NextAuth.js route handler |
| **Libraries** | |
| `src/lib/api.ts` | Frontend fetch wrapper (namespaced: drivers, planning, scenarios, settings, rosterProfiles, importSources, preferences) |
| `src/lib/api-route-utils.ts` | Shared API route helpers (transforms, validation, includes, FK checks) |
| `src/lib/api-helpers.ts` | Frontend computed field helpers |
| `src/lib/auth.ts` | NextAuth.js configuration (providers, adapter, session callback) |
| `src/lib/aggregation.ts` | Shared aggregation logic (day/week/month/quarter/year) |
| `src/lib/prisma.ts` | Prisma client singleton (PrismaPg adapter) |
| `src/lib/perf.ts` | Performance observability utilities |
| `src/lib/utils.ts` | General utilities (cn, getMondayStart, getDateRange, getISOWeekNumber) |
| **Domain** | |
| `src/domain/constants.ts` | Shared constants (MONTH_SHORT, DEFAULT_PERIOD_DAYS, STATUS_COLORS, UNKNOWN_LABEL) |
| `src/domain/types.ts` | Domain type definitions (Driver, PlanningEntry, Scenario, ImportSource, CsvUploadResult, etc.) |
| `src/domain/enums.ts` | Domain enums (PlanningStatus, EmploymentType, UserRole) |
| **Components** | |
| `src/components/planning/PlanningGrid.tsx` | Main planning grid (~700 lines, handle with care) |
| `src/components/planning/DayCell.tsx` | Memoized day cell for planning grid |
| `src/components/drivers/DriverForm.tsx` | Driver create/edit form (~475 lines, tab-based) |
| `src/components/settings/StamtabelManager.tsx` | Shared stamtabel CRUD component |
| `src/components/settings/ImportSourceManager.tsx` | CSV import source config + file upload |
| `src/components/settings/SkillManager.tsx` | Skill management |
| `src/components/settings/RosterProfileEditor.tsx` | 4-week roster pattern editor |
| `src/components/ui/Toast.tsx` | Toast notification system (showToast) |
| `src/components/ui/ConfirmDialog.tsx` | Destructive action confirmation |
| `src/components/ui/DateInput.tsx` | Styled native date input wrapper |
| `src/components/providers/AuthProvider.tsx` | NextAuth SessionProvider wrapper |
| `src/components/layout/Header.tsx` | App header bar with context subtitle |
| `src/components/layout/Sidebar.tsx` | Dark sidebar navigation |
| **Hooks** | |
| `src/hooks/useApi.ts` | useApiData, useApiDataWithLoading, mutate, invalidate |
| `src/hooks/useFocusTrap.ts` | Modal focus trap |
| `src/hooks/useHeaderSubtitle.tsx` | Page subtitle context provider |
| **Config** | |
| `src/app/globals.css` | Design tokens, component classes, typography, animations |
| `eslint.config.mjs` | ESLint flat config (next/core-web-vitals) |
| `next.config.mjs` | Security headers |
| `prisma/schema.prisma` | Database schema (21 models) |
| `scripts/migrate.mjs` | Auto-migration on deploy |
| `DESIGN.md` | Full design system strategy and creative direction |
