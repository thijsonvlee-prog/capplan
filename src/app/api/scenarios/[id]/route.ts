import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const { id } = await params;

    const oldScenario = await prisma.scenario.findUnique({
      where: { id },
      select: { name: true, description: true },
    });

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

    const userId = await getAuditUserId();
    logAudit("Scenario", id, "DELETE", oldScenario, null, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Scenario niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan scenario niet verwijderen" },
      { status: 500 }
    );
  }
}
