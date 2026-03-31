import { NextRequest, NextResponse } from "next/server";
import { getSettingsModel, validateRequired, requireRole, parseJsonBody } from "@/lib/api-route-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { type, id } = await params;
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Onbekend instellingentype" },
        { status: 400 }
      );
    }

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { code, description } = body;

    const validationError = validateRequired(body, [
      { field: "code", label: "Code" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const record = await model.update({
      where: { id },
      data: { code, description },
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Instellingenrecord niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error updating settings record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan instellingenrecord niet bijwerken" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { type, id } = await params;
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Onbekend instellingentype" },
        { status: 400 }
      );
    }

    await model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Instellingenrecord niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting settings record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan instellingenrecord niet verwijderen" },
      { status: 500 }
    );
  }
}
