import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, parseDateList, requireRoleWithSession, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning/capacity",
  async (request: NextRequest) => {
    try {
      const { error: authError, session } = await requireRoleWithSession("VIEWER");
      if (authError) return authError;

      const { searchParams } = new URL(request.url);
      const dates = searchParams.get("dates");
      const scenarioId = searchParams.get("scenarioId");

      if (!dates) {
        return NextResponse.json(
          { error: "Parameter 'dates' is verplicht" },
          { status: 400 }
        );
      }

      const parsed = parseDateList(dates, 366);
      if ("error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      const { dateList } = parsed;

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Apply user group department filter using a relation filter (no driver ID pre-fetch)
      const allowedDepts = await getAllowedDepartmentIds(session);
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
