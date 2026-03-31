import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, requireRole, validateFieldMappings, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

const VALID_TARGET_ENTITIES = ["drivers", "employers", "departments", "locations"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const source = await prisma.importSource.findUnique({ where: { id } });

    if (!source) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: source });
  } catch (error) {
    console.error("Error fetching import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet ophalen" },
      { status: 500 }
    );
  }
}

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
    const { name, targetEntity, fieldMappings, description } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
      { field: "targetEntity", label: "Doelentiteit" },
      { field: "fieldMappings", label: "Veldkoppelingen" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (typeof name === "string" && name.length > 200) {
      return NextResponse.json({ error: "Naam mag maximaal 200 tekens bevatten" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 500) {
      return NextResponse.json({ error: "Omschrijving mag maximaal 500 tekens bevatten" }, { status: 400 });
    }

    if (!VALID_TARGET_ENTITIES.includes(targetEntity)) {
      return NextResponse.json(
        { error: `Ongeldige doelentiteit. Kies uit: ${VALID_TARGET_ENTITIES.join(", ")}` },
        { status: 400 }
      );
    }

    const mappingError = validateFieldMappings(fieldMappings, targetEntity);
    if (mappingError) {
      return NextResponse.json({ error: mappingError }, { status: 400 });
    }

    const existing = await prisma.importSource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
      );
    }

    const source = await prisma.importSource.update({
      where: { id },
      data: {
        name,
        targetEntity,
        fieldMappings,
        description: description || null,
      },
    });

    const userId = await getAuditUserId();
    logAudit("ImportSource", id, "UPDATE", { name: existing.name, targetEntity: existing.targetEntity, description: existing.description }, { name, targetEntity, description: description || null }, userId);

    return NextResponse.json({ data: source });
  } catch (error) {
    console.error("Error updating import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet bijwerken" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    const existing = await prisma.importSource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
      );
    }

    await prisma.importSource.delete({ where: { id } });

    const userId = await getAuditUserId();
    logAudit("ImportSource", id, "DELETE", { name: existing.name, targetEntity: existing.targetEntity }, null, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet verwijderen" },
      { status: 500 }
    );
  }
}
