import { useState, useEffect } from "react";
import { getWeekDates, getMonthDates, get4WeekDates, getYearMonths } from "./utils";

// === Types ===

export type EmploymentType = "FULLTIME" | "PARTTIME" | "ONCALL" | "TEMPORARY" | "CHARTER";

export type PlanningStatus =
  | "ROSTER_FREE"
  | "BASE_ROSTER"
  | "AVAILABLE_EXTRA"
  | "LEAVE"
  | "SICK";

export type ZoomLevel = "week" | "4weeks" | "month" | "year";

export type Skill = {
  id: string;
  name: string;
};

export type StamtabelRecord = {
  id: string;
  code: string;
  description: string;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  employer?: string;
  department?: string;
  location?: string;
  licenseTypes?: string[];
  employmentType?: EmploymentType;
  skillIds?: string[];
  manager?: string; // name of the manager/leidinggevende
  baseRosterHours?: Record<string, number>; // day-of-week (0=Mon..6=Sun) -> hours
  rosterProfileId?: string;
  rosterProfileStartDate?: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanningEntry = {
  id: string;
  driverId: string;
  date: string; // YYYY-MM-DD
  status: PlanningStatus;
  leaveTypeId?: string;
  sickPercentage?: number; // 0-99 attendance percentage
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

export type RosterProfileEntry = {
  dayOffset: number; // 0-27 (4 weeks = 28 days)
  status: "ROSTER_FREE" | "BASE_ROSTER" | "AVAILABLE_EXTRA";
};

export type RosterProfile = {
  id: string;
  name: string;
  entries: RosterProfileEntry[];
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
const EMPLOYERS_KEY = "capplan_employers";
const DEPARTMENTS_KEY = "capplan_departments";
const LOCATIONS_KEY = "capplan_locations";
const LEAVE_TYPES_KEY = "capplan_leave_types";
const ROSTER_PROFILES_KEY = "capplan_roster_profiles";

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

// Generic stamtabel read/write
function readStamtabel(key: string): StamtabelRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function writeStamtabel(key: string, records: StamtabelRecord[]) {
  localStorage.setItem(key, JSON.stringify(records));
  notify();
}

function readRosterProfiles(): RosterProfile[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ROSTER_PROFILES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeRosterProfiles(profiles: RosterProfile[]) {
  localStorage.setItem(ROSTER_PROFILES_KEY, JSON.stringify(profiles));
  notify();
}

// === Sample data ===

const SAMPLE_DRIVERS: Omit<Driver, "createdAt" | "updatedAt">[] = [
  { id: "d1", firstName: "Jan", lastName: "de Vries", employeeNumber: "EMP001", employer: "emp1", department: "dep1", location: "loc1", licenseTypes: ["C", "CE"], employmentType: "FULLTIME", skillIds: ["sk1", "sk2"], isActive: true },
  { id: "d2", firstName: "Pieter", lastName: "Bakker", employeeNumber: "EMP002", employer: "emp1", department: "dep1", location: "loc2", licenseTypes: ["C"], employmentType: "FULLTIME", skillIds: ["sk1"], isActive: true },
  { id: "d3", firstName: "Klaas", lastName: "Jansen", employeeNumber: "EMP003", employer: "emp1", department: "dep2", location: "loc1", licenseTypes: ["C", "CE"], employmentType: "PARTTIME", skillIds: ["sk1", "sk3"], manager: "Jan de Vries", isActive: true },
  { id: "d4", firstName: "Henk", lastName: "van Dijk", employer: "emp2", location: "loc3", licenseTypes: ["CE"], employmentType: "CHARTER", skillIds: ["sk2"], isActive: true },
  { id: "d5", firstName: "Willem", lastName: "Smit", location: "loc4", licenseTypes: ["C"], employmentType: "TEMPORARY", skillIds: [], isActive: true },
];

const SAMPLE_SKILLS: Skill[] = [
  { id: "sk1", name: "ADR" },
  { id: "sk2", name: "Koelvervoer" },
  { id: "sk3", name: "Containertransport" },
  { id: "sk4", name: "Bulkvervoer" },
];

const SAMPLE_EMPLOYERS: StamtabelRecord[] = [
  { id: "emp1", code: "CAPPLAN", description: "CapPlan BV" },
  { id: "emp2", code: "TRANSNL", description: "TransNL BV" },
];

const SAMPLE_DEPARTMENTS: StamtabelRecord[] = [
  { id: "dep1", code: "DIST", description: "Distributie" },
  { id: "dep2", code: "LOG", description: "Logistiek" },
];

const SAMPLE_LOCATIONS: StamtabelRecord[] = [
  { id: "loc1", code: "AMS", description: "Amsterdam" },
  { id: "loc2", code: "RTD", description: "Rotterdam" },
  { id: "loc3", code: "UTR", description: "Utrecht" },
  { id: "loc4", code: "DH", description: "Den Haag" },
];

const SAMPLE_LEAVE_TYPES: StamtabelRecord[] = [
  { id: "lt1", code: "VAK", description: "Vakantie" },
  { id: "lt2", code: "ADV", description: "ADV-dag" },
  { id: "lt3", code: "BV", description: "Bijzonder verlof" },
  { id: "lt4", code: "OV", description: "Onbetaald verlof" },
];

export function initializeStore() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(DRIVERS_KEY)) {
    const now = new Date().toISOString();
    const drivers = SAMPLE_DRIVERS.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
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
  if (!localStorage.getItem(EMPLOYERS_KEY)) {
    localStorage.setItem(EMPLOYERS_KEY, JSON.stringify(SAMPLE_EMPLOYERS));
  }
  if (!localStorage.getItem(DEPARTMENTS_KEY)) {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(SAMPLE_DEPARTMENTS));
  }
  if (!localStorage.getItem(LOCATIONS_KEY)) {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(SAMPLE_LOCATIONS));
  }
  if (!localStorage.getItem(LEAVE_TYPES_KEY)) {
    localStorage.setItem(LEAVE_TYPES_KEY, JSON.stringify(SAMPLE_LEAVE_TYPES));
  }
  if (!localStorage.getItem(ROSTER_PROFILES_KEY)) {
    localStorage.setItem(ROSTER_PROFILES_KEY, JSON.stringify([]));
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
  const drivers = readDrivers().map((d) => ({
    ...d,
    skillIds: d.skillIds?.filter((sid) => sid !== id),
  }));
  writeDrivers(drivers);
}

// === Stamtabel CRUD (generic) ===

function getStamtabel(key: string): StamtabelRecord[] {
  return readStamtabel(key).sort((a, b) => a.description.localeCompare(b.description));
}

function createStamtabelRecord(key: string, code: string, description: string): StamtabelRecord {
  const records = readStamtabel(key);
  const record: StamtabelRecord = { id: generateId(), code, description };
  records.push(record);
  writeStamtabel(key, records);
  return record;
}

function updateStamtabelRecord(key: string, id: string, code: string, description: string): StamtabelRecord {
  const records = readStamtabel(key);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Record not found");
  records[idx] = { ...records[idx], code, description };
  writeStamtabel(key, records);
  return records[idx];
}

function deleteStamtabelRecord(key: string, id: string) {
  const records = readStamtabel(key).filter((r) => r.id !== id);
  writeStamtabel(key, records);
}

// Public stamtabel APIs
export function getEmployers() { return getStamtabel(EMPLOYERS_KEY); }
export function createEmployer(code: string, desc: string) { return createStamtabelRecord(EMPLOYERS_KEY, code, desc); }
export function updateEmployer(id: string, code: string, desc: string) { return updateStamtabelRecord(EMPLOYERS_KEY, id, code, desc); }
export function deleteEmployer(id: string) { deleteStamtabelRecord(EMPLOYERS_KEY, id); }

export function getDepartments() { return getStamtabel(DEPARTMENTS_KEY); }
export function createDepartment(code: string, desc: string) { return createStamtabelRecord(DEPARTMENTS_KEY, code, desc); }
export function updateDepartment(id: string, code: string, desc: string) { return updateStamtabelRecord(DEPARTMENTS_KEY, id, code, desc); }
export function deleteDepartment(id: string) { deleteStamtabelRecord(DEPARTMENTS_KEY, id); }

export function getLocations() { return getStamtabel(LOCATIONS_KEY); }
export function createLocation(code: string, desc: string) { return createStamtabelRecord(LOCATIONS_KEY, code, desc); }
export function updateLocation(id: string, code: string, desc: string) { return updateStamtabelRecord(LOCATIONS_KEY, id, code, desc); }
export function deleteLocation(id: string) { deleteStamtabelRecord(LOCATIONS_KEY, id); }

export function getLeaveTypes() { return getStamtabel(LEAVE_TYPES_KEY); }
export function createLeaveType(code: string, desc: string) { return createStamtabelRecord(LEAVE_TYPES_KEY, code, desc); }
export function updateLeaveType(id: string, code: string, desc: string) { return updateStamtabelRecord(LEAVE_TYPES_KEY, id, code, desc); }
export function deleteLeaveType(id: string) { deleteStamtabelRecord(LEAVE_TYPES_KEY, id); }

// === Roster Profile CRUD ===

export function getRosterProfiles(): RosterProfile[] {
  return readRosterProfiles().sort((a, b) => a.name.localeCompare(b.name));
}

export function createRosterProfile(name: string, entries: RosterProfileEntry[]): RosterProfile {
  const profiles = readRosterProfiles();
  const now = new Date().toISOString();
  const profile: RosterProfile = { id: generateId(), name, entries, createdAt: now, updatedAt: now };
  profiles.push(profile);
  writeRosterProfiles(profiles);
  return profile;
}

export function updateRosterProfile(id: string, name: string, entries: RosterProfileEntry[]): RosterProfile {
  const profiles = readRosterProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Profile not found");
  profiles[idx] = { ...profiles[idx], name, entries, updatedAt: new Date().toISOString() };
  writeRosterProfiles(profiles);
  return profiles[idx];
}

export function deleteRosterProfile(id: string) {
  const profiles = readRosterProfiles().filter((p) => p.id !== id);
  writeRosterProfiles(profiles);
}

export function assignRosterProfile(driverId: string, profileId: string, startDate: string, scenarioId?: string) {
  // Update driver with profile assignment
  const drivers = readDrivers();
  const idx = drivers.findIndex((d) => d.id === driverId);
  if (idx === -1) return;
  drivers[idx] = { ...drivers[idx], rosterProfileId: profileId, rosterProfileStartDate: startDate, updatedAt: new Date().toISOString() };
  writeDrivers(drivers);

  // Generate planning entries for 1 year (52 weeks = 364 days)
  const profile = readRosterProfiles().find((p) => p.id === profileId);
  if (!profile) return;

  const entries = readEntries(scenarioId);
  const start = new Date(startDate + "T00:00:00");

  for (let day = 0; day < 364; day++) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];
    const dayOffset = day % 28;
    const profileEntry = profile.entries.find((e) => e.dayOffset === dayOffset);
    const status = profileEntry?.status || "ROSTER_FREE";

    // Only overwrite if there's no leave/sick entry for this date
    const existingIdx = entries.findIndex((e) => e.driverId === driverId && e.date === dateStr);
    if (existingIdx >= 0) {
      const existing = entries[existingIdx];
      if (existing.status === "LEAVE" || existing.status === "SICK") continue;
      entries[existingIdx] = { ...existing, status };
    } else {
      entries.push({ id: generateId(), driverId, date: dateStr, status });
    }
  }

  writeEntries(entries, scenarioId);
}

// === Driver CRUD ===

export function getDrivers(filter?: {
  isActive?: boolean;
  search?: string;
}): Driver[] {
  let drivers = readDrivers();

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

export function createDriver(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">): Driver {
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
  const scenario: Scenario = { id: generateId(), name, description, createdAt: now, updatedAt: now };
  scenarios.push(scenario);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
  localStorage.setItem(`capplan_planning_${scenario.id}`, JSON.stringify([]));
  notify();
  return scenario;
}

export function duplicateScenario(sourceId: string, name: string): Scenario {
  const sourceEntries = readEntries(sourceId);
  const scenario = createScenario(name);
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

export function getPlanningForWeek(
  year: number,
  week: number
): { drivers: DriverWithEntries[]; weekDates: string[]; year: number; week: number } {
  const weekDates = getWeekDates(year, week).map((d) => d.toISOString().split("T")[0]);
  const { drivers } = getPlanningForDateRange(weekDates);
  return { drivers, weekDates, year, week };
}

export function upsertPlanningEntry(
  driverId: string,
  date: string,
  status: PlanningStatus,
  options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string },
  scenarioId?: string
): PlanningEntry {
  const entries = readEntries(scenarioId);
  const idx = entries.findIndex((e) => e.driverId === driverId && e.date === date);

  const entryData: Partial<PlanningEntry> = {
    status,
    leaveTypeId: options?.leaveTypeId,
    sickPercentage: options?.sickPercentage,
    notes: options?.notes,
  };

  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...entryData };
    writeEntries(entries, scenarioId);
    return entries[idx];
  }

  const entry: PlanningEntry = {
    id: generateId(),
    driverId,
    date,
    ...entryData,
  } as PlanningEntry;
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
    result[date] = { ROSTER_FREE: 0, BASE_ROSTER: 0, AVAILABLE_EXTRA: 0, LEAVE: 0, SICK: 0 };
  }

  for (const entry of entries) {
    if (result[entry.date]) {
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
  CHARTER: "Charter",
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
  // Resolve stamtabel names
  const employers = readStamtabel(EMPLOYERS_KEY);
  const departments = readStamtabel(DEPARTMENTS_KEY);
  const locations = readStamtabel(LOCATIONS_KEY);

  for (const driver of drivers) {
    let keys: string[];

    switch (groupBy) {
      case "employer":
        keys = [employers.find((e) => e.id === driver.employer)?.description || driver.employer || "Onbekend"];
        break;
      case "department":
        keys = [departments.find((d) => d.id === driver.department)?.description || driver.department || "Onbekend"];
        break;
      case "location":
        keys = [locations.find((l) => l.id === driver.location)?.description || driver.location || "Onbekend"];
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
