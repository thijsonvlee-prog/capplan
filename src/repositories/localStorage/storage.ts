import { useState, useEffect } from "react";
import type { Driver, Skill, StamtabelRecord, RosterProfile } from "@/domain/types";

// === localStorage Keys ===

export const STORAGE_KEYS = {
  DRIVERS: "capplan_drivers",
  ENTRIES: "capplan_planning",
  SKILLS: "capplan_skills",
  SCENARIOS: "capplan_scenarios",
  ACTIVE_SCENARIO: "capplan_active_scenario",
  EMPLOYERS: "capplan_employers",
  DEPARTMENTS: "capplan_departments",
  LOCATIONS: "capplan_locations",
  LEAVE_TYPES: "capplan_leave_types",
  ROSTER_PROFILES: "capplan_roster_profiles",
  USER_PREFERENCES: "capplan_user_preferences",
} as const;

// === Pub/Sub for reactivity ===

const listeners = new Set<() => void>();

export function notify() {
  listeners.forEach((l) => l());
}

// === React hook for reactive store access ===

export function useStore<T>(getter: () => T): T {
  const [, rerender] = useState(0);
  useEffect(() => {
    const cb = () => rerender((v) => v + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return getter();
}

// === Shared helpers ===

export function generateId(): string {
  return crypto.randomUUID();
}

export function autoCloseAndAdd<T extends { id: string; sequenceNumber: number; startDate: string; endDate?: string }>(
  items: T[],
  newData: Omit<T, "id" | "sequenceNumber">,
): T[] {
  const result = [...items];
  const dayBefore = new Date(newData.startDate + "T00:00:00");
  dayBefore.setDate(dayBefore.getDate() - 1);
  const endDateStr = dayBefore.toISOString().split("T")[0];
  for (let i = 0; i < result.length; i++) {
    if (!result[i].endDate) {
      result[i] = { ...result[i], endDate: endDateStr };
    }
  }
  const maxSeq = result.reduce((max, item) => Math.max(max, item.sequenceNumber), 0);
  result.push({ ...newData, id: generateId(), sequenceNumber: maxSeq + 1 } as T);
  return result;
}

// === Migration helper for field renames ===

function migrateDriver(d: Record<string, unknown>): Driver {
  // Migrate positionRecords → functionRecords, rosterRecords → rosterAssignments
  const driver = { ...d } as Record<string, unknown>;
  if (driver.positionRecords && !driver.functionRecords) {
    driver.functionRecords = driver.positionRecords;
    delete driver.positionRecords;
  }
  if (driver.rosterRecords && !driver.rosterAssignments) {
    driver.rosterAssignments = driver.rosterRecords;
    delete driver.rosterRecords;
  }
  return driver as unknown as Driver;
}

// === Sample data ===

const SAMPLE_DRIVERS: Omit<Driver, "createdAt" | "updatedAt">[] = [
  {
    id: "d1", firstName: "Jan", lastName: "de Vries", employeeNumber: "EMP001",
    licenseTypes: ["C", "CE"], skillIds: ["sk1", "sk2"], isActive: true,
    employmentRecords: [{ id: "er1", sequenceNumber: 1, startDate: "2024-01-01", employmentType: "FULLTIME", employerId: "emp1" }],
    functionRecords: [{ id: "pr1", sequenceNumber: 1, startDate: "2024-01-01", position: "Chauffeur", locationId: "loc1", departmentId: "dep1", manager: "" }],
    rosterAssignments: [],
  },
  {
    id: "d2", firstName: "Pieter", lastName: "Bakker", employeeNumber: "EMP002",
    licenseTypes: ["C"], skillIds: ["sk1"], isActive: true,
    employmentRecords: [{ id: "er2", sequenceNumber: 1, startDate: "2024-01-01", employmentType: "FULLTIME", employerId: "emp1" }],
    functionRecords: [{ id: "pr2", sequenceNumber: 1, startDate: "2024-01-01", position: "Chauffeur", locationId: "loc2", departmentId: "dep1", manager: "" }],
    rosterAssignments: [],
  },
  {
    id: "d3", firstName: "Klaas", lastName: "Jansen", employeeNumber: "EMP003",
    licenseTypes: ["C", "CE"], skillIds: ["sk1", "sk3"], isActive: true,
    employmentRecords: [{ id: "er3", sequenceNumber: 1, startDate: "2024-01-01", employmentType: "PARTTIME", employerId: "emp1" }],
    functionRecords: [{ id: "pr3", sequenceNumber: 1, startDate: "2024-01-01", position: "Chauffeur", locationId: "loc1", departmentId: "dep2", manager: "Jan de Vries" }],
    rosterAssignments: [],
  },
  {
    id: "d4", firstName: "Henk", lastName: "van Dijk",
    licenseTypes: ["CE"], skillIds: ["sk2"], isActive: true,
    employmentRecords: [{ id: "er4", sequenceNumber: 1, startDate: "2024-01-01", employmentType: "CHARTER", employerId: "emp2" }],
    functionRecords: [{ id: "pr4", sequenceNumber: 1, startDate: "2024-01-01", position: "Chauffeur", locationId: "loc3", manager: "" }],
    rosterAssignments: [],
  },
  {
    id: "d5", firstName: "Willem", lastName: "Smit",
    licenseTypes: ["C"], skillIds: [], isActive: true,
    employmentRecords: [{ id: "er5", sequenceNumber: 1, startDate: "2024-01-01", employmentType: "TEMPORARY" }],
    functionRecords: [{ id: "pr5", sequenceNumber: 1, startDate: "2024-01-01", position: "Chauffeur", locationId: "loc4", manager: "" }],
    rosterAssignments: [],
  },
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
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    const now = new Date().toISOString();
    const drivers = SAMPLE_DRIVERS.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  } else {
    // Migrate existing drivers (rename positionRecords/rosterRecords)
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      if (parsed.length > 0 && (parsed[0].positionRecords || parsed[0].rosterRecords)) {
        const migrated = parsed.map(migrateDriver);
        localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(migrated));
      }
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENTRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(SAMPLE_SKILLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCENARIOS)) {
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYERS)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(SAMPLE_EMPLOYERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(SAMPLE_DEPARTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(SAMPLE_LOCATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_TYPES)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(SAMPLE_LEAVE_TYPES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROSTER_PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.ROSTER_PROFILES, JSON.stringify([]));
  }
}
