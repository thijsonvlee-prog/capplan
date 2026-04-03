import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, transformDriver, transformPlanningEntry, parseDateList, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";

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

      const parsed = parseDateList(dates, 90);
      if ("error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      const { dateList } = parsed;

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Pagination parameters (optional — if not provided, return all)
      const pageParam = searchParams.get("page");
      const pageSizeParam = searchParams.get("pageSize");
      const search = searchParams.get("search")?.trim() || "";
      const isPaginated = pageParam !== null || pageSizeParam !== null;
      const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      const pageSize = Math.min(500, Math.max(1, parseInt(pageSizeParam || "100", 10) || 100));

      const driverIncludeFields = {
        skills: { select: { skillId: true } },
        employmentRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, employmentType: true, employerId: true } },
        functionRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, position: true, locationId: true, departmentId: true, manager: true } },
        rosterAssignments: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, rosterProfileId: true, weeklyHours: true } },
      };

      // Build driver where clause for search and user group filtering
      const driverWhere: any = {};

      // Apply user group department filter
      const allowedDepts = await getAllowedDepartmentIds();
      if (allowedDepts !== null) {
        Object.assign(driverWhere, driverDepartmentFilter(allowedDepts));
      }

      if (search) {
        driverWhere.OR = [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { employeeNumber: { contains: search, mode: "insensitive" as const } },
        ];
      }

      // Fetch drivers (with pagination if requested) and count in parallel
      const [drivers, total] = await Promise.all([
        prisma.driver.findMany({
          where: driverWhere,
          include: driverIncludeFields,
          orderBy: { lastName: "asc" },
          ...(isPaginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
        }),
        isPaginated ? prisma.driver.count({ where: driverWhere }) : Promise.resolve(0),
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
