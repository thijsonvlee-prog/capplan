import type {
  CsvUploadResult,
  Driver,
  DriverEmploymentRecord,
  DriverFunctionRecord,
  DriverRosterAssignment,
  DriverWithEntries,
  ImportExecuteResult,
  ImportLog,
  ImportSource,
  PlanningEntry,
  RosterProfile,
  RosterProfileEntry,
  Scenario,
  Skill,
  StamtabelRecord,
  User,
} from "@/domain/types";

// === Helpers ===

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function buildUrl(
  path: string,
  params?: Record<string, string | undefined>
): string {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

function jsonBody(data: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function putBody(data: unknown): RequestInit {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function deleteMethod(): RequestInit {
  return { method: "DELETE" };
}

// === API Namespaces ===

const drivers = {
  list(filter?: {
    isActive?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Driver[]> {
    return fetchJson<Driver[]>(
      buildUrl("/api/drivers", {
        isActive: filter?.isActive !== undefined ? String(filter.isActive) : undefined,
        search: filter?.search,
        page: filter?.page !== undefined ? String(filter.page) : undefined,
        pageSize: filter?.pageSize !== undefined ? String(filter.pageSize) : undefined,
      })
    );
  },

  listPaginated(filter?: {
    isActive?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Driver[]; total: number; page: number; pageSize: number }> {
    return fetchJson<{ data: Driver[]; total: number; page: number; pageSize: number }>(
      buildUrl("/api/drivers", {
        isActive: filter?.isActive !== undefined ? String(filter.isActive) : undefined,
        search: filter?.search,
        page: String(filter?.page ?? 1),
        pageSize: String(filter?.pageSize ?? 50),
      })
    );
  },

  get(id: string): Promise<Driver> {
    return fetchJson<Driver>(`/api/drivers/${id}`);
  },

  create(
    data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">
  ): Promise<Driver> {
    return fetchJson<Driver>("/api/drivers", jsonBody(data));
  },

  update(id: string, data: Partial<any>): Promise<Driver> {
    return fetchJson<Driver>(`/api/drivers/${id}`, putBody(data));
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/drivers/${id}`, deleteMethod());
  },

  getEmploymentRecords(id: string): Promise<DriverEmploymentRecord[]> {
    return fetchJson<DriverEmploymentRecord[]>(`/api/drivers/${id}/employment`);
  },

  addEmploymentRecord(id: string, data: any): Promise<void> {
    return fetchJson<void>(`/api/drivers/${id}/employment`, jsonBody(data));
  },

  deleteEmploymentRecord(id: string, recordId: string): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/employment/${recordId}`,
      deleteMethod()
    );
  },

  updateEmploymentRecord(id: string, recordId: string, data: any): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/employment/${recordId}`,
      putBody(data)
    );
  },

  getFunctionRecords(id: string): Promise<DriverFunctionRecord[]> {
    return fetchJson<DriverFunctionRecord[]>(`/api/drivers/${id}/functions`);
  },

  addFunctionRecord(id: string, data: any): Promise<void> {
    return fetchJson<void>(`/api/drivers/${id}/functions`, jsonBody(data));
  },

  deleteFunctionRecord(id: string, recordId: string): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/functions/${recordId}`,
      deleteMethod()
    );
  },

  updateFunctionRecord(id: string, recordId: string, data: any): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/functions/${recordId}`,
      putBody(data)
    );
  },

  getRosterAssignments(
    id: string
  ): Promise<(DriverRosterAssignment & { profileName: string })[]> {
    return fetchJson<(DriverRosterAssignment & { profileName: string })[]>(
      `/api/drivers/${id}/roster-assignments`
    );
  },

  addRosterAssignment(id: string, data: any): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/roster-assignments`,
      jsonBody(data)
    );
  },

  deleteRosterAssignment(id: string, recordId: string): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/roster-assignments/${recordId}`,
      deleteMethod()
    );
  },

  updateRosterAssignment(id: string, recordId: string, data: any): Promise<void> {
    return fetchJson<void>(
      `/api/drivers/${id}/roster-assignments/${recordId}`,
      putBody(data)
    );
  },
};

const planning = {
  getForRange(
    dates: string[],
    scenarioId?: string,
    pagination?: { page: number; pageSize: number }
  ): Promise<{ drivers: DriverWithEntries[]; dates: string[]; total?: number; page?: number; pageSize?: number }> {
    return fetchJson<{ drivers: DriverWithEntries[]; dates: string[]; total?: number; page?: number; pageSize?: number }>(
      buildUrl("/api/planning/for-range", {
        dates: dates.join(","),
        scenarioId,
        page: pagination ? String(pagination.page) : undefined,
        pageSize: pagination ? String(pagination.pageSize) : undefined,
      })
    );
  },

  getEntries(
    scenarioId?: string,
    dates?: string[],
    driverId?: string
  ): Promise<PlanningEntry[]> {
    return fetchJson<PlanningEntry[]>(
      buildUrl("/api/planning", {
        scenarioId,
        dates: dates?.join(","),
        driverId,
      })
    );
  },

  upsert(data: {
    driverId: string;
    date: string;
    status: string;
    leaveTypeId?: string;
    sickPercentage?: number;
    notes?: string;
    scenarioId?: string;
  }): Promise<PlanningEntry> {
    return fetchJson<PlanningEntry>("/api/planning", jsonBody(data));
  },

  upsertBulk(data: {
    driverId: string;
    dates: string[];
    status: string;
    leaveTypeId?: string;
    sickPercentage?: number;
    notes?: string;
    scenarioId?: string;
  }): Promise<void> {
    return fetchJson<void>("/api/planning/bulk", jsonBody(data));
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/planning/${id}`, deleteMethod());
  },

  getCapacity(
    dates: string[],
    scenarioId?: string
  ): Promise<Record<string, Record<string, number>>> {
    return fetchJson<Record<string, Record<string, number>>>(
      buildUrl("/api/planning/capacity", {
        dates: dates.join(","),
        scenarioId,
      })
    );
  },
};

const scenarios = {
  list(): Promise<Scenario[]> {
    return fetchJson<Scenario[]>("/api/scenarios");
  },

  create(name: string, description?: string): Promise<Scenario> {
    return fetchJson<Scenario>("/api/scenarios", jsonBody({ name, description }));
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/scenarios/${id}`, deleteMethod());
  },

  duplicate(sourceId: string, name: string): Promise<Scenario> {
    return fetchJson<Scenario>(
      `/api/scenarios/${sourceId}/duplicate`,
      jsonBody({ name })
    );
  },

  getActiveId(): Promise<string> {
    return fetchJson<{ activeId: string }>("/api/scenarios/active").then(r => r.activeId);
  },

  setActiveId(id: string): Promise<void> {
    return fetchJson<void>("/api/scenarios/active", putBody({ activeId: id }));
  },
};

const settings = {
  // Skills
  getSkills(): Promise<Skill[]> {
    return fetchJson<Skill[]>("/api/settings/skills");
  },
  createSkill(name: string): Promise<Skill> {
    return fetchJson<Skill>("/api/settings/skills", jsonBody({ name }));
  },
  updateSkill(id: string, name: string): Promise<Skill> {
    return fetchJson<Skill>(`/api/settings/skills/${id}`, putBody({ name }));
  },
  deleteSkill(id: string): Promise<void> {
    return fetchJson<void>(`/api/settings/skills/${id}`, deleteMethod());
  },

  // Employers
  getEmployers(): Promise<StamtabelRecord[]> {
    return fetchJson<StamtabelRecord[]>("/api/settings/employers");
  },
  createEmployer(code: string, description: string): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      "/api/settings/employers",
      jsonBody({ code, description })
    );
  },
  updateEmployer(
    id: string,
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      `/api/settings/employers/${id}`,
      putBody({ code, description })
    );
  },
  deleteEmployer(id: string): Promise<void> {
    return fetchJson<void>(`/api/settings/employers/${id}`, deleteMethod());
  },

  // Departments
  getDepartments(): Promise<StamtabelRecord[]> {
    return fetchJson<StamtabelRecord[]>("/api/settings/departments");
  },
  createDepartment(
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      "/api/settings/departments",
      jsonBody({ code, description })
    );
  },
  updateDepartment(
    id: string,
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      `/api/settings/departments/${id}`,
      putBody({ code, description })
    );
  },
  deleteDepartment(id: string): Promise<void> {
    return fetchJson<void>(`/api/settings/departments/${id}`, deleteMethod());
  },

  // Locations
  getLocations(): Promise<StamtabelRecord[]> {
    return fetchJson<StamtabelRecord[]>("/api/settings/locations");
  },
  createLocation(code: string, description: string): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      "/api/settings/locations",
      jsonBody({ code, description })
    );
  },
  updateLocation(
    id: string,
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      `/api/settings/locations/${id}`,
      putBody({ code, description })
    );
  },
  deleteLocation(id: string): Promise<void> {
    return fetchJson<void>(`/api/settings/locations/${id}`, deleteMethod());
  },

  // Leave Types
  getLeaveTypes(): Promise<StamtabelRecord[]> {
    return fetchJson<StamtabelRecord[]>("/api/settings/leave-types");
  },
  createLeaveType(
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      "/api/settings/leave-types",
      jsonBody({ code, description })
    );
  },
  updateLeaveType(
    id: string,
    code: string,
    description: string
  ): Promise<StamtabelRecord> {
    return fetchJson<StamtabelRecord>(
      `/api/settings/leave-types/${id}`,
      putBody({ code, description })
    );
  },
  deleteLeaveType(id: string): Promise<void> {
    return fetchJson<void>(`/api/settings/leave-types/${id}`, deleteMethod());
  },
};

const rosterProfiles = {
  list(): Promise<RosterProfile[]> {
    return fetchJson<RosterProfile[]>("/api/roster-profiles");
  },

  get(id: string): Promise<RosterProfile | undefined> {
    return fetchJson<RosterProfile | undefined>(`/api/roster-profiles/${id}`);
  },

  create(name: string, entries: RosterProfileEntry[]): Promise<RosterProfile> {
    return fetchJson<RosterProfile>(
      "/api/roster-profiles",
      jsonBody({ name, entries })
    );
  },

  update(
    id: string,
    name: string,
    entries: RosterProfileEntry[]
  ): Promise<RosterProfile> {
    return fetchJson<RosterProfile>(
      `/api/roster-profiles/${id}`,
      putBody({ name, entries })
    );
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/roster-profiles/${id}`, deleteMethod());
  },
};

const importSources = {
  list(): Promise<ImportSource[]> {
    return fetchJson<{ data: ImportSource[] }>("/api/import-sources").then(r => r.data);
  },

  get(id: string): Promise<ImportSource> {
    return fetchJson<{ data: ImportSource }>(`/api/import-sources/${id}`).then(r => r.data);
  },

  create(data: { name: string; targetEntity: string; fieldMappings: Record<string, string>; description?: string }): Promise<ImportSource> {
    return fetchJson<{ data: ImportSource }>("/api/import-sources", jsonBody(data)).then(r => r.data);
  },

  update(id: string, data: { name: string; targetEntity: string; fieldMappings: Record<string, string>; description?: string }): Promise<ImportSource> {
    return fetchJson<{ data: ImportSource }>(`/api/import-sources/${id}`, putBody(data)).then(r => r.data);
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/import-sources/${id}`, deleteMethod());
  },

  upload(id: string, file: File): Promise<CsvUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return fetchJson<{ data: CsvUploadResult }>(`/api/import-sources/${id}/upload`, {
      method: "POST",
      body: formData,
    }).then(r => r.data);
  },

  execute(id: string, file: File, mode: "create" | "upsert" = "create"): Promise<ImportExecuteResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    return fetchJson<{ data: ImportExecuteResult }>(`/api/import-sources/${id}/execute`, {
      method: "POST",
      body: formData,
    }).then(r => r.data);
  },

  getLogs(id: string): Promise<ImportLog[]> {
    return fetchJson<{ data: ImportLog[] }>(`/api/import-sources/${id}/logs`).then(r => r.data);
  },
};

const users = {
  list(): Promise<User[]> {
    return fetchJson<{ data: User[] }>("/api/users").then(r => r.data);
  },

  updateRole(id: string, role: string): Promise<User> {
    return fetchJson<{ data: User }>(`/api/users/${id}`, putBody({ role })).then(r => r.data);
  },
};

const preferences = {
  get(key: string): Promise<string | null> {
    return fetchJson<string | null>(
      buildUrl("/api/preferences", { key })
    );
  },

  set(key: string, value: string): Promise<void> {
    return fetchJson<void>(
      "/api/preferences",
      putBody({ key, value })
    );
  },
};

// === Exported API Object ===

export const api = {
  drivers,
  planning,
  scenarios,
  settings,
  rosterProfiles,
  importSources,
  users,
  preferences,
};

export default api;
