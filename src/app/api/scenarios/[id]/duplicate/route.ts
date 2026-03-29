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
          { error: "Naam is verplicht" },
          { status: 400 }
        );
      }

      // Determine source scenarioId filter
      const isDefault = sourceId === "default";
      const sourceScenarioFilter = isDefault ? null : sourceId;

      // Verify the source scenario exists (skip for default which has no DB record)
      if (!isDefault) {
        const sourceScenario = await prisma.scenario.findUnique({
          where: { id: sourceId },
        });
        if (!sourceScenario) {
          return NextResponse.json(
            { error: "Bronscenario niet gevonden" },
            { status: 404 }
          );
        }
      }

      // Check source entry count before duplicating to prevent excessive data generation
      const sourceCount = await prisma.planningEntry.count({
        where: { scenarioId: sourceScenarioFilter },
      });

      if (sourceCount > 50000) {
        return NextResponse.json(
          { error: "Bronscenario heeft te veel items om te dupliceren" },
          { status: 400 }
        );
      }

      const newScenario = await prisma.$transaction(async (tx) => {
        // Create the new scenario
        const created = await tx.scenario.create({
          data: {
            name: name.trim(),
          },
        });

        // Copy all planning entries from source to new scenario
        const sourceEntries = await tx.planningEntry.findMany({
          where: {
            scenarioId: sourceScenarioFilter,
          },
        });

        if (sourceEntries.length > 0) {
          await tx.planningEntry.createMany({
            data: sourceEntries.map((entry: any) => ({
              driverId: entry.driverId,
              date: entry.date,
              status: entry.status,
              leaveTypeId: entry.leaveTypeId,
              sickPercentage: entry.sickPercentage,
              notes: entry.notes,
              scenarioId: created.id,
            })),
          });
        }

        return created;
      });

      return NextResponse.json(newScenario, { status: 201 });
    } catch (error) {
      console.error("Error duplicating scenario:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Kan scenario niet dupliceren" },
        { status: 500 }
      );
    }
  }
);
