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
