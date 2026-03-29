import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId } from "@/lib/api-route-utils";

export const POST = withPerfLogging(
  "POST /api/planning/bulk",
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { driverId, dates, status, leaveTypeId, sickPercentage, notes, scenarioId } = body;

      if (!driverId || !Array.isArray(dates) || dates.length === 0 || !status) {
        return NextResponse.json(
          { error: "driverId, datums (niet-lege lijst) en status zijn verplicht" },
          { status: 400 }
        );
      }

      if (dates.length > 366) {
        return NextResponse.json(
          { error: "Maximaal 366 datums per bulkbewerking" },
          { status: 400 }
        );
      }

      const resolvedScenarioId = resolveScenarioId(scenarioId);

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
