import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateMaxLengths, requireRole, validateFieldMappings, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";
import { VALID_TARGET_ENTITIES, VALID_SOURCE_TYPES, validateApiFields } from "@/lib/api-import-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

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
    const { name, type, targetEntity, fieldMappings, description, apiUrl, apiMethod, apiHeaders, apiAuthType, apiCredentials } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
      { field: "targetEntity", label: "Doelentiteit" },
      { field: "fieldMappings", label: "Veldkoppelingen" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const lengthError = validateMaxLengths([
      { value: name, maxLength: 200, label: "Naam" },
      { value: description, maxLength: 500, label: "Omschrijving" },
    ]);
    if (lengthError) {
      return NextResponse.json({ error: lengthError }, { status: 400 });
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

    // Determine source type: use provided type, fall back to existing
    const sourceType = type || existing.type;
    if (!VALID_SOURCE_TYPES.includes(sourceType)) {
      return NextResponse.json(
        { error: `Ongeldig brontype. Kies uit: ${VALID_SOURCE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate API-specific fields when type is API
    if (sourceType === "API") {
      const apiError = validateApiFields(body);
      if (apiError) {
        return NextResponse.json({ error: apiError }, { status: 400 });
      }
    }

    const source = await prisma.importSource.update({
      where: { id },
      data: {
        name,
        type: sourceType,
        targetEntity,
        fieldMappings,
        description: description || null,
        // Set API fields when type is API, clear them when type is CSV
        apiUrl: sourceType === "API" ? apiUrl : null,
        apiMethod: sourceType === "API" ? (apiMethod || "GET") : null,
        apiHeaders: sourceType === "API" ? (apiHeaders || null) : null,
        apiAuthType: sourceType === "API" ? (apiAuthType || "NONE") : null,
        apiCredentials: sourceType === "API" ? (apiCredentials || null) : null,
      },
    });

    const userId = await getAuditUserId();
    logAudit("ImportSource", id, "UPDATE", { name: existing.name, type: existing.type, targetEntity: existing.targetEntity, description: existing.description }, { name, type: sourceType, targetEntity, description: description || null }, userId);

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
