import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-route-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.scenario.delete({
        where: { id },
      });

      // If this was the active scenario, reset to default
      const activePref = await tx.userPreference.findFirst({
        where: {
          userId: "default",
          key: "activeScenario",
          value: id,
        },
      });

      if (activePref) {
        await tx.userPreference.delete({
          where: { id: activePref.id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan scenario niet verwijderen" },
      { status: 500 }
    );
  }
}
