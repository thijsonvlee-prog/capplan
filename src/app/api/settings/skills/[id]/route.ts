import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, requireRole, parseJsonBody } from "@/lib/api-route-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { name } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Error updating skill:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan competentie niet bijwerken" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    await prisma.skill.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Competentie niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting skill:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan competentie niet verwijderen" },
      { status: 500 }
    );
  }
}
