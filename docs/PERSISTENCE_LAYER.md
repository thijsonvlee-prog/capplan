# Persistence Layer – Technical Notes

## Architecture Overview

CapPlan's persistence layer replaces localStorage with **PostgreSQL + Prisma ORM (v7)**,
accessed through Next.js API routes. The client-side uses reactive data-fetching hooks
(`useApiData`) that replace the old `useStore` pattern.

```
Browser ──► useApiData / mutate ──► fetch() ──► /api/* routes ──► Prisma ──► PostgreSQL
```

## Key Modeling Decisions

### String-based dates (YYYY-MM-DD)
Planning dates are stored as `String` rather than `DateTime`. This avoids timezone
conversion issues—a planning date of "2026-04-01" means exactly that date regardless
of server timezone.

### NULL scenarioId = default scenario
`PlanningEntry.scenarioId` is nullable. `NULL` represents the base/default planning.
Named scenarios get a non-null FK. Two partial unique indexes enforce uniqueness:
- `(driverId, date, scenarioId) WHERE scenarioId IS NOT NULL`
- `(driverId, date) WHERE scenarioId IS NULL`

### Historical sub-records
Employment, function assignments, and roster assignments use sequenced records with
`startDate`/`endDate` ranges. The "current" record is resolved client-side by finding
the open-ended record (no `endDate`). Adding a new record auto-closes the previous one.

### 28-day cyclic roster profiles
Roster profiles define a 28-day (4-week) repeating pattern via `RosterProfileDay`
(dayOffset 0–27). When a roster is assigned to a driver, 364 days of `PlanningEntry`
rows are generated server-side using `day % 28` to map into the cycle.

## Constraints & Indexes

| Index | Purpose |
|-------|---------|
| `Driver(lastName, firstName)` | Fast alphabetical listing |
| `Driver(isActive)` | Filter active drivers |
| `PlanningEntry(driverId, date)` | Primary lookup for planning grids |
| `PlanningEntry(date)` | Capacity aggregation queries |
| `PlanningEntry(scenarioId)` | Scenario-scoped queries |
| `DriverSkill(driverId, skillId)` | Unique, prevents duplicates |
| `RosterProfileDay(rosterProfileId, dayOffset)` | Unique, one status per day in cycle |

## AFAS Integration Preparation

Driver, Skill, Employer, Department, Location, and LeaveType models include optional
`sourceSystem`, `externalId`, and `syncedAt` fields. These are unused today but ready
for future AFAS sync without schema migration.

## Multi-user Preparation

The `User` model with `role` (ADMIN/PLANNER/VIEWER) and `UserPreference` table are
in place. Currently a single default user is seeded. Authentication middleware can be
added later without changing the data model.

## Database Setup

```bash
# Prerequisites: PostgreSQL running with DATABASE_URL in .env
# Example: DATABASE_URL="postgresql://capplan:capplan@localhost:5432/capplan?schema=public"

npx prisma migrate dev    # Apply migrations
npx prisma db seed        # Seed sample data
npx prisma studio         # Visual database browser
```

## Prisma 7 Adapter

Prisma 7 no longer embeds the datasource URL in the schema. The connection is
established via `@prisma/adapter-pg` in `src/lib/prisma.ts`, reading `DATABASE_URL`
from the environment at runtime. Migration tooling uses `prisma.config.ts` for its
connection.
