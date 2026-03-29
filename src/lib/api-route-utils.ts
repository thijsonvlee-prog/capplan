/**
 * Shared utilities for API route handlers.
 * Extracted to eliminate duplication across route files.
 */
import { prisma } from "@/lib/prisma";

// === Driver utilities ===

/** Prisma include object for fetching a driver with all relations */
export const driverInclude = {
  skills: true,
  employmentRecords: true,
  functionRecords: true,
  rosterAssignments: true,
} as const;

/** Transform a Prisma driver record to the API response shape */
export function transformDriver(dbDriver: any) {
  const employmentRecords = dbDriver.employmentRecords || [];
  const today = new Date().toISOString().split("T")[0];
  // Compute isActive from employment records (ESC-002: employment-based status is authoritative)
  const isActive = employmentRecords.some(
    (r: any) => r.startDate <= today && (!r.endDate || r.endDate >= today)
  );
  return {
    id: dbDriver.id,
    firstName: dbDriver.firstName,
    lastName: dbDriver.lastName,
    employeeNumber: dbDriver.employeeNumber || undefined,
    licenseTypes: dbDriver.licenseTypes || [],
    skillIds: dbDriver.skills?.map((ds: any) => ds.skillId) || [],
    employmentRecords,
    functionRecords: dbDriver.functionRecords || [],
    rosterAssignments: dbDriver.rosterAssignments || [],
    isActive,
    createdAt: dbDriver.createdAt.toISOString(),
    updatedAt: dbDriver.updatedAt.toISOString(),
  };
}

// === Roster profile utilities ===

/** Transform a Prisma roster profile record to the API response shape */
export function transformProfile(profile: any) {
  return {
    id: profile.id,
    name: profile.name,
    entries: (profile.days || []).map((d: any) => ({
      dayOffset: d.dayOffset,
      status: d.status,
    })),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

// === Planning entry utilities ===

/** Transform a Prisma planning entry to the API response shape */
export function transformPlanningEntry(entry: {
  id: string;
  driverId: string;
  date: string;
  status: string;
  leaveTypeId: string | null;
  sickPercentage: number | null;
  notes: string | null;
  scenarioId: string | null;
}) {
  return {
    id: entry.id,
    driverId: entry.driverId,
    date: entry.date,
    status: entry.status,
    leaveTypeId: entry.leaveTypeId || undefined,
    sickPercentage: entry.sickPercentage ?? undefined,
    notes: entry.notes || undefined,
    scenarioId: entry.scenarioId || undefined,
  };
}

// === Scenario utilities ===

/** Normalize scenario ID: treat "default" and empty strings as null (base scenario) */
export function resolveScenarioId(scenarioId?: string | null): string | null {
  if (!scenarioId || scenarioId === "default" || scenarioId === "") return null;
  return scenarioId;
}

// === Settings utilities ===

const typeModelMap: Record<string, string> = {
  employers: "employer",
  departments: "department",
  locations: "location",
  "leave-types": "leaveType",
};

/** Get the Prisma model delegate for a settings type string */
export function getSettingsModel(type: string) {
  const modelName = typeModelMap[type];
  if (!modelName) return null;
  return (prisma as any)[modelName];
}

// === Validation utilities ===

/**
 * Validate that required fields are present and non-empty in a request body.
 * Returns a Dutch-language error message for the first missing field, or null if all valid.
 */
export function validateRequired(
  body: Record<string, unknown>,
  fields: { field: string; label: string }[]
): string | null {
  for (const { field, label } of fields) {
    const value = body[field];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      return `${label} is verplicht`;
    }
  }
  return null;
}

// === Driver status utilities ===

/**
 * Prisma where clause to filter drivers with active employment (ESC-002).
 * A driver is active if they have at least one employment record where
 * startDate <= referenceDate AND (endDate is null OR endDate >= referenceDate).
 */
export function activeDriverWhereClause(referenceDate?: string) {
  const ref = referenceDate || new Date().toISOString().split("T")[0];
  return {
    employmentRecords: {
      some: {
        startDate: { lte: ref },
        OR: [
          { endDate: null },
          { endDate: { gte: ref } },
        ],
      },
    },
  };
}

// === Foreign key validation utilities ===

/**
 * Validate that referenced foreign key IDs exist in their respective tables.
 * Returns a Dutch error message if any reference is invalid, or null if all valid.
 * Uses batch findMany to avoid N+1 lookups.
 */
export async function validateForeignKeys(
  checks: { ids: string[]; model: { count: (args: any) => Promise<number> }; label: string }[]
): Promise<string | null> {
  for (const { ids, model, label } of checks) {
    if (ids.length === 0) continue;
    const count = await model.count({ where: { id: { in: ids } } });
    if (count !== ids.length) {
      return `Eén of meer opgegeven ${label} bestaan niet`;
    }
  }
  return null;
}

/**
 * Validate a single optional foreign key reference.
 * Returns a Dutch error message if the reference is invalid, or null if valid or not provided.
 */
export async function validateOptionalForeignKey(
  id: string | null | undefined,
  model: { count: (args: any) => Promise<number> },
  label: string
): Promise<string | null> {
  if (!id) return null;
  const count = await model.count({ where: { id } });
  if (count === 0) {
    return `De opgegeven ${label} bestaat niet`;
  }
  return null;
}

// === Sub-record utilities ===

/**
 * Auto-close open-ended records by setting their endDate to the day before the new startDate.
 * Used by employment, function, and roster assignment routes.
 */
export async function autoCloseOpenRecords(
  model: { findMany: Function; updateMany: Function },
  driverId: string,
  newStartDate: string
) {
  const openRecords = await model.findMany({
    where: { driverId, endDate: null },
  });

  if (openRecords.length > 0) {
    const dayBefore = new Date(newStartDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const endDateStr = dayBefore.toISOString().split("T")[0];

    await model.updateMany({
      where: { driverId, endDate: null },
      data: { endDate: endDateStr },
    });
  }
}

/**
 * Get the next sequence number for a sub-record model.
 */
export async function getNextSequenceNumber(
  model: { aggregate: Function },
  driverId: string
): Promise<number> {
  const maxSeq = await model.aggregate({
    where: { driverId },
    _max: { sequenceNumber: true },
  });
  return (maxSeq._max.sequenceNumber || 0) + 1;
}
