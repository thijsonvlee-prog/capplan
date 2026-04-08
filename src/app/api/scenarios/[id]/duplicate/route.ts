import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { requireRole, parseJsonBody, validateMaxLength } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export const POST = withPerfLogging(
  "POST /api/scenarios/duplicate",
  async (
    request: NextRequest,
    context?: any
  ) => {
    try {
      const authError = await requireRole("PLANNER");
      if (authError) return authError;

      const { id: sourceId } = await context.params;
      const parsed = await parseJsonBody(request);
      if (parsed.error) return parsed.error;
      const body = parsed.data;
      const { name } = body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Naam is verplicht" },
          { status: 400 }
        );
      }

      const lengthError = validateMaxLength(name, 200, "Naam");
      if (lengthError) {
        return NextResponse.json({ error: lengthError }, { status: 400 });
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

      // Create the new scenario first
      const newScenario = await prisma.scenario.create({
        data: {
          name: name.trim(),
        },
      });

      try {
        // Copy planning entries in chunks to keep memory usage constant
        const CHUNK_SIZE = 5000;
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const sourceEntries = await prisma.planningEntry.findMany({
            where: { scenarioId: sourceScenarioFilter },
            skip: offset,
            take: CHUNK_SIZE,
            select: {
              driverId: true,
              date: true,
              status: true,
              leaveTypeId: true,
              sickPercentage: true,
              notes: true,
            },
          });

          if (sourceEntries.length > 0) {
            await prisma.planningEntry.createMany({
              data: sourceEntries.map((entry) => ({
                ...entry,
                scenarioId: newScenario.id,
              })),
            });
          }

          hasMore = sourceEntries.length === CHUNK_SIZE;
          offset += CHUNK_SIZE;
        }
      } catch (copyError) {
        // Clean up the partially created scenario (cascade deletes its entries)
        await prisma.scenario.delete({ where: { id: newScenario.id } }).catch(() => {});
        throw copyError;
      }

      const userId = await getAuditUserId();
      logAudit("Scenario", newScenario.id, "CREATE", null, { name: name.trim(), duplicatedFrom: sourceId }, userId);

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
