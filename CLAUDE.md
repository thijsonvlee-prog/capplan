# CapPlan - Claude Code Instructions

## Git Workflow

- **Always work directly on the `claude/driver-planning-tool-Qv7lL` branch.** Do NOT create new feature branches or pull requests.
- Commit and push directly to `claude/driver-planning-tool-Qv7lL`. This is the production branch that Vercel deploys from.
- Never push to `master` or `main`.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- PostgreSQL (Neon) via Prisma 7 with `@prisma/adapter-pg`
- Deployed on Vercel; `DATABASE_URL` is provided by the Neon integration

## Key Conventions

- All data access goes through API routes (`src/app/api/`) using Prisma directly
- Frontend uses `src/lib/api.ts` (fetch wrapper) — never import localStorage repositories in components
- Prisma client is generated to `src/generated/prisma/` (gitignored)
- Migrations run automatically on deploy via `scripts/migrate.mjs` + `prisma migrate deploy`
