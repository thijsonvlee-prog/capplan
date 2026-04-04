import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoleWithSession, getAllowedDepartmentIds, driverDepartmentFilter } from "@/lib/api-route-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requireRoleWithSession("PLANNER");
    if (authError) return authError;

    const { id } = await params;

    // Verify the entry exists and the driver is within scope
    const entry = await prisma.planningEntry.findUnique({
      where: { id },
      select: { driverId: true },
    });
    if (!entry) {
      return NextResponse.json(
        { error: "Planningsitem niet gevonden" },
        { status: 404 }
      );
    }

    const allowedDepts = await getAllowedDepartmentIds(session);
    if (allowedDepts !== null) {
      const driverInScope = await prisma.driver.count({
        where: { id: entry.driverId, ...driverDepartmentFilter(allowedDepts) },
      });
      if (driverInScope === 0) {
        return NextResponse.json(
          { error: "Geen toegang tot deze chauffeur" },
          { status: 403 }
        );
      }
    }

    await prisma.planningEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Planningsitem niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting planning entry:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan planningsitem niet verwijderen" },
      { status: 500 }
    );
  }
}
