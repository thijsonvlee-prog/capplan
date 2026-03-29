# CapPlan — Project Handbook for Claude Code Agents

> **This file is the primary steering document for all Claude Code runs and scheduled agents.**
> Read it fully before making any changes. Adhere to every rule unless explicitly overridden by the user.
> Detailed history and rationale live in the `*LEARNINGS*.md` files — this document contains the binding rules.

---

## 1. Project Purpose & Scope

CapPlan is a **driver workforce planning tool** (Dutch-language UI) for managing chauffeur schedules, rosters, capacity, and employment data. It serves planners and administrators in a transport/logistics context.

**Core entities:** Driver, PlanningEntry, Scenario, RosterProfile, RosterAssignment, Employment, Function, Skill, Settings (stamtabellen).

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Database | PostgreSQL (Neon serverless) via Prisma 7 with `@prisma/adapter-pg` |
| Hosting | Vercel (serverless functions) |
| Styling | Tailwind CSS v4 + design tokens in `globals.css` |
| Env | `DATABASE_URL` provided by Neon/Vercel integration |

---

## 3. Git / Branch / Deploy Workflow

- **Work on the branch specified in the task instructions.** Do NOT create new feature branches or PRs unless explicitly asked.
- Commit and push directly to the assigned branch.
- **Never push to `master` or `main`.**
- Run `npm run verify` (prisma generate + typecheck + lint) before every commit. Do not push code that fails verify.
- Migrations run automatically on deploy via `scripts/migrate.mjs` + `prisma migrate deploy`.
- `npm run build` requires `DATABASE_URL` — it only succeeds on Vercel or with a local DB connection.

---

## 4. Architecture & Code Conventions

### Data Access
- **All data access goes through API routes** (`src/app/api/`) using Prisma directly.
- Frontend fetches data via `src/lib/api.ts` (fetch wrapper). **Never import Prisma, repositories, or server-only modules in components.**
- Prisma client is generated to `src/generated/prisma/` (gitignored). Always run `npx prisma generate` before typecheck.
- Shared API route helpers live in `src/lib/api-route-utils.ts` — use them for transforms, includes, and utilities. Do not duplicate logic that already exists there.

### Business Logic
- Business logic belongs in **API routes** or **shared lib files** (`src/lib/`), never in React components.
- Aggregation logic lives in `src/lib/aggregation.ts`. Do not redefine aggregation in components.
- Shared constants (MONTH_SHORT, DEFAULT_PERIOD_DAYS, UNKNOWN_LABEL, etc.) live in `src/domain/constants.ts`.
- Domain types and enums live in `src/domain/types.ts` and `src/domain/enums.ts`.

### Component Structure
- `PlanningGrid.tsx` (~650 lines) is the most complex component — a convergence point for performance, UX, design, and tech debt. **Handle with extreme care.** Any change must be verified against typecheck, lint, and visual behavior.
- All stamtabel managers (werkgevers, afdelingen, locaties, verloftypes) use the shared `StamtabelManager` component — improvements there propagate broadly.

---

## 5. Data & API Guidelines

### Database / Prisma
- **Use batch operations** (`createMany`, `updateMany`, `deleteMany`) instead of loops with individual queries. Neon serverless has per-query round-trip cost.
- Use `prisma.groupBy` for aggregations instead of `findMany` + in-memory counting.
- Wrap multi-step mutations in `prisma.$transaction` when data consistency matters.
- Add composite indexes for frequently queried column combinations. Verify with `EXPLAIN ANALYZE`.
- **Never modify the Prisma schema without creating a migration** (`npx prisma migrate dev --name <description>`).
- Do not add columns, tables, or indexes speculatively. Only add what the current task requires.

### API Routes
- Return consistent response shapes. Prefer `{ data: ... }` for success, `{ error: ... }` for failures.
- Validate required fields on input. Use helpers from `api-route-utils.ts`.
- Limit relation includes — use `select` to fetch only needed fields, especially for list endpoints.
- Do not introduce N+1 query patterns. Check that loops do not contain awaited Prisma calls.

### Frontend Data Fetching
- Use the `useApiData` hook and `api.ts` fetch wrapper for all API calls.
- Invalidate caches via the global `invalidate()` pattern after mutations.
- Show loading spinners during fetches and error states on failure.
- Apply optimistic updates only where the pattern already exists (PlanningGrid). Do not add new optimistic update patterns without strong justification.

---

## 6. UX / UI Guidelines

### Language & Tone
- **The entire UI is in Dutch.** All labels, placeholders, empty states, error messages, tooltips, and HTML `<title>` must be in Dutch.
- Avoid technical jargon: use "gegevens" not "records", "dienstverband" not "subtabellen".
- Spell out abbreviations or add tooltips. Do not use cryptic symbols (Σ, LG, gem., wk).

### Interaction Patterns
- **Every destructive action requires a confirmation dialog** that shows what will be deleted (name, date — not "dit record").
- **Every mutation (create/update/delete) shows a toast notification** via `showToast()` from `src/components/ui/Toast.tsx`. Exception: high-frequency actions like planning grid drag-select.
- **No silent validation.** If a form submit fails validation, show an inline error message immediately. Use the `showValidation` boolean pattern.
- Empty states must provide guidance on what the user can do next, not just "Geen records".
- Computed/read-only fields must be visually distinct from editable fields (use `bg-surface-tertiary`).

### Consistency Rules
- Use existing component patterns before creating new ones. Check `StamtabelManager`, `SubTable`, `Toast`, `SkillManager` for reference.
- New icon-only buttons must have `aria-label` attributes.
- Dropdown placeholders: use "-- Selecteer --" consistently.
- Loading states: use the `.spinner` CSS class from `globals.css`.

---

## 7. Design System & Styling

### Design Tokens (52 tokens in `globals.css`)
- **Never use hardcoded Tailwind color classes** (gray-200, blue-600, etc.) in components. Always use design tokens.
- Token categories: brand (10), neutral surfaces (4), borders (3), text (4), sidebar (5), functional/success/danger/warning (18), shadows (4), radius (4).
- Functional colors: use `success-*` for positive states, `danger-*` for errors/destructive, `warning-*` for caution.

### Component Classes
- Use the predefined CSS classes from `globals.css`: `.btn-primary`, `.btn-secondary`, `.btn-icon`, `.btn-icon-danger`, `.input-field`, `.form-label`, `.spinner`.
- Typography: use `.text-page-title`, `.text-section-title`, `.text-label`, `.text-caption`.
- Card surfaces: use `shadow-card` + `border-border-subtle` combination.
- Table headers: use `bg-surface-tertiary` + `.text-label`.

### Rules
- Do not add new design tokens without a clear, reusable need across multiple components.
- Do not introduce external UI libraries or CSS frameworks. Build on the existing token system.
- One exception: Recharts requires hex strings — document any hex values with a comment referencing the corresponding token.

---

## 8. Performance & Scalability

- **Use `React.memo`** on components rendered in large quantities (DayCell is already wrapped — maintain this).
- **Use `useMemo`** for expensive computations in render (chart data, aggregated columns).
- Avoid creating new inline arrow functions in render that serve as cache keys or callbacks to memoized children.
- Batch DB writes: roster assignment generates up to 364 entries — always use `createMany`/`updateMany`.
- Keep API payloads lean: use `select` on Prisma queries, avoid loading full relation trees for list views.
- Do not add pagination preemptively. Add it when actual data volumes require it.
- Performance observability is available via `src/lib/perf.ts` — use `getSlowEvents()` and `getRouteStats()` to find real bottlenecks before optimizing.

---

## 9. Security & Robustness

- **No authentication or authorization is implemented yet.** This is a known gap. Do not add auth unless explicitly tasked.
- Validate and sanitize all user input in API routes before passing to Prisma.
- Do not expose internal error details (stack traces, Prisma errors) in API responses. Return user-friendly error messages.
- Do not store secrets in code. Use environment variables.
- Be aware that User model has roles (ADMIN/PLANNER/VIEWER) in the schema but they are not enforced. Do not rely on them for access control until auth is implemented.

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
2. Read `BUILD_STABILITY_LEARNINGS.md` to confirm verify still works.
3. Read your domain-specific `*LEARNINGS*.md` file.
4. Run `npm run verify` to confirm clean starting state.

### During Work
- **Make small, focused, logically grouped changes.** Do not combine unrelated fixes in one commit.
- **Respect existing patterns and decisions.** Do not rename variables, restructure files, change naming conventions, or alter UX patterns without a strong, documented reason.
- **Do not refactor broadly.** Fix what you are tasked to fix. Leave adjacent code alone.
- **Do not change architecture ad hoc.** Data access patterns, component structure, and token systems are deliberate choices.
- **Check cross-domain impact.** If your change touches `PlanningGrid.tsx`, `globals.css`, `api-route-utils.ts`, `constants.ts`, or `aggregation.ts`, verify that no other domain is affected.
- **Prefer stability over cleverness.** A straightforward solution that other agents can understand is better than an elegant one that requires context.

### After Finishing
- Run `npm run verify` and confirm 0 errors.
- Record significant new learnings (patterns discovered, pitfalls avoided, decisions made) in the appropriate `*LEARNINGS*.md` file.
- Do not update learnings files with trivial observations or changelog entries.

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
| `src/app/api/` | All API routes (Prisma data access) |
| `src/lib/api.ts` | Frontend fetch wrapper |
| `src/lib/api-route-utils.ts` | Shared API route helpers (transforms, includes) |
| `src/lib/api-helpers.ts` | Frontend computed field helpers |
| `src/lib/aggregation.ts` | Shared aggregation logic (day/week/month/quarter/year) |
| `src/lib/prisma.ts` | Prisma client initialization |
| `src/lib/perf.ts` | Performance observability utilities |
| `src/lib/utils.ts` | General utilities (getMondayStart, etc.) |
| `src/domain/constants.ts` | Shared constants (MONTH_SHORT, DEFAULT_PERIOD_DAYS, STATUS_COLORS) |
| `src/domain/types.ts` | Domain type definitions |
| `src/domain/enums.ts` | Domain enums |
| `src/components/ui/Toast.tsx` | Toast notification system (showToast) |
| `src/app/globals.css` | Design tokens, component classes, typography |
| `eslint.config.mjs` | ESLint flat config |
| `scripts/migrate.mjs` | Auto-migration on deploy |
| `prisma/schema.prisma` | Database schema |
| `*LEARNINGS*.md` | Domain-specific learnings (history & detail) |

---

## 14. Learnings File Protocol

- Each domain has its own learnings file (UX, Design, Performance, Tech Debt, Build Stability, Product Owner).
- Write new learnings **only** when they are structural, reusable, or prevent future mistakes.
- Do not duplicate information already in this `CLAUDE.md`.
- Do not add changelog-style entries. Focus on patterns, decisions, and pitfalls.
- Cross-reference other learnings files when a finding spans domains.
