-- CreateIndex
CREATE INDEX "PlanningEntry_driverId_date_scenarioId_idx" ON "PlanningEntry"("driverId", "date", "scenarioId");

-- CreateIndex
CREATE INDEX "PlanningEntry_scenarioId_date_idx" ON "PlanningEntry"("scenarioId", "date");

-- DropIndex (replaced by composite)
DROP INDEX "PlanningEntry_driverId_date_idx";
