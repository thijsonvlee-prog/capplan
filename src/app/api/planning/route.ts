import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, transformPlanningEntry, validateOptionalForeignKey, validateMaxLength, requireRole, requireRoleWithSession, parseJsonBody, validateDateFormat, parseDateList, getAllowedDepartmentIds, driverDepartmentFilter, VALID_PLANNING_STATUSES, MAX_NOTES_LENGTH } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning",
  async (request: NextRequest) => {
  try {
    const { error: authError, session } = await requireRoleWithSession("VIEWER");
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");
    const dates = searchParams.get("dates");
    const driverId = searchParams.get("driverId");

    if (!dates && !driverId) {
      return NextResponse.json(
        { error: "Parameter 'dates' of 'driverId' is verplicht." },
        { status: 400 }
      );
    }

    const where: any = {};

    const resolvedScenarioId = resolveScenarioId(scenarioId);
    if (resolvedScenarioId === null) {
      where.scenarioId = null;
    } else {
      where.scenarioId = resolvedScenarioId;
    }

    if (dates) {
      const parsed = parseDateList(dates, 366);
      if ("error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      where.date = { in: parsed.dateList };
    }

    if (driverId) {
      // Verify the driver is within the user's allowed departments
      const allowedDepts = await getAllowedDepartmentIds(session);
      if (allowedDepts !== null) {
        const driverInScope = await prisma.driver.count({
          where: { id: driverId, ...driverDepartmentFilter(allowedDepts) },
        });
        if (driverInScope === 0) {
          return NextResponse.json(
            { error: "Chauffeur niet gevonden" },
            { status: 404 }
          );
        }
      }
      where.driverId = driverId;
    }

    const entries = await prisma.planningEntry.findMany({ where });

    return NextResponse.json(entries.map(transformPlanningEntry));
  } catch (error) {
    console.error("Error fetching planning entries:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan planningsgegevens niet ophalen" },
      { status: 500 }
    );
  }
  }
);

export const POST = withPerfLogging(
  "POST /api/planning",
  async (request: NextRequest) => {
  try {
    const { error: authError, session } = await requireRoleWithSession("PLANNER");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { driverId, date, status, leaveTypeId, sickPercentage, notes, scenarioId } = body;

    if (!driverId || !date || !status) {
      return NextResponse.json(
        { error: "driverId, datum en status zijn verplicht" },
        { status: 400 }
      );
    }

    if (!VALID_PLANNING_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Ongeldige status "${status}". Geldige waarden: ${VALID_PLANNING_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (sickPercentage !== undefined && sickPercentage !== null && (sickPercentage < 0 || sickPercentage > 99)) {
      return NextResponse.json(
        { error: "Ziektepercentage moet tussen 0 en 99 liggen" },
        { status: 400 }
      );
    }

    const notesLengthError = validateMaxLength(notes, MAX_NOTES_LENGTH, "Notitie");
    if (notesLengthError) {
      return NextResponse.json({ error: notesLengthError }, { status: 400 });
    }

    const dateError = validateDateFormat(String(date));
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    // Verify the driver is within the user's allowed departments
    const allowedDepts = await getAllowedDepartmentIds(session);
    if (allowedDepts !== null) {
      const driverInScope = await prisma.driver.count({
        where: { id: driverId, ...driverDepartmentFilter(allowedDepts) },
      });
      if (driverInScope === 0) {
        return NextResponse.json(
          { error: "Chauffeur niet gevonden of buiten uw afdelingsbereik" },
          { status: 403 }
        );
      }
    }

    const resolvedScenarioId = resolveScenarioId(scenarioId);

    // FK validations are independent — run concurrently to save one round trip on Neon.
    const [scenarioError, fkError] = await Promise.all([
      validateOptionalForeignKey(resolvedScenarioId, prisma.scenario, "scenario"),
      validateOptionalForeignKey(leaveTypeId, prisma.leaveType, "verloftype"),
    ]);
    if (scenarioError) {
      return NextResponse.json({ error: scenarioError }, { status: 400 });
    }
    if (fkError) {
      return NextResponse.json({ error: fkError }, { status: 400 });
    }

    const entryData = {
      status,
      leaveTypeId: leaveTypeId || null,
      sickPercentage: sickPercentage ?? null,
      notes: notes || null,
    };

    // Use transaction with findFirst+update/create to handle nullable scenarioId.
    // The DB-level unique index prevents duplicates even under concurrent requests.
    const entry = await prisma.$transaction(async (tx) => {
      const existing = await tx.planningEntry.findFirst({
        where: { driverId, date, scenarioId: resolvedScenarioId },
      });

      if (existing) {
        return tx.planningEntry.update({
          where: { id: existing.id },
          data: entryData,
        });
      }

      return tx.planningEntry.create({
        data: { driverId, date, scenarioId: resolvedScenarioId, ...entryData },
      });
    });

    return NextResponse.json(transformPlanningEntry(entry));
  } catch (error) {
    console.error("Error creating planning entry:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan planningsitem niet aanmaken" },
      { status: 500 }
    );
  }
  }
);
