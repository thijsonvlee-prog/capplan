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
          { error: "driverId, dates (non-empty array), and status are required" },
          { status: 400 }
        );
      }

      if (dates.length > 366) {
        return NextResponse.json(
          { error: "Maximum 366 dates allowed per bulk operation" },
          { status: 400 }
        );
      }

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Batch: fetch all existing entries in one query
      const existingEntries = await prisma.planningEntry.findMany({
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
            driverId,
            date,
            status,
            leaveTypeId: leaveTypeId || null,
            sickPercentage: sickPercentage ?? null,
            notes: notes || null,
            scenarioId: resolvedScenarioId,
          });
        }
      }

      // Batch update all existing entries at once
      if (updateIds.length > 0) {
        await prisma.planningEntry.updateMany({
          where: { id: { in: updateIds } },
          data: {
            status,
            leaveTypeId: leaveTypeId || null,
            sickPercentage: sickPercentage ?? null,
            notes: notes || null,
          },
        });
      }

      // Batch create all new entries at once
      if (toCreate.length > 0) {
        await prisma.planningEntry.createMany({ data: toCreate });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error bulk creating planning entries:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Failed to bulk create planning entries" },
        { status: 500 }
      );
    }
  }
);
