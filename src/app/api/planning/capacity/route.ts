import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning/capacity",
  async (request: NextRequest) => {
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

      // Use groupBy to aggregate in the database instead of fetching all rows
      const grouped = await prisma.planningEntry.groupBy({
        by: ["date", "status"],
        where: {
          date: { in: dateList },
          scenarioId: resolvedScenarioId,
        },
        _count: { _all: true },
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

      for (const group of grouped) {
        if (capacity[group.date]) {
          capacity[group.date][group.status] = group._count._all;
        }
      }

      return NextResponse.json(capacity);
    } catch (error) {
      console.error("Error fetching capacity:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Failed to fetch capacity" },
        { status: 500 }
      );
    }
  }
);
