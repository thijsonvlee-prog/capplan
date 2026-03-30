import type { PlanningStatus, EmploymentType, UserRole } from "./enums";

// === External Source Metadata (AFAS preparation) ===

export type ExternalSourceMetadata = {
  sourceSystem: string;
  externalId: string;
  syncedAt: string;
};

// === Master Data ===

export type Skill = {
  id: string;
  name: string;
  externalSource?: ExternalSourceMetadata;
};

export type StamtabelRecord = {
  id: string;
  code: string;
  description: string;
  externalSource?: ExternalSourceMetadata;
};

// === Driver Domain ===

export type DriverEmploymentRecord = {
  id: string;
  sequenceNumber: number;
  startDate: string;
  endDate?: string;
  employmentType: EmploymentType;
  employerId?: string;
};

export type DriverFunctionRecord = {
  id: string;
  sequenceNumber: number;
  startDate: string;
  endDate?: string;
  position: string;
  locationId?: string;
  departmentId?: string;
  manager?: string;
};

export type DriverRosterAssignment = {
  id: string;
  sequenceNumber: number;
  startDate: string;
  endDate?: string;
  rosterProfileId: string;
  weeklyHours?: number;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  licenseTypes?: string[];
  skillIds?: string[];
  employmentRecords?: DriverEmploymentRecord[];
  functionRecords?: DriverFunctionRecord[];
  rosterAssignments?: DriverRosterAssignment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  externalSource?: ExternalSourceMetadata;
};

// === Planning Domain ===

export type PlanningEntryOptions = {
  leaveTypeId?: string;
  sickPercentage?: number;
  notes?: string;
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

// === Scenario Domain ===

export type Scenario = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

// === Roster Profile Domain ===

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

// === User Domain (preparation for multi-user) ===

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UserPreference = {
  id: string;
  userId: string;
  key: string;
  value: string;
  updatedAt: string;
};

export type UserContext = {
  userId: string;
  role: UserRole;
};

// === Import Source Domain ===

export type ImportSource = {
  id: string;
  name: string;
  type: string;
  targetEntity: string;
  fieldMappings: Record<string, string>;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

// === Computed Types ===

export type DriverComputedFields = {
  currentEmployer: string;
  currentEmploymentType: string;
  currentPosition: string;
  currentDepartment: string;
  currentLocation: string;
  currentManager: string;
  currentRosterProfile: string;
  currentWeeklyHours: number | undefined;
};
