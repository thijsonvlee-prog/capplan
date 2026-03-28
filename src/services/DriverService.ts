import type { PlanningStatus, GroupByField } from "@/domain/enums";
import type {
  Driver,
  DriverEmploymentRecord,
  DriverFunctionRecord,
  DriverRosterAssignment,
  DriverWithEntries,
  DriverComputedFields,
  StamtabelRecord,
} from "@/domain/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/domain/constants";
import type { DriverRepository } from "@/repositories/interfaces/DriverRepository";
import type { PlanningRepository } from "@/repositories/interfaces/PlanningRepository";
import type { StamtabelRepository } from "@/repositories/interfaces/StamtabelRepository";
import type { RosterProfileRepository } from "@/repositories/interfaces/RosterProfileRepository";
import { generateId } from "@/repositories/localStorage/storage";

export class DriverService {
  constructor(
    private driverRepo: DriverRepository,
    private planningRepo: PlanningRepository,
    private stamtabelRepo: StamtabelRepository,
    private rosterProfileRepo: RosterProfileRepository,
  ) {}

  getDrivers(filter?: { isActive?: boolean; search?: string }): Driver[] {
    return this.driverRepo.getAll(filter);
  }

  getDriver(id: string): Driver | undefined {
    return this.driverRepo.getById(id);
  }

  createDriver(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">): Driver {
    return this.driverRepo.create(data);
  }

  updateDriver(id: string, data: Partial<Omit<Driver, "id" | "createdAt">>): Driver {
    return this.driverRepo.update(id, data);
  }

  deleteDriver(id: string): void {
    this.driverRepo.delete(id);
    this.planningRepo.deleteByDriver(id);
  }

  // Employment records
  addEmploymentRecord(driverId: string, data: Omit<DriverEmploymentRecord, "id" | "sequenceNumber">): void {
    this.driverRepo.addEmploymentRecord(driverId, data);
  }

  updateEmploymentRecord(driverId: string, recordId: string, data: Partial<Omit<DriverEmploymentRecord, "id" | "sequenceNumber">>): void {
    this.driverRepo.updateEmploymentRecord(driverId, recordId, data);
  }

  deleteEmploymentRecord(driverId: string, recordId: string): void {
    this.driverRepo.deleteEmploymentRecord(driverId, recordId);
  }

  getEmploymentRecords(driverId: string): DriverEmploymentRecord[] {
    return this.driverRepo.getEmploymentRecords(driverId);
  }

  // Function records
  addFunctionRecord(driverId: string, data: Omit<DriverFunctionRecord, "id" | "sequenceNumber">): void {
    this.driverRepo.addFunctionRecord(driverId, data);
  }

  updateFunctionRecord(driverId: string, recordId: string, data: Partial<Omit<DriverFunctionRecord, "id" | "sequenceNumber">>): void {
    this.driverRepo.updateFunctionRecord(driverId, recordId, data);
  }

  deleteFunctionRecord(driverId: string, recordId: string): void {
    this.driverRepo.deleteFunctionRecord(driverId, recordId);
  }

  getFunctionRecords(driverId: string): DriverFunctionRecord[] {
    return this.driverRepo.getFunctionRecords(driverId);
  }

  // Roster assignments
  addRosterAssignment(driverId: string, data: Omit<DriverRosterAssignment, "id" | "sequenceNumber">, scenarioId?: string): void {
    this.driverRepo.addRosterAssignment(driverId, data);

    // Generate planning entries for 1 year (52 weeks = 364 days)
    const profile = this.rosterProfileRepo.getById(data.rosterProfileId);
    if (!profile) return;

    const entries = this.planningRepo.getEntries(scenarioId);
    const start = new Date(data.startDate + "T00:00:00");

    for (let day = 0; day < 364; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split("T")[0];
      const dayOffset = day % 28;
      const profileEntry = profile.entries.find((e) => e.dayOffset === dayOffset);
      const status = profileEntry?.status || "ROSTER_FREE";

      const existing = entries.find((e) => e.driverId === driverId && e.date === dateStr);
      if (existing) {
        if (existing.status === "LEAVE" || existing.status === "SICK") continue;
      }

      this.planningRepo.upsert(driverId, dateStr, status as PlanningStatus, undefined, scenarioId);
    }
  }

  updateRosterAssignment(driverId: string, recordId: string, data: Partial<Omit<DriverRosterAssignment, "id" | "sequenceNumber">>): void {
    this.driverRepo.updateRosterAssignment(driverId, recordId, data);
  }

  deleteRosterAssignment(driverId: string, recordId: string): void {
    this.driverRepo.deleteRosterAssignment(driverId, recordId);
  }

  getRosterAssignments(driverId: string): (DriverRosterAssignment & { profileName: string })[] {
    return this.driverRepo.getRosterAssignments(driverId);
  }

  // Computed fields
  getActiveEmployment(driver: Driver): DriverEmploymentRecord | undefined {
    return (driver.employmentRecords || []).find((r) => !r.endDate);
  }

  getActiveFunction(driver: Driver): DriverFunctionRecord | undefined {
    return (driver.functionRecords || []).find((r) => !r.endDate);
  }

  getActiveRoster(driver: Driver): DriverRosterAssignment | undefined {
    return (driver.rosterAssignments || []).find((r) => !r.endDate);
  }

  getComputedFields(driver: Driver): DriverComputedFields {
    const emp = this.getActiveEmployment(driver);
    const pos = this.getActiveFunction(driver);
    const ros = this.getActiveRoster(driver);

    const employers = this.stamtabelRepo.getAll("employers");
    const departments = this.stamtabelRepo.getAll("departments");
    const locations = this.stamtabelRepo.getAll("locations");
    const profiles = this.rosterProfileRepo.getAll();

    return {
      currentEmployer: (emp?.employerId && employers.find((e) => e.id === emp.employerId)?.description) || "",
      currentEmploymentType: emp?.employmentType ? EMPLOYMENT_TYPE_LABELS[emp.employmentType] : "",
      currentPosition: pos?.position || "",
      currentDepartment: (pos?.departmentId && departments.find((d) => d.id === pos.departmentId)?.description) || "",
      currentLocation: (pos?.locationId && locations.find((l) => l.id === pos.locationId)?.description) || "",
      currentManager: pos?.manager || "",
      currentRosterProfile: (ros?.rosterProfileId && profiles.find((p) => p.id === ros.rosterProfileId)?.name) || "",
      currentWeeklyHours: ros?.weeklyHours,
    };
  }

  // Grouping
  groupDrivers(
    drivers: DriverWithEntries[],
    groupBy: GroupByField
  ): { label: string; drivers: DriverWithEntries[] }[] {
    if (groupBy === "none") {
      return [{ label: "", drivers }];
    }

    const groups = new Map<string, DriverWithEntries[]>();
    const employers = this.stamtabelRepo.getAll("employers");
    const departments = this.stamtabelRepo.getAll("departments");
    const locations = this.stamtabelRepo.getAll("locations");

    for (const driver of drivers) {
      let keys: string[];
      const emp = this.getActiveEmployment(driver);
      const pos = this.getActiveFunction(driver);

      switch (groupBy) {
        case "employer":
          keys = [(emp?.employerId && employers.find((e) => e.id === emp.employerId)?.description) || "Onbekend"];
          break;
        case "department":
          keys = [(pos?.departmentId && departments.find((d) => d.id === pos.departmentId)?.description) || "Onbekend"];
          break;
        case "location":
          keys = [(pos?.locationId && locations.find((l) => l.id === pos.locationId)?.description) || "Onbekend"];
          break;
        case "licenseType":
          keys = driver.licenseTypes?.length ? driver.licenseTypes : ["Onbekend"];
          break;
        case "employmentType":
          keys = [emp?.employmentType ? EMPLOYMENT_TYPE_LABELS[emp.employmentType] : "Onbekend"];
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
}
