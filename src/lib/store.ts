import { useState, useEffect } from "react";
import { getWeekDates } from "./utils";

// === Types ===

export type DriverType = "INTERNAL" | "CHARTER" | "TEMPORARY";

export type PlanningStatus =
  | "ROSTER_FREE"
  | "BASE_ROSTER"
  | "AVAILABLE_EXTRA"
  | "LEAVE"
  | "SICK"
  | "HIRED";

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  type: DriverType;
  employeeNumber?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanningEntry = {
  id: string;
  driverId: string;
  date: string; // YYYY-MM-DD
  status: PlanningStatus;
  notes?: string;
};

export type DriverWithEntries = Driver & {
  planningEntries: PlanningEntry[];
};

// === Store internals ===

const DRIVERS_KEY = "capplan_drivers";
const ENTRIES_KEY = "capplan_planning";

let listeners = new Set<() => void>();
let version = 0;

function notify() {
  version++;
  listeners.forEach((l) => l());
}

function generateId(): string {
  return crypto.randomUUID();
}

function readDrivers(): Driver[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DRIVERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeDrivers(drivers: Driver[]) {
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  notify();
}

function readEntries(): PlanningEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeEntries(entries: PlanningEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  notify();
}

// === Sample data ===

const SAMPLE_DRIVERS: Omit<Driver, "createdAt" | "updatedAt">[] = [
  { id: "d1", firstName: "Jan", lastName: "de Vries", type: "INTERNAL", employeeNumber: "EMP001", isActive: true },
  { id: "d2", firstName: "Pieter", lastName: "Bakker", type: "INTERNAL", employeeNumber: "EMP002", isActive: true },
  { id: "d3", firstName: "Klaas", lastName: "Jansen", type: "INTERNAL", employeeNumber: "EMP003", isActive: true },
  { id: "d4", firstName: "Henk", lastName: "van Dijk", type: "CHARTER", companyName: "TransNL BV", isActive: true },
  { id: "d5", firstName: "Willem", lastName: "Smit", type: "TEMPORARY", isActive: true },
];

export function initializeStore() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(DRIVERS_KEY)) {
    const now = new Date().toISOString();
    const drivers = SAMPLE_DRIVERS.map((d) => ({
      ...d,
      createdAt: now,
      updatedAt: now,
    }));
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  }
  if (!localStorage.getItem(ENTRIES_KEY)) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify([]));
  }
}

// === React hook ===

export function useStore<T>(getter: () => T): T {
  const [, rerender] = useState(0);

  useEffect(() => {
    const cb = () => rerender((v) => v + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  return getter();
}

// === Driver CRUD ===

export function getDrivers(filter?: {
  type?: DriverType;
  isActive?: boolean;
  search?: string;
}): Driver[] {
  let drivers = readDrivers();

  if (filter?.type) {
    drivers = drivers.filter((d) => d.type === filter.type);
  }
  if (filter?.isActive !== undefined) {
    drivers = drivers.filter((d) => d.isActive === filter.isActive);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    drivers = drivers.filter(
      (d) =>
        d.firstName.toLowerCase().includes(q) ||
        d.lastName.toLowerCase().includes(q) ||
        (d.employeeNumber && d.employeeNumber.toLowerCase().includes(q))
    );
  }

  return drivers.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export function getDriver(id: string): Driver | undefined {
  return readDrivers().find((d) => d.id === id);
}

export function createDriver(data: {
  firstName: string;
  lastName: string;
  type: DriverType;
  employeeNumber?: string;
  companyName?: string;
}): Driver {
  const drivers = readDrivers();
  const now = new Date().toISOString();
  const driver: Driver = {
    id: generateId(),
    ...data,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  drivers.push(driver);
  writeDrivers(drivers);
  return driver;
}

export function updateDriver(
  id: string,
  data: Partial<Omit<Driver, "id" | "createdAt">>
): Driver {
  const drivers = readDrivers();
  const idx = drivers.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error("Driver not found");
  drivers[idx] = { ...drivers[idx], ...data, updatedAt: new Date().toISOString() };
  writeDrivers(drivers);
  return drivers[idx];
}

export function deleteDriver(id: string) {
  const drivers = readDrivers().filter((d) => d.id !== id);
  writeDrivers(drivers);
  // Also remove planning entries for this driver
  const entries = readEntries().filter((e) => e.driverId !== id);
  writeEntries(entries);
}

// === External Hires ===

export function getExternalHires(): Driver[] {
  return readDrivers()
    .filter((d) => d.type === "CHARTER" || d.type === "TEMPORARY")
    .sort((a, b) => a.lastName.localeCompare(b.lastName));
}

// === Planning ===

export function getPlanningForWeek(
  year: number,
  week: number
): { drivers: DriverWithEntries[]; weekDates: string[]; year: number; week: number } {
  const weekDates = getWeekDates(year, week).map(
    (d) => d.toISOString().split("T")[0]
  );
  const allDrivers = readDrivers().filter((d) => d.isActive);
  const allEntries = readEntries();

  const drivers: DriverWithEntries[] = allDrivers
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
    .map((driver) => ({
      ...driver,
      planningEntries: allEntries.filter(
        (e) => e.driverId === driver.id && weekDates.includes(e.date)
      ),
    }));

  return { drivers, weekDates, year, week };
}

export function upsertPlanningEntry(
  driverId: string,
  date: string,
  status: PlanningStatus,
  notes?: string
): PlanningEntry {
  const entries = readEntries();
  const idx = entries.findIndex(
    (e) => e.driverId === driverId && e.date === date
  );

  if (idx >= 0) {
    entries[idx] = { ...entries[idx], status, notes: notes ?? entries[idx].notes };
    writeEntries(entries);
    return entries[idx];
  }

  const entry: PlanningEntry = {
    id: generateId(),
    driverId,
    date,
    status,
    notes,
  };
  entries.push(entry);
  writeEntries(entries);
  return entry;
}

export function deletePlanningEntry(id: string) {
  const entries = readEntries().filter((e) => e.id !== id);
  writeEntries(entries);
}
