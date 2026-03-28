import type {
  Driver,
  DriverEmploymentRecord,
  DriverFunctionRecord,
  DriverRosterAssignment,
} from "@/domain/types";

export interface DriverRepository {
  getAll(filter?: { isActive?: boolean; search?: string }): Driver[];
  getById(id: string): Driver | undefined;
  create(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">): Driver;
  update(id: string, data: Partial<Omit<Driver, "id" | "createdAt">>): Driver;
  delete(id: string): void;

  // Employment records
  addEmploymentRecord(driverId: string, data: Omit<DriverEmploymentRecord, "id" | "sequenceNumber">): void;
  updateEmploymentRecord(driverId: string, recordId: string, data: Partial<Omit<DriverEmploymentRecord, "id" | "sequenceNumber">>): void;
  deleteEmploymentRecord(driverId: string, recordId: string): void;
  getEmploymentRecords(driverId: string): DriverEmploymentRecord[];

  // Function records (position/role history)
  addFunctionRecord(driverId: string, data: Omit<DriverFunctionRecord, "id" | "sequenceNumber">): void;
  updateFunctionRecord(driverId: string, recordId: string, data: Partial<Omit<DriverFunctionRecord, "id" | "sequenceNumber">>): void;
  deleteFunctionRecord(driverId: string, recordId: string): void;
  getFunctionRecords(driverId: string): DriverFunctionRecord[];

  // Roster assignments
  addRosterAssignment(driverId: string, data: Omit<DriverRosterAssignment, "id" | "sequenceNumber">): void;
  updateRosterAssignment(driverId: string, recordId: string, data: Partial<Omit<DriverRosterAssignment, "id" | "sequenceNumber">>): void;
  deleteRosterAssignment(driverId: string, recordId: string): void;
  getRosterAssignments(driverId: string): (DriverRosterAssignment & { profileName: string })[];
}
