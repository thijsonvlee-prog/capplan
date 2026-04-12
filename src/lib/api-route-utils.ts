/**
 * Shared utilities for API route handlers.
 * Extracted to eliminate duplication across route files.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanningStatus, EmploymentType } from "@/domain/enums";
import type { UserRole } from "@/domain/enums";

// === User identity resolution ===

/**
 * Resolve the userId from the session. When auth is not configured
 * (no NEXTAUTH_SECRET), falls back to "default" for backward compatibility.
 * Returns an error response if auth is configured but the user is not logged in.
 */
export async function resolveUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  if (!process.env.NEXTAUTH_SECRET) {
    return { userId: "default" };
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Niet ingelogd. Log in om deze actie uit te voeren." },
        { status: 401 }
      ),
    };
  }
  return { userId: session.user.id };
}

// === Role enforcement ===

/**
 * Role hierarchy: ADMIN > PLANNER > VIEWER.
 * Higher index = more permissions.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 0,
  PLANNER: 1,
  ADMIN: 2,
};

/**
 * Check that the current session user has at least the required role.
 * Returns null if authorized, or a NextResponse (403/401) if not.
 *
 * When auth providers are not configured (no NEXTAUTH_SECRET), enforcement is
 * skipped to avoid blocking development/preview environments without auth.
 */
export async function requireRole(
  minimumRole: UserRole
): Promise<NextResponse | null> {
  const result = await requireRoleWithSession(minimumRole);
  return result.error;
}

/**
 * Like requireRole, but also returns the session for reuse by downstream
 * helpers (e.g. getAllowedDepartmentIds) to avoid redundant DB lookups.
 */
export async function requireRoleWithSession(
  minimumRole: UserRole
): Promise<{ error: NextResponse | null; session: any }> {
  // Skip enforcement when auth is not configured
  if (!process.env.NEXTAUTH_SECRET) return { error: null, session: null };

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Niet ingelogd. Log in om deze actie uit te voeren." },
        { status: 401 }
      ),
      session: null,
    };
  }

  const userLevel = ROLE_HIERARCHY[session.user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

  if (userLevel < requiredLevel) {
    return {
      error: NextResponse.json(
        { error: "Onvoldoende rechten om deze actie uit te voeren." },
        { status: 403 }
      ),
      session,
    };
  }

  return { error: null, session };
}

// === User group department filtering ===

/**
 * Get the allowed department IDs for the current user based on their user group.
 * Returns null if:
 * - Auth is not configured (no NEXTAUTH_SECRET)
 * - User has no session
 * - User has no group (ungrouped users see all data)
 *
 * Returns a string[] of department IDs if the user belongs to a group.
 */
export async function getAllowedDepartmentIds(existingSession?: any): Promise<string[] | null> {
  if (!process.env.NEXTAUTH_SECRET) return null;

  const session = existingSession ?? await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userGroupId: true },
  });

  if (!user?.userGroupId) return null;

  const groupDepts = await prisma.userGroupDepartment.findMany({
    where: { userGroupId: user.userGroupId },
    select: { departmentId: true },
  });

  // If the group has no departments configured, treat as unrestricted
  // to prevent silently hiding all data for misconfigured groups
  if (groupDepts.length === 0) return null;

  return groupDepts.map((gd) => gd.departmentId);
}

/**
 * Build a Prisma where clause to filter drivers by allowed departments.
 * Drivers are linked to departments via DriverFunctionRecord.departmentId.
 * A driver is visible if they have at least one function record with a matching department.
 */
export function driverDepartmentFilter(departmentIds: string[]) {
  return {
    functionRecords: {
      some: {
        departmentId: { in: departmentIds },
      },
    },
  };
}

// === Field mapping validation ===

/** Valid target fields per entity for import field mappings */
const VALID_TARGET_FIELDS: Record<string, string[]> = {
  drivers: ["firstName", "lastName", "employeeNumber", "licenseTypes"],
  employers: ["code", "description"],
  departments: ["code", "description"],
  locations: ["code", "description"],
};

/**
 * Validate that fieldMappings is a well-formed Record<string, string>.
 * Returns a Dutch error message if invalid, or null if valid.
 * Optionally validates that target fields are valid for the specified target entity.
 */
export function validateFieldMappings(
  fieldMappings: unknown,
  targetEntity?: string
): string | null {
  if (
    typeof fieldMappings !== "object" ||
    fieldMappings === null ||
    Array.isArray(fieldMappings)
  ) {
    return "Veldkoppelingen moeten een object zijn met bronkolom-doelveld paren";
  }

  const entries = Object.entries(fieldMappings as Record<string, unknown>);

  if (entries.length === 0) {
    return "Veldkoppelingen mogen niet leeg zijn";
  }

  for (const [key, value] of entries) {
    if (typeof key !== "string" || key.trim() === "") {
      return "Alle bronkolomnamen in veldkoppelingen moeten niet-lege tekst zijn";
    }
    if (typeof value !== "string" || value.trim() === "") {
      return `Doelveld voor bronkolom "${key}" moet niet-lege tekst zijn`;
    }
  }

  // Validate target fields against known entity fields
  if (targetEntity && VALID_TARGET_FIELDS[targetEntity]) {
    const validFields = VALID_TARGET_FIELDS[targetEntity];
    for (const [key, value] of entries) {
      if (!validFields.includes(value as string)) {
        return `Ongeldig doelveld "${value}" voor bronkolom "${key}". Geldige doelvelden voor ${targetEntity}: ${validFields.join(", ")}`;
      }
    }
  }

  return null;
}

// === JSON body parsing ===

/**
 * Safely parse the JSON body from a request.
 * Returns { data } on success, or { error } with a 400 response on malformed JSON.
 */
export async function parseJsonBody<T = any>(
  request: Request
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Ongeldige JSON in verzoek" },
        { status: 400 }
      ),
    };
  }
}

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

// === Shared validation constants ===

/** Valid planning status values for request validation */
export const VALID_PLANNING_STATUSES = Object.values(PlanningStatus);

/** Valid employment type values for request validation */
export const VALID_EMPLOYMENT_TYPES = Object.values(EmploymentType);

/** Maximum character length for planning entry notes */
export const MAX_NOTES_LENGTH = 500;

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

/**
 * Validate that a string value does not exceed `maxLength` characters.
 * Non-string values are skipped (treated as valid) so callers can pass through
 * optional fields without an explicit pre-check. Empty values are also skipped.
 * Returns a Dutch error message on violation, or null if valid.
 */
export function validateMaxLength(
  value: unknown,
  maxLength: number,
  label: string
): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.length > maxLength) {
    return `${label} mag maximaal ${maxLength} tekens bevatten`;
  }
  return null;
}

/**
 * Validate multiple string length caps at once. Returns the first violation,
 * or null if all checks pass. Preserves the exact error phrasing of
 * validateMaxLength, so it is safe to use as a drop-in replacement for
 * multiple inline checks.
 */
export function validateMaxLengths(
  checks: { value: unknown; maxLength: number; label: string }[]
): string | null {
  for (const { value, maxLength, label } of checks) {
    const error = validateMaxLength(value, maxLength, label);
    if (error) return error;
  }
  return null;
}

/**
 * Validate that an end date is not before a start date.
 * Performs a lexicographic comparison on YYYY-MM-DD strings, which is safe
 * because the date format is validated up-front at every call site (PB-186).
 * Skips the check if either bound is missing.
 * Returns a Dutch error message on violation, or null if valid.
 */
export function validateDateRange(
  startDate: unknown,
  endDate: unknown
): string | null {
  if (typeof startDate !== "string" || typeof endDate !== "string") return null;
  if (!startDate || !endDate) return null;
  if (endDate < startDate) {
    return "Einddatum mag niet voor de startdatum liggen";
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
  const results = await Promise.all(
    checks.map(async ({ ids, model, label }) => {
      if (ids.length === 0) return null;
      const count = await model.count({ where: { id: { in: ids } } });
      return count !== ids.length
        ? `Eén of meer opgegeven ${label} bestaan niet`
        : null;
    })
  );
  return results.find((r) => r !== null) ?? null;
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

// === Date validation utilities ===

/**
 * Parse a comma-separated date string into a validated array of date strings.
 * Performs splitting, trimming, empty check, max length check, and format validation.
 * Returns { dateList } on success, or { error } with a Dutch error message on failure.
 */
export function parseDateList(
  dates: string,
  maxLength: number = 366
): { dateList: string[]; error?: never } | { dateList?: never; error: string } {
  const dateList = dates.split(",").map((d) => d.trim()).filter(Boolean);

  if (dateList.length === 0) {
    return { error: "Minimaal één geldige datum is verplicht" };
  }

  if (dateList.length > maxLength) {
    return { error: `Maximaal ${maxLength} datums per verzoek` };
  }

  const formatError = validateDateFormats(dateList);
  if (formatError) {
    return { error: formatError };
  }

  return { dateList };
}

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate that a date string is in YYYY-MM-DD format and represents a valid date.
 * Returns a Dutch error message if invalid, or null if valid.
 */
export function validateDateFormat(date: string): string | null {
  if (!DATE_FORMAT_REGEX.test(date)) {
    return `Ongeldige datumnotatie: "${date}". Gebruik het formaat JJJJ-MM-DD.`;
  }
  // Check that the date is actually valid (e.g. reject 2025-02-30)
  const parsed = new Date(date + "T00:00:00Z");
  if (isNaN(parsed.getTime())) {
    return `Ongeldige datum: "${date}".`;
  }
  // Verify the parsed date matches the input (catches e.g. Feb 30 → Mar 2)
  const iso = parsed.toISOString().split("T")[0];
  if (iso !== date) {
    return `Ongeldige datum: "${date}".`;
  }
  return null;
}

/**
 * Validate an array of date strings. Returns a Dutch error message for the first
 * invalid date, or null if all dates are valid.
 */
export function validateDateFormats(dates: string[]): string | null {
  for (const date of dates) {
    const error = validateDateFormat(date);
    if (error) return error;
  }
  return null;
}

// === Sub-record utilities ===

/**
 * Verify that a sub-record (employment, function, roster assignment) belongs to
 * the specified driver. Returns the record if owned, or null if not found.
 * Works with both the main Prisma client and transaction delegates.
 */
export async function verifyRecordOwnership(
  model: { findFirst: (args: any) => Promise<any> },
  recordId: string,
  driverId: string
) {
  return model.findFirst({
    where: { id: recordId, driverId },
  });
}

/**
 * Auto-close open-ended records by setting their endDate to the day before the new startDate.
 * Used by employment, function, and roster assignment routes.
 */
export async function autoCloseOpenRecords(
  model: { updateMany: Function },
  driverId: string,
  newStartDate: string
) {
  const dayBefore = new Date(newStartDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const endDateStr = dayBefore.toISOString().split("T")[0];

  await model.updateMany({
    where: { driverId, endDate: null },
    data: { endDate: endDateStr },
  });
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
