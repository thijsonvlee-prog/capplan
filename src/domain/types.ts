import type { PlanningStatus, EmploymentType, UserRole, SourceType, ApiAuthType, ApiMethod } from "./enums";

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
  scenarioId?: string;
  date: string; // YYYY-MM-DD
  status: PlanningStatus;
  leaveTypeId?: string;
  sickPercentage?: number; // 0-99 attendance percentage when status is SICK
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

// === User Domain ===

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  userGroupId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserGroupMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type UserGroup = {
  id: string;
  name: string;
  departmentIds: string[];
  memberCount: number;
  members?: UserGroupMember[];
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
  type: SourceType;
  targetEntity: string;
  fieldMappings: Record<string, string>;
  description?: string;
  // API-specific fields (only present when type = "API")
  apiUrl?: string;
  apiMethod?: ApiMethod;
  apiHeaders?: Record<string, string>;
  apiAuthType?: ApiAuthType;
  apiCredentials?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

// === CSV Upload Domain ===

export type CsvMappingValidation = {
  sourceColumn: string;
  targetField: string;
  detected: boolean;
};

export type CsvUploadResult = {
  fileName: string;
  fileSize: number;
  separator: string;
  detectedColumns: string[];
  totalRows: number;
  previewRows: Record<string, string>[];
  mappingValidation: CsvMappingValidation[];
  unmappedColumns: string[];
};

// === Import Execution Domain ===

export type ImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type ImportLog = {
  id: string;
  importSourceId: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: ImportRowError[];
  executedAt: string;
};

export type ImportExecuteResult = {
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: ImportRowError[];
};

// === Audit Log ===

export type AuditLogEntry = {
  id: string;
  tableName: string;
  recordId: string;
  action: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: string;
};

export type AuditLogPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
