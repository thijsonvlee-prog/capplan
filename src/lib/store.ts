import { useState, useEffect } from "react";
import { getWeekDates, getMonthDates, get4WeekDates, getYearMonths } from "./utils";

// === Types ===

export type DriverType = "INTERNAL" | "CHARTER" | "TEMPORARY";

export type EmploymentType = "FULLTIME" | "PARTTIME" | "ONCALL" | "TEMPORARY";

export type PlanningStatus =
  | "ROSTER_FREE"
  | "BASE_ROSTER"
  | "AVAILABLE_EXTRA"
  | "LEAVE"
  | "SICK"
  | "HIRED";

export type ZoomLevel = "week" | "4weeks" | "month" | "year";

export type Skill = {
  id: string;
  name: string;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  type: DriverType;
  employeeNumber?: string;
  companyName?: string;
  employer?: string;
  department?: string;
  location?: string;
  licenseTypes?: string[];
  employmentType?: EmploymentType;
  skillIds?: string[];
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

export type Scenario = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupByField = "none" | "employer" | "department" | "location" | "licenseType" | "employmentType";

// === Store internals ===

const DRIVERS_KEY = "capplan_drivers";
const ENTRIES_KEY = "capplan_planning";
const SKILLS_KEY = "capplan_skills";
const SCENARIOS_KEY = "capplan_scenarios";
const ACTIVE_SCENARIO_KEY = "capplan_active_scenario";

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

function entriesKey(scenarioId?: string): string {
  const id = scenarioId || getActiveScenarioId();
  return id === "default" ? ENTRIES_KEY : `capplan_planning_${id}`;
}

function readEntries(scenarioId?: string): PlanningEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(entriesKey(scenarioId));
  return raw ? JSON.parse(raw) : [];
}

function writeEntries(entries: PlanningEntry[], scenarioId?: string) {
  localStorage.setItem(entriesKey(scenarioId), JSON.stringify(entries));
  notify();
}

function readSkills(): Skill[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SKILLS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeSkills(skills: Skill[]) {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  notify();
}

// === Sample data ===

const SAMPLE_DRIVERS: Omit<Driver, "createdAt" | "updatedAt">[] = [
  { id: "d1", firstName: "Jan", lastName: "de Vries", type: "INTERNAL", employeeNumber: "EMP001", employer: "CapPlan BV", department: "Distributie", location: "Amsterdam", licenseTypes: ["C", "CE"], employmentType: "FULLTIME", skillIds: ["sk1", "sk2"], isActive: true },
  { id: "d2", firstName: "Pieter", lastName: "Bakker", type: "INTERNAL", employeeNumber: "EMP002", employer: "CapPlan BV", department: "Distributie", location: "Rotterdam", licenseTypes: ["C"], employmentType: "FULLTIME", skillIds: ["sk1"], isActive: true },
  { id: "d3", firstName: "Klaas", lastName: "Jansen", type: "INTERNAL", employeeNumber: "EMP003", employer: "CapPlan BV", department: "Logistiek", location: "Amsterdam", licenseTypes: ["C", "CE"], employmentType: "PARTTIME", skillIds: ["sk1", "sk3"], isActive: true },
  { id: "d4", firstName: "Henk", lastName: "van Dijk", type: "CHARTER", companyName: "TransNL BV", employer: "TransNL BV", location: "Utrecht", licenseTypes: ["CE"], employmentType: "FULLTIME", skillIds: ["sk2"], isActive: true },
  { id: "d5", firstName: "Willem", lastName: "Smit", type: "TEMPORARY", location: "Den Haag", licenseTypes: ["C"], employmentType: "TEMPORARY", skillIds: [], isActive: true },
];

const SAMPLE_SKILLS: Skill[] = [
  { id: "sk1", name: "ADR" },
  { id: "sk2", name: "Koelvervoer" },
  { id: "sk3", name: "Containertransport" },
  { id: "sk4", name: "Bulkvervoer" },
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
  if (!localStorage.getItem(SKILLS_KEY)) {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(SAMPLE_SKILLS));
  }
  if (!localStorage.getItem(SCENARIOS_KEY)) {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify([]));
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

// === Skill CRUD ===

export function getSkills(): Skill[] {
  return readSkills().sort((a, b) => a.name.localeCompare(b.name));
}

export function createSkill(name: string): Skill {
  const skills = readSkills();
  const skill: Skill = { id: generateId(), name };
  skills.push(skill);
  writeSkills(skills);
  return skill;
}

export function updateSkill(id: string, name: string): Skill {
  const skills = readSkills();
  const idx = skills.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Skill not found");
  skills[idx] = { ...skills[idx], name };
  writeSkills(skills);
  return skills[idx];
}

export function deleteSkill(id: string) {
  const skills = readSkills().filter((s) => s.id !== id);
  writeSkills(skills);
  // Remove skill from all drivers
  const drivers = readDrivers().map((d) => ({
    ...d,
    skillIds: d.skillIds?.filter((sid) => sid !== id),
  }));
  writeDrivers(drivers);
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
  employer?: string;
  department?: string;
  location?: string;
  licenseTypes?: string[];
  employmentType?: EmploymentType;
  skillIds?: string[];
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
  const entries = readEntries().filter((e) => e.driverId !== id);
  writeEntries(entries);
}

// === External Hires ===

export function getExternalHires(): Driver[] {
  return readDrivers()
    .filter((d) => d.type === "CHARTER" || d.type === "TEMPORARY")
    .sort((a, b) => a.lastName.localeCompare(b.lastName));
}

// === Scenario CRUD ===

export function getScenarios(): Scenario[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SCENARIOS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getActiveScenarioId(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(ACTIVE_SCENARIO_KEY) || "default";
}

export function setActiveScenarioId(id: string) {
  localStorage.setItem(ACTIVE_SCENARIO_KEY, id);
  notify();
}

export function createScenario(name: string, description?: string): Scenario {
  const scenarios = getScenarios();
  const now = new Date().toISOString();
  const scenario: Scenario = {
    id: generateId(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  scenarios.push(scenario);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
  // Initialize empty entries for this scenario
  localStorage.setItem(`capplan_planning_${scenario.id}`, JSON.stringify([]));
  notify();
  return scenario;
}

export function duplicateScenario(sourceId: string, name: string): Scenario {
  const sourceEntries = readEntries(sourceId);
  const scenario = createScenario(name);
  // Copy entries with new IDs
  const newEntries = sourceEntries.map((e) => ({ ...e, id: generateId() }));
  localStorage.setItem(`capplan_planning_${scenario.id}`, JSON.stringify(newEntries));
  notify();
  return scenario;
}

export function deleteScenario(id: string) {
  const scenarios = getScenarios().filter((s) => s.id !== id);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
  localStorage.removeItem(`capplan_planning_${id}`);
  if (getActiveScenarioId() === id) {
    setActiveScenarioId("default");
  }
  notify();
}

// === Planning ===

export function getPlanningForDateRange(
  dates: string[],
  scenarioId?: string
): { drivers: DriverWithEntries[]; dates: string[] } {
  const allDrivers = readDrivers().filter((d) => d.isActive);
  const allEntries = readEntries(scenarioId);

  const drivers: DriverWithEntries[] = allDrivers
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
    .map((driver) => ({
      ...driver,
      planningEntries: allEntries.filter(
        (e) => e.driverId === driver.id && dates.includes(e.date)
      ),
    }));

  return { drivers, dates };
}

export function getPlanningForWeek(
  year: number,
  week: number
): { drivers: DriverWithEntries[]; weekDates: string[]; year: number; week: number } {
  const weekDates = getWeekDates(year, week).map(
    (d) => d.toISOString().split("T")[0]
  );
  const { drivers } = getPlanningForDateRange(weekDates);
  return { drivers, weekDates, year, week };
}

export function upsertPlanningEntry(
  driverId: string,
  date: string,
  status: PlanningStatus,
  notes?: string,
  scenarioId?: string
): PlanningEntry {
  const entries = readEntries(scenarioId);
  const idx = entries.findIndex(
    (e) => e.driverId === driverId && e.date === date
  );

  if (idx >= 0) {
    entries[idx] = { ...entries[idx], status, notes: notes ?? entries[idx].notes };
    writeEntries(entries, scenarioId);
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
  writeEntries(entries, scenarioId);
  return entry;
}

export function deletePlanningEntry(id: string, scenarioId?: string) {
  const entries = readEntries(scenarioId).filter((e) => e.id !== id);
  writeEntries(entries, scenarioId);
}

// === Capacity ===

export function getCapacityForDateRange(
  dates: string[],
  scenarioId?: string
): Record<string, Record<PlanningStatus, number>> {
  const entries = readEntries(scenarioId);
  const result: Record<string, Record<PlanningStatus, number>> = {};

  for (const date of dates) {
    result[date] = {
      ROSTER_FREE: 0,
      BASE_ROSTER: 0,
      AVAILABLE_EXTRA: 0,
      LEAVE: 0,
      SICK: 0,
      HIRED: 0,
    };
  }

  for (const entry of entries) {
    if (dates.includes(entry.date) && result[entry.date]) {
      result[entry.date][entry.status]++;
    }
  }

  return result;
}

// === Grouping ===

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULLTIME: "Fulltime",
  PARTTIME: "Parttime",
  ONCALL: "Oproepkracht",
  TEMPORARY: "Uitzendkracht",
};

export const GROUP_BY_LABELS: Record<GroupByField, string> = {
  none: "Geen",
  employer: "Werkgever",
  department: "Afdeling",
  location: "Standplaats",
  licenseType: "Rijbewijstype",
  employmentType: "Dienstverband",
};

export function groupDrivers(
  drivers: DriverWithEntries[],
  groupBy: GroupByField
): { label: string; drivers: DriverWithEntries[] }[] {
  if (groupBy === "none") {
    return [{ label: "", drivers }];
  }

  const groups = new Map<string, DriverWithEntries[]>();

  for (const driver of drivers) {
    let keys: string[];

    switch (groupBy) {
      case "employer":
        keys = [driver.employer || "Onbekend"];
        break;
      case "department":
        keys = [driver.department || "Onbekend"];
        break;
      case "location":
        keys = [driver.location || "Onbekend"];
        break;
      case "licenseType":
        keys = driver.licenseTypes?.length ? driver.licenseTypes : ["Onbekend"];
        break;
      case "employmentType":
        keys = [driver.employmentType ? EMPLOYMENT_TYPE_LABELS[driver.employmentType] : "Onbekend"];
        break;
      default:
        keys = ["Onbekend"];
    }

    for (const key of keys) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(driver);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, drivers]) => ({ label, drivers }));
}
