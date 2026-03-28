import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params;
    const body = await request.json();
    const { name } = body;

    // Create the new scenario
    const newScenario = await prisma.scenario.create({
      data: {
        name,
      },
    });

    // Determine source scenarioId filter
    const isDefault = sourceId === "default";
    const sourceScenarioFilter = isDefault ? null : sourceId;

    // Copy all planning entries from source to new scenario
    const sourceEntries = await prisma.planningEntry.findMany({
      where: {
        scenarioId: sourceScenarioFilter,
      },
    });

    if (sourceEntries.length > 0) {
      await prisma.planningEntry.createMany({
        data: sourceEntries.map((entry) => ({
          driverId: entry.driverId,
          date: entry.date,
          status: entry.status,
          leaveTypeId: entry.leaveTypeId,
          sickPercentage: entry.sickPercentage,
          notes: entry.notes,
          scenarioId: newScenario.id,
        })),
      });
    }

    return NextResponse.json(newScenario, { status: 201 });
  } catch (error) {
    console.error("Error duplicating scenario:", error);
    return NextResponse.json(
      { error: "Failed to duplicate scenario" },
      { status: 500 }
    );
  }
}
