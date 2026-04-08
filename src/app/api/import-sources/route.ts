import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateMaxLengths, requireRole, validateFieldMappings, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";
import { VALID_TARGET_ENTITIES, VALID_SOURCE_TYPES, validateApiFields } from "@/lib/api-import-helpers";

export async function GET() {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const sources = await prisma.importSource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: sources });
  } catch (error) {
    console.error("Error fetching import sources:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbronnen niet ophalen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

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

    const sourceType = type || "CSV";
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

    const source = await prisma.importSource.create({
      data: {
        name,
        type: sourceType,
        targetEntity,
        fieldMappings,
        description: description || null,
        ...(sourceType === "API" && {
          apiUrl,
          apiMethod: apiMethod || "GET",
          apiHeaders: apiHeaders || null,
          apiAuthType: apiAuthType || "NONE",
          apiCredentials: apiCredentials || null,
        }),
      },
    });

    const userId = await getAuditUserId();
    logAudit("ImportSource", source.id, "CREATE", null, { name, type: sourceType, targetEntity, description: description || null }, userId);

    return NextResponse.json({ data: source }, { status: 201 });
  } catch (error) {
    console.error("Error creating import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet aanmaken" },
      { status: 500 }
    );
  }
}
