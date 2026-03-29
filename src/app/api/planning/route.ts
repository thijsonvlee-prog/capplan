import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, transformPlanningEntry } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning",
  async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");
    const dates = searchParams.get("dates");
    const driverId = searchParams.get("driverId");

    const where: any = {};

    const resolvedScenarioId = resolveScenarioId(scenarioId);
    if (resolvedScenarioId === null) {
      where.scenarioId = null;
    } else {
      where.scenarioId = resolvedScenarioId;
    }

    if (dates) {
      const dateList = dates.split(",").map((d) => d.trim());
      where.date = { in: dateList };
    }

    if (driverId) {
      where.driverId = driverId;
    }

    const entries = await prisma.planningEntry.findMany({ where });

    return NextResponse.json(entries.map(transformPlanningEntry));
  } catch (error) {
    console.error("Error fetching planning entries:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch planning entries" },
      { status: 500 }
    );
  }
  }
);

export const POST = withPerfLogging(
  "POST /api/planning",
  async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { driverId, date, status, leaveTypeId, sickPercentage, notes, scenarioId } = body;

    if (!driverId || !date || !status) {
      return NextResponse.json(
        { error: "driverId, date, and status are required" },
        { status: 400 }
      );
    }

    const resolvedScenarioId = resolveScenarioId(scenarioId);

    // Find existing entry for same driverId+date+scenarioId
    const existing = await prisma.planningEntry.findFirst({
      where: {
        driverId,
        date,
        scenarioId: resolvedScenarioId,
      },
    });

    let entry;
    if (existing) {
      entry = await prisma.planningEntry.update({
        where: { id: existing.id },
        data: {
          status,
          leaveTypeId: leaveTypeId || null,
          sickPercentage: sickPercentage ?? null,
          notes: notes || null,
        },
      });
    } else {
      entry = await prisma.planningEntry.create({
        data: {
          driverId,
          date,
          status,
          leaveTypeId: leaveTypeId || null,
          sickPercentage: sickPercentage ?? null,
          notes: notes || null,
          scenarioId: resolvedScenarioId,
        },
      });
    }

    return NextResponse.json(transformPlanningEntry(entry));
  } catch (error) {
    console.error("Error creating planning entry:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create planning entry" },
      { status: 500 }
    );
  }
  }
);
