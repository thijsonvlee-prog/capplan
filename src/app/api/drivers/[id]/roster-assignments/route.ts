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

      await Promise.all(
        openRecords.map((r) =>
          prisma.driverRosterAssignment.update({
            where: { id: r.id },
            data: { endDate: endDateStr },
          })
        )
      );
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

      for (let i = 0; i < 364; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const dayOffset = i % 28;
        const status = patternMap[dayOffset] || "ROSTER_FREE";

        // Check if there's an existing LEAVE or SICK entry
        const existing = await prisma.planningEntry.findFirst({
          where: {
            driverId,
            date: dateStr,
            scenarioId: resolvedScenarioId,
            status: { in: ["LEAVE", "SICK"] },
          },
        });

        if (existing) continue;

        // Upsert the planning entry
        const existingEntry = await prisma.planningEntry.findFirst({
          where: {
            driverId,
            date: dateStr,
            scenarioId: resolvedScenarioId,
          },
        });

        if (existingEntry) {
          await prisma.planningEntry.update({
            where: { id: existingEntry.id },
            data: { status },
          });
        } else {
          await prisma.planningEntry.create({
            data: {
              driverId,
              date: dateStr,
              status,
              scenarioId: resolvedScenarioId,
            },
          });
        }
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
