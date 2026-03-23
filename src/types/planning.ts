import type { Driver, PlanningEntry, PlanningStatus, DriverType } from "@prisma/client";

export type DriverWithEntries = Driver & {
  planningEntries: PlanningEntry[];
};

export type PlanningGridData = {
  drivers: DriverWithEntries[];
  weekDates: string[];
  year: number;
  week: number;
};

export type CellUpdate = {
  driverId: string;
  date: string;
  status: PlanningStatus;
  startTime?: string;
  endTime?: string;
  plannedHours?: number;
  notes?: string;
};

export type StatusOption = {
  value: PlanningStatus;
  label: string;
  color: string;
};

export type DriverFilter = {
  type?: DriverType;
  isActive?: boolean;
  search?: string;
};
