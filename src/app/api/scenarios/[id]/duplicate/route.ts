import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";

export const POST = withPerfLogging(
  "POST /api/scenarios/duplicate",
  async (
    request: NextRequest,
    context?: any
  ) => {
    try {
      const { id: sourceId } = await context.params;
      const body = await request.json();
      const { name } = body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "name is required" },
          { status: 400 }
        );
      }

      // Determine source scenarioId filter
      const isDefault = sourceId === "default";
      const sourceScenarioFilter = isDefault ? null : sourceId;

      // Check source entry count before duplicating to prevent excessive data generation
      const sourceCount = await prisma.planningEntry.count({
        where: { scenarioId: sourceScenarioFilter },
      });

      if (sourceCount > 50000) {
        return NextResponse.json(
          { error: "Source scenario has too many entries to duplicate" },
          { status: 400 }
        );
      }

      // Create the new scenario
      const newScenario = await prisma.scenario.create({
        data: {
          name: name.trim(),
        },
      });

      // Copy all planning entries from source to new scenario
      const sourceEntries = await prisma.planningEntry.findMany({
        where: {
          scenarioId: sourceScenarioFilter,
        },
      });

      if (sourceEntries.length > 0) {
        await prisma.planningEntry.createMany({
          data: sourceEntries.map((entry: any) => ({
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
);
