import type { PlanningStatus } from "@/domain/enums";
import type { PlanningEntry, PlanningEntryOptions, DriverWithEntries } from "@/domain/types";
import type { PlanningRepository } from "@/repositories/interfaces/PlanningRepository";
import type { DriverRepository } from "@/repositories/interfaces/DriverRepository";
import type { ScenarioRepository } from "@/repositories/interfaces/ScenarioRepository";
import { getWeekDates } from "@/lib/utils";

export class PlanningService {
  constructor(
    private planningRepo: PlanningRepository,
    private driverRepo: DriverRepository,
    private scenarioRepo: ScenarioRepository,
  ) {}

  getPlanningForDateRange(
    dates: string[],
    scenarioId?: string
  ): { drivers: DriverWithEntries[]; dates: string[] } {
    const allDrivers = this.driverRepo.getAll({ isActive: true });
    const allEntries = this.planningRepo.getEntries(scenarioId);
    const dateSet = new Set(dates);

    const drivers: DriverWithEntries[] = allDrivers
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
      .map((driver) => ({
        ...driver,
        planningEntries: allEntries.filter(
          (e) => e.driverId === driver.id && dateSet.has(e.date)
        ),
      }));

    return { drivers, dates };
  }

  getPlanningForWeek(
    year: number,
    week: number
  ): { drivers: DriverWithEntries[]; weekDates: string[]; year: number; week: number } {
    const weekDates = getWeekDates(year, week).map((d) => d.toISOString().split("T")[0]);
    const { drivers } = this.getPlanningForDateRange(weekDates);
    return { drivers, weekDates, year, week };
  }

  upsertEntry(
    driverId: string,
    date: string,
    status: PlanningStatus,
    options?: PlanningEntryOptions,
    scenarioId?: string
  ): PlanningEntry {
    return this.planningRepo.upsert(driverId, date, status, options, scenarioId);
  }

  upsertBulkEntries(
    driverId: string,
    dates: string[],
    status: PlanningStatus,
    options?: PlanningEntryOptions,
    scenarioId?: string
  ): void {
    this.planningRepo.upsertBulk(driverId, dates, status, options, scenarioId);
  }

  deleteEntry(id: string, scenarioId?: string): void {
    this.planningRepo.delete(id, scenarioId);
  }

  getCapacityForDateRange(
    dates: string[],
    scenarioId?: string
  ): Record<string, Record<PlanningStatus, number>> {
    const entries = this.planningRepo.getEntries(scenarioId);
    const result: Record<string, Record<PlanningStatus, number>> = {};

    for (const date of dates) {
      result[date] = { ROSTER_FREE: 0, BASE_ROSTER: 0, AVAILABLE_EXTRA: 0, LEAVE: 0, SICK: 0 };
    }

    for (const entry of entries) {
      if (result[entry.date]) {
        result[entry.date][entry.status]++;
      }
    }

    return result;
  }
}
