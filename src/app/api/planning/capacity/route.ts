import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, validateDateFormats, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning/capacity",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const dates = searchParams.get("dates");
      const scenarioId = searchParams.get("scenarioId");

      if (!dates) {
        return NextResponse.json(
          { error: "Parameter 'dates' is verplicht" },
          { status: 400 }
        );
      }

      const dateList = dates.split(",").map((d) => d.trim()).filter(Boolean);

      if (dateList.length === 0) {
        return NextResponse.json(
          { error: "Minimaal één geldige datum is verplicht" },
          { status: 400 }
        );
      }

      if (dateList.length > 366) {
        return NextResponse.json(
          { error: "Maximaal 366 datums per verzoek" },
          { status: 400 }
        );
      }

      const dateError = validateDateFormats(dateList);
      if (dateError) {
        return NextResponse.json({ error: dateError }, { status: 400 });
      }

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Apply user group department filter using a relation filter (no driver ID pre-fetch)
      const allowedDepts = await getAllowedDepartmentIds();
      const driverFilter = allowedDepts !== null
        ? { driver: driverDepartmentFilter(allowedDepts) }
        : {};

      // Use groupBy to aggregate in the database instead of fetching all rows
      const grouped = await prisma.planningEntry.groupBy({
        by: ["date", "status"],
        where: {
          date: { in: dateList },
          scenarioId: resolvedScenarioId,
          ...driverFilter,
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
        { error: "Kan capaciteitsgegevens niet ophalen" },
        { status: 500 }
      );
    }
  }
);
