import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, validateOptionalForeignKey, requireRole, parseJsonBody, validateDateFormats, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";
import { PlanningStatus } from "@/domain/enums";

const MAX_NOTES_LENGTH = 500;

const VALID_STATUSES = Object.values(PlanningStatus);

export const POST = withPerfLogging(
  "POST /api/planning/bulk",
  async (request: NextRequest) => {
    try {
      const authError = await requireRole("PLANNER");
      if (authError) return authError;

      const parsed = await parseJsonBody(request);
      if (parsed.error) return parsed.error;
      const body = parsed.data;
      const { driverId, dates, status, leaveTypeId, sickPercentage, notes, scenarioId } = body;

      if (!driverId || !Array.isArray(dates) || dates.length === 0 || !status) {
        return NextResponse.json(
          { error: "driverId, datums (niet-lege lijst) en status zijn verplicht" },
          { status: 400 }
        );
      }

      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Ongeldige status "${status}". Geldige waarden: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }

      if (sickPercentage !== undefined && sickPercentage !== null && (sickPercentage < 0 || sickPercentage > 100)) {
        return NextResponse.json(
          { error: "Ziektepercentage moet tussen 0 en 100 liggen" },
          { status: 400 }
        );
      }

      if (dates.length > 366) {
        return NextResponse.json(
          { error: "Maximaal 366 datums per bulkbewerking" },
          { status: 400 }
        );
      }

      if (notes && typeof notes === "string" && notes.length > MAX_NOTES_LENGTH) {
        return NextResponse.json(
          { error: `Notitie mag maximaal ${MAX_NOTES_LENGTH} tekens bevatten` },
          { status: 400 }
        );
      }

      const dateError = validateDateFormats(dates.map(String));
      if (dateError) {
        return NextResponse.json({ error: dateError }, { status: 400 });
      }

      // Verify the driver is within the user's allowed departments
      const allowedDepts = await getAllowedDepartmentIds();
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

      const fkError = await validateOptionalForeignKey(leaveTypeId, prisma.leaveType, "verloftype");
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }

      const entryData = {
        status,
        leaveTypeId: leaveTypeId || null,
        sickPercentage: sickPercentage ?? null,
        notes: notes || null,
      };

      // Wrap in transaction to prevent TOCTOU race with the unique constraint
      await prisma.$transaction(async (tx) => {
        const existingEntries = await tx.planningEntry.findMany({
          where: {
            driverId,
            date: { in: dates },
            scenarioId: resolvedScenarioId,
          },
          select: { id: true, date: true },
        });

        const existingByDate = new Map(
          existingEntries.map((e) => [e.date, e.id])
        );

        const updateIds: string[] = [];
        const toCreate: { driverId: string; date: string; status: string; leaveTypeId: string | null; sickPercentage: number | null; notes: string | null; scenarioId: string | null }[] = [];

        for (const date of dates) {
          const existingId = existingByDate.get(date);
          if (existingId) {
            updateIds.push(existingId);
          } else {
            toCreate.push({
              driverId, date, scenarioId: resolvedScenarioId, ...entryData,
            });
          }
        }

        if (updateIds.length > 0) {
          await tx.planningEntry.updateMany({
            where: { id: { in: updateIds } },
            data: entryData,
          });
        }

        if (toCreate.length > 0) {
          await tx.planningEntry.createMany({ data: toCreate });
        }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error bulk creating planning entries:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Kan planningsgegevens niet in bulk aanmaken" },
        { status: 500 }
      );
    }
  }
);
