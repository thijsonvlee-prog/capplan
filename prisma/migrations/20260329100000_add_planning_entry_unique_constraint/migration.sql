-- Remove duplicate planning entries (keep the latest by id) before adding unique constraint
DELETE FROM "PlanningEntry" a
  USING "PlanningEntry" b
  WHERE a."driverId" = b."driverId"
    AND a."date" = b."date"
    AND COALESCE(a."scenarioId", '') = COALESCE(b."scenarioId", '')
    AND a."id" < b."id";

-- Drop the composite index that is now superseded by the unique constraint
DROP INDEX IF EXISTS "PlanningEntry_driverId_date_scenarioId_idx";

-- Add unique constraint via Prisma (handles non-null scenarioId cases)
CREATE UNIQUE INDEX "PlanningEntry_driverId_date_scenarioId_key" ON "PlanningEntry"("driverId", "date", "scenarioId");

-- Add unique index for NULL scenarioId (base scenario) since PostgreSQL treats NULLs as distinct
CREATE UNIQUE INDEX "PlanningEntry_driverId_date_base_scenario_key" ON "PlanningEntry"("driverId", "date") WHERE "scenarioId" IS NULL;
