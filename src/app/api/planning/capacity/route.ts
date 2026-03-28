import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function resolveScenarioId(scenarioId?: string | null): string | null {
  if (!scenarioId || scenarioId === "default" || scenarioId === "") return null;
  return scenarioId;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dates = searchParams.get("dates");
    const scenarioId = searchParams.get("scenarioId");

    if (!dates) {
      return NextResponse.json(
        { error: "dates parameter is required" },
        { status: 400 }
      );
    }

    const dateList = dates.split(",").map((d) => d.trim());
    const resolvedScenarioId = resolveScenarioId(scenarioId);

    const entries = await prisma.planningEntry.findMany({
      where: {
        date: { in: dateList },
        scenarioId: resolvedScenarioId,
      },
    });

    const capacity: Record<string, Record<string, number>> = {};

    for (const date of dateList) {
      capacity[date] = {
        ROSTER_FREE: 0,
        BASE_ROSTER: 0,
        AVAILABLE_EXTRA: 0,
        LEAVE: 0,
        SICK: 0,
      };
    }

    for (const entry of entries) {
      if (capacity[entry.date]) {
        capacity[entry.date][entry.status] =
          (capacity[entry.date][entry.status] || 0) + 1;
      }
    }

    return NextResponse.json(capacity);
  } catch (error) {
    console.error("Error fetching capacity:", error);
    return NextResponse.json(
      { error: "Failed to fetch capacity" },
      { status: 500 }
    );
  }
}
