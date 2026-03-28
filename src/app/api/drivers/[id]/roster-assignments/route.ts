import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function resolveScenarioId(scenarioId?: string | null): string | null {
  if (!scenarioId || scenarioId === "default" || scenarioId === "") return null;
  return scenarioId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const records = await prisma.driverRosterAssignment.findMany({
      where: { driverId: id },
      include: { rosterProfile: { select: { name: true } } },
      orderBy: { sequenceNumber: "asc" },
    });

    const result = records.map((r) => ({
      ...r,
      profileName: r.rosterProfile.name,
      rosterProfile: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching roster assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch roster assignments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;
    const body = await request.json();
    const { startDate, endDate, rosterProfileId, weeklyHours, scenarioId } =
      body;

    // Auto-close open-ended records
    const openRecords = await prisma.driverRosterAssignment.findMany({
      where: { driverId, endDate: null },
    });

    if (openRecords.length > 0) {
      const dayBefore = new Date(startDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const endDateStr = dayBefore.toISOString().split("T")[0];

      await prisma.driverRosterAssignment.updateMany({
        where: { driverId, endDate: null },
        data: { endDate: endDateStr },
      });
    }

    // Get next sequence number
    const maxSeq = await prisma.driverRosterAssignment.aggregate({
      where: { driverId },
      _max: { sequenceNumber: true },
    });
    const nextSeq = (maxSeq._max.sequenceNumber || 0) + 1;

    const record = await prisma.driverRosterAssignment.create({
      data: {
        driverId,
        sequenceNumber: nextSeq,
        startDate,
        endDate: endDate || null,
        rosterProfileId,
        weeklyHours: weeklyHours ?? null,
      },
    });

    // Generate 364 days of planning entries based on roster profile pattern
    const rosterProfile = await prisma.rosterProfile.findUnique({
      where: { id: rosterProfileId },
      include: { days: true },
    });

    if (rosterProfile) {
      const resolvedScenarioId = resolveScenarioId(scenarioId);

      // Build a map of dayOffset -> status
      const patternMap: Record<number, string> = {};
      for (const day of rosterProfile.days) {
        patternMap[day.dayOffset] = day.status;
      }

      const start = new Date(startDate);

      // Generate all date strings upfront
      const allDates: string[] = [];
      const statusByDate: Record<string, string> = {};
      for (let i = 0; i < 364; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];
        allDates.push(dateStr);
        statusByDate[dateStr] = patternMap[i % 28] || "ROSTER_FREE";
      }

      // Batch: fetch all existing entries for this driver+scenario in one query
      const existingEntries = await prisma.planningEntry.findMany({
        where: {
          driverId,
          date: { in: allDates },
          scenarioId: resolvedScenarioId,
        },
        select: { id: true, date: true, status: true },
      });

      const existingByDate = new Map(
        existingEntries.map((e) => [e.date, e])
      );

      // Separate into: skip (LEAVE/SICK), update, create
      const toUpdate: { id: string; status: string }[] = [];
      const toCreate: { driverId: string; date: string; status: string; scenarioId: string | null }[] = [];

      for (const dateStr of allDates) {
        const existing = existingByDate.get(dateStr);
        if (existing && (existing.status === "LEAVE" || existing.status === "SICK")) {
          continue; // Preserve leave/sick entries
        }
        if (existing) {
          if (existing.status !== statusByDate[dateStr]) {
            toUpdate.push({ id: existing.id, status: statusByDate[dateStr] });
          }
        } else {
          toCreate.push({
            driverId,
            date: dateStr,
            status: statusByDate[dateStr],
            scenarioId: resolvedScenarioId,
          });
        }
      }

      // Batch create new entries
      if (toCreate.length > 0) {
        await prisma.planningEntry.createMany({ data: toCreate });
      }

      // Batch update existing entries (grouped by status to minimize queries)
      const updatesByStatus: Record<string, string[]> = {};
      for (const u of toUpdate) {
        if (!updatesByStatus[u.status]) updatesByStatus[u.status] = [];
        updatesByStatus[u.status].push(u.id);
      }
      for (const status of Object.keys(updatesByStatus)) {
        await prisma.planningEntry.updateMany({
          where: { id: { in: updatesByStatus[status] } },
          data: { status },
        });
      }
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating roster assignment:", error);
    return NextResponse.json(
      { error: "Failed to create roster assignment" },
      { status: 500 }
    );
  }
}
