import type { Driver, DriverEmploymentRecord, DriverFunctionRecord, DriverRosterAssignment, RosterProfile } from "@/domain/types";
import type { DriverRepository } from "@/repositories/interfaces/DriverRepository";
import { STORAGE_KEYS, notify, generateId, autoCloseAndAdd } from "./storage";

function readDrivers(): Driver[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Record<string, unknown>[];
  // Handle migration from old field names
  return parsed.map((d) => {
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
  });
}

function writeDrivers(drivers: Driver[]) {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  notify();
}

function readRosterProfiles(): RosterProfile[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.ROSTER_PROFILES);
  return raw ? JSON.parse(raw) : [];
}

export class LocalStorageDriverRepository implements DriverRepository {
  getAll(filter?: { isActive?: boolean; search?: string }): Driver[] {
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

  getById(id: string): Driver | undefined {
    return readDrivers().find((d) => d.id === id);
  }

  create(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">): Driver {
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

  update(id: string, data: Partial<Omit<Driver, "id" | "createdAt">>): Driver {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Driver not found");
    drivers[idx] = { ...drivers[idx], ...data, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
    return drivers[idx];
  }

  delete(id: string): void {
    const drivers = readDrivers().filter((d) => d.id !== id);
    writeDrivers(drivers);
  }

  // Employment records
  addEmploymentRecord(driverId: string, data: Omit<DriverEmploymentRecord, "id" | "sequenceNumber">): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = autoCloseAndAdd(driver.employmentRecords || [], data);
    drivers[idx] = { ...driver, employmentRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  updateEmploymentRecord(driverId: string, recordId: string, data: Partial<Omit<DriverEmploymentRecord, "id" | "sequenceNumber">>): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.employmentRecords || []).map((r) => r.id === recordId ? { ...r, ...data } : r);
    drivers[idx] = { ...driver, employmentRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  deleteEmploymentRecord(driverId: string, recordId: string): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.employmentRecords || []).filter((r) => r.id !== recordId);
    drivers[idx] = { ...driver, employmentRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  getEmploymentRecords(driverId: string): DriverEmploymentRecord[] {
    const driver = readDrivers().find((d) => d.id === driverId);
    return (driver?.employmentRecords || []).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  // Function records
  addFunctionRecord(driverId: string, data: Omit<DriverFunctionRecord, "id" | "sequenceNumber">): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = autoCloseAndAdd(driver.functionRecords || [], data);
    drivers[idx] = { ...driver, functionRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  updateFunctionRecord(driverId: string, recordId: string, data: Partial<Omit<DriverFunctionRecord, "id" | "sequenceNumber">>): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.functionRecords || []).map((r) => r.id === recordId ? { ...r, ...data } : r);
    drivers[idx] = { ...driver, functionRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  deleteFunctionRecord(driverId: string, recordId: string): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.functionRecords || []).filter((r) => r.id !== recordId);
    drivers[idx] = { ...driver, functionRecords: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  getFunctionRecords(driverId: string): DriverFunctionRecord[] {
    const driver = readDrivers().find((d) => d.id === driverId);
    return (driver?.functionRecords || []).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  // Roster assignments
  addRosterAssignment(driverId: string, data: Omit<DriverRosterAssignment, "id" | "sequenceNumber">): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = autoCloseAndAdd(driver.rosterAssignments || [], data);
    drivers[idx] = { ...driver, rosterAssignments: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  updateRosterAssignment(driverId: string, recordId: string, data: Partial<Omit<DriverRosterAssignment, "id" | "sequenceNumber">>): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.rosterAssignments || []).map((r) => r.id === recordId ? { ...r, ...data } : r);
    drivers[idx] = { ...driver, rosterAssignments: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  deleteRosterAssignment(driverId: string, recordId: string): void {
    const drivers = readDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return;
    const driver = drivers[idx];
    const records = (driver.rosterAssignments || []).filter((r) => r.id !== recordId);
    drivers[idx] = { ...driver, rosterAssignments: records, updatedAt: new Date().toISOString() };
    writeDrivers(drivers);
  }

  getRosterAssignments(driverId: string): (DriverRosterAssignment & { profileName: string })[] {
    const driver = readDrivers().find((d) => d.id === driverId);
    if (!driver?.rosterAssignments) return [];
    const profiles = readRosterProfiles();
    return driver.rosterAssignments
      .map((r) => ({
        ...r,
        profileName: profiles.find((p) => p.id === r.rosterProfileId)?.name || "(verwijderd)",
      }))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }
}
