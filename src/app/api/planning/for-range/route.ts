import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, transformDriver, transformPlanningEntry } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning/for-range",
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

      if (dateList.length > 90) {
        return NextResponse.json(
          { error: "Maximaal 90 datums per verzoek" },
          { status: 400 }
        );
      }

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Pagination parameters (optional — if not provided, return all)
      const pageParam = searchParams.get("page");
      const pageSizeParam = searchParams.get("pageSize");
      const isPaginated = pageParam !== null || pageSizeParam !== null;
      const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      const pageSize = Math.min(500, Math.max(1, parseInt(pageSizeParam || "100", 10) || 100));

      const driverIncludeFields = {
        skills: { select: { skillId: true } },
        employmentRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, employmentType: true, employerId: true } },
        functionRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, position: true, locationId: true, departmentId: true, manager: true } },
        rosterAssignments: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, rosterProfileId: true, weeklyHours: true } },
      };

      // Fetch drivers (with pagination if requested) and count in parallel
      const [drivers, total] = await Promise.all([
        prisma.driver.findMany({
          include: driverIncludeFields,
          orderBy: { lastName: "asc" },
          ...(isPaginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
        }),
        isPaginated ? prisma.driver.count() : Promise.resolve(0),
      ]);

      // Get driver IDs for scoping planning entries query
      const driverIds = drivers.map((d) => d.id);

      // Get planning entries for the given dates, scenario, and driver scope
      const entries = await prisma.planningEntry.findMany({
        where: {
          date: { in: dateList },
          scenarioId: resolvedScenarioId,
          ...(isPaginated ? { driverId: { in: driverIds } } : {}),
        },
      });

      // Group entries by driverId
      const entriesByDriver: Record<string, ReturnType<typeof transformPlanningEntry>[]> = {};
      for (const entry of entries) {
        if (!entriesByDriver[entry.driverId]) {
          entriesByDriver[entry.driverId] = [];
        }
        entriesByDriver[entry.driverId].push(transformPlanningEntry(entry));
      }

      // Join drivers with their planning entries
      const driversWithEntries = drivers.map((driver) => ({
        ...transformDriver(driver),
        planningEntries: entriesByDriver[driver.id] || [],
      }));

      const response: Record<string, unknown> = {
        drivers: driversWithEntries,
        dates: dateList,
      };

      if (isPaginated) {
        response.total = total;
        response.page = page;
        response.pageSize = pageSize;
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error("Error fetching planning for range:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Kan planningsgegevens niet ophalen" },
        { status: 500 }
      );
    }
  }
);
