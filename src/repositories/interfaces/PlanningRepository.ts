import type { PlanningStatus } from "@/domain/enums";
import type { PlanningEntry, PlanningEntryOptions } from "@/domain/types";

export interface PlanningRepository {
  getEntries(scenarioId?: string): PlanningEntry[];
  upsert(driverId: string, date: string, status: PlanningStatus, options?: PlanningEntryOptions, scenarioId?: string): PlanningEntry;
  upsertBulk(driverId: string, dates: string[], status: PlanningStatus, options?: PlanningEntryOptions, scenarioId?: string): void;
  delete(id: string, scenarioId?: string): void;
  deleteByDriver(driverId: string, scenarioId?: string): void;
}
