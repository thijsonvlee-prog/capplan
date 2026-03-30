-- CreateIndex
CREATE INDEX "PlanningEntry_scenarioId_date_status_idx" ON "PlanningEntry"("scenarioId", "date", "status");
