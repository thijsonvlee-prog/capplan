import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { transformDriver, driverInclude, activeDriverWhereClause, validateForeignKeys, validateMaxLengths, requireRole, requireRoleWithSession, parseJsonBody, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export const GET = withPerfLogging(
  "GET /api/drivers",
  async (request: NextRequest) => {
  try {
    const { error: authError, session } = await requireRoleWithSession("VIEWER");
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    // Pagination parameters (optional — if not provided, return all)
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const isPaginated = pageParam !== null || pageSizeParam !== null;
    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
    const pageSize = Math.min(500, Math.max(1, parseInt(pageSizeParam || "50", 10) || 50));

    const where: any = {};

    // Apply user group department filter
    const allowedDepts = await getAllowedDepartmentIds(session);
    if (allowedDepts !== null) {
      Object.assign(where, driverDepartmentFilter(allowedDepts));
    }

    if (isActive !== null) {
      if (isActive === "true") {
        Object.assign(where, activeDriverWhereClause());
      } else {
        // Inactive = no active employment record (no overlapping record for today)
        where.NOT = activeDriverWhereClause();
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { employeeNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        include: driverInclude,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        ...(isPaginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
      }),
      isPaginated ? prisma.driver.count({ where }) : Promise.resolve(0),
    ]);

    if (isPaginated) {
      return NextResponse.json({
        data: drivers.map(transformDriver),
        total,
        page,
        pageSize,
      });
    }

    // Backward compatible: return plain array when no pagination params
    return NextResponse.json(drivers.map(transformDriver));
  } catch (error) {
    console.error("Error fetching drivers:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan chauffeurs niet ophalen" },
      { status: 500 }
    );
  }
  }
);

export const POST = withPerfLogging(
  "POST /api/drivers",
  async (request: NextRequest) => {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const {
      firstName,
      lastName,
      employeeNumber,
      licenseTypes,
      skillIds,
      employmentRecords,
      functionRecords,
      rosterAssignments,
    } = body;

    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      return NextResponse.json({ error: "Voornaam is verplicht" }, { status: 400 });
    }
    if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
      return NextResponse.json({ error: "Achternaam is verplicht" }, { status: 400 });
    }
    const lengthError = validateMaxLengths([
      { value: firstName, maxLength: 100, label: "Voornaam" },
      { value: lastName, maxLength: 100, label: "Achternaam" },
      { value: employeeNumber, maxLength: 50, label: "Personeelsnummer" },
    ]);
    if (lengthError) {
      return NextResponse.json({ error: lengthError }, { status: 400 });
    }

    // Validate all FK references in nested records.
    // Collect unique IDs per FK-typed field so each field is validated with a single
    // batched count query instead of one per nested record.
    const collectUnique = (records: any[] | undefined, field: string): string[] => {
      if (!records?.length) return [];
      const ids = new Set<string>();
      for (const r of records) {
        const value = r?.[field];
        if (typeof value === "string" && value) ids.add(value);
      }
      return Array.from(ids);
    };

    const employerIds = collectUnique(employmentRecords, "employerId");
    const locationIds = collectUnique(functionRecords, "locationId");
    const departmentIds = collectUnique(functionRecords, "departmentId");
    const rosterProfileIds = collectUnique(rosterAssignments, "rosterProfileId");

    const fkChecks: Promise<string | null>[] = [];
    if (skillIds?.length) {
      fkChecks.push(validateForeignKeys([{ ids: skillIds, model: prisma.skill, label: "competenties" }]));
    }
    if (employerIds.length > 0) {
      fkChecks.push(validateForeignKeys([{ ids: employerIds, model: prisma.employer, label: "werkgevers" }]));
    }
    if (locationIds.length > 0) {
      fkChecks.push(validateForeignKeys([{ ids: locationIds, model: prisma.location, label: "locaties" }]));
    }
    if (departmentIds.length > 0) {
      fkChecks.push(validateForeignKeys([{ ids: departmentIds, model: prisma.department, label: "afdelingen" }]));
    }
    if (rosterProfileIds.length > 0) {
      fkChecks.push(validateForeignKeys([{ ids: rosterProfileIds, model: prisma.rosterProfile, label: "roosterprofielen" }]));
    }
    if (fkChecks.length > 0) {
      const fkErrors = await Promise.all(fkChecks);
      const fkError = fkErrors.find((e) => e !== null);
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }
    }

    const driver = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        employeeNumber: employeeNumber || null,
        licenseTypes: licenseTypes || [],
        skills: skillIds?.length
          ? {
              create: skillIds.map((skillId: string) => ({ skillId })),
            }
          : undefined,
        employmentRecords: employmentRecords?.length
          ? {
              create: employmentRecords.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                employmentType: r.employmentType,
                employerId: r.employerId || null,
              })),
            }
          : undefined,
        functionRecords: functionRecords?.length
          ? {
              create: functionRecords.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                position: r.position,
                locationId: r.locationId || null,
                departmentId: r.departmentId || null,
                manager: r.manager || null,
              })),
            }
          : undefined,
        rosterAssignments: rosterAssignments?.length
          ? {
              create: rosterAssignments.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                rosterProfileId: r.rosterProfileId,
                weeklyHours: r.weeklyHours ?? null,
              })),
            }
          : undefined,
      },
      include: driverInclude,
    });

    const userId = await getAuditUserId();
    logAudit("Driver", driver.id, "CREATE", null, { firstName, lastName, employeeNumber: employeeNumber || null }, userId);

    return NextResponse.json(transformDriver(driver), { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan chauffeur niet aanmaken" },
      { status: 500 }
    );
  }
  }
);
