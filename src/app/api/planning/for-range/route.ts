import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, transformDriver } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/planning/for-range",
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

      const dateList = dates.split(",").map((d) => d.trim()).filter(Boolean);

      if (dateList.length === 0) {
        return NextResponse.json(
          { error: "At least one valid date is required" },
          { status: 400 }
        );
      }

      if (dateList.length > 90) {
        return NextResponse.json(
          { error: "Maximum 90 dates allowed per request" },
          { status: 400 }
        );
      }

      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Get all active drivers with only the fields needed for planning grid
      const drivers = await prisma.driver.findMany({
        where: { isActive: true },
        include: {
          skills: { select: { skillId: true } },
          employmentRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, employmentType: true, employerId: true } },
          functionRecords: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, position: true, locationId: true, departmentId: true, manager: true } },
          rosterAssignments: { select: { id: true, sequenceNumber: true, startDate: true, endDate: true, rosterProfileId: true, weeklyHours: true } },
        },
        orderBy: { lastName: "asc" },
      });

      // Get planning entries for the given dates and scenario
      const entries = await prisma.planningEntry.findMany({
        where: {
          date: { in: dateList },
          scenarioId: resolvedScenarioId,
        },
      });

      // Group entries by driverId
      const entriesByDriver: Record<string, any[]> = {};
      for (const entry of entries) {
        if (!entriesByDriver[entry.driverId]) {
          entriesByDriver[entry.driverId] = [];
        }
        entriesByDriver[entry.driverId].push({
          id: entry.id,
          driverId: entry.driverId,
          date: entry.date,
          status: entry.status,
          leaveTypeId: entry.leaveTypeId || undefined,
          sickPercentage: entry.sickPercentage ?? undefined,
          notes: entry.notes || undefined,
          scenarioId: entry.scenarioId || undefined,
        });
      }

      // Join drivers with their planning entries
      const driversWithEntries = drivers.map((driver) => ({
        ...transformDriver(driver),
        planningEntries: entriesByDriver[driver.id] || [],
      }));

      return NextResponse.json({
        drivers: driversWithEntries,
        dates: dateList,
      });
    } catch (error) {
      console.error("Error fetching planning for range:", error);
      return NextResponse.json(
        { error: "Failed to fetch planning for range" },
        { status: 500 }
      );
    }
  }
);
