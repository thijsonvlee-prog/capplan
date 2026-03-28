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
  return {
    id: dbDriver.id,
    firstName: dbDriver.firstName,
    lastName: dbDriver.lastName,
    employeeNumber: dbDriver.employeeNumber || undefined,
    licenseTypes: dbDriver.licenseTypes || [],
    skillIds: dbDriver.skills?.map((ds: any) => ds.skillId) || [],
    employmentRecords: dbDriver.employmentRecords || [],
    functionRecords: dbDriver.functionRecords || [],
    rosterAssignments: dbDriver.rosterAssignments || [],
    isActive: dbDriver.isActive,
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
