import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.planningEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting planning entry:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan planningsitem niet verwijderen" },
      { status: 500 }
    );
  }
}
