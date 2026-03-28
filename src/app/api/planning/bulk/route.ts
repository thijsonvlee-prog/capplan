import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function resolveScenarioId(scenarioId?: string | null): string | null {
  if (!scenarioId || scenarioId === "default" || scenarioId === "") return null;
  return scenarioId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, dates, status, leaveTypeId, sickPercentage, notes, scenarioId } = body;

    const resolvedScenarioId = resolveScenarioId(scenarioId);

    for (const date of dates) {
      const existing = await prisma.planningEntry.findFirst({
        where: {
          driverId,
          date,
          scenarioId: resolvedScenarioId,
        },
      });

      if (existing) {
        await prisma.planningEntry.update({
          where: { id: existing.id },
          data: {
            status,
            leaveTypeId: leaveTypeId || null,
            sickPercentage: sickPercentage ?? null,
            notes: notes || null,
          },
        });
      } else {
        await prisma.planningEntry.create({
          data: {
            driverId,
            date,
            status,
            leaveTypeId: leaveTypeId || null,
            sickPercentage: sickPercentage ?? null,
            notes: notes || null,
            scenarioId: resolvedScenarioId,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error bulk creating planning entries:", error);
    return NextResponse.json(
      { error: "Failed to bulk create planning entries" },
      { status: 500 }
    );
  }
}
