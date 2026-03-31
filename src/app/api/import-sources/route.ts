import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, requireRole, validateFieldMappings, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

const VALID_TARGET_ENTITIES = ["drivers", "employers", "departments", "locations"];
const VALID_SOURCE_TYPES = ["CSV", "API"];
const VALID_API_METHODS = ["GET", "POST"];
const VALID_API_AUTH_TYPES = ["NONE", "BASIC", "BEARER", "API_KEY"];

function validateApiFields(body: Record<string, unknown>): string | null {
  const { apiUrl, apiMethod, apiAuthType, apiHeaders, apiCredentials } = body;

  if (!apiUrl || typeof apiUrl !== "string" || apiUrl.trim() === "") {
    return "API-URL is verplicht voor API-bronnen";
  }
  if (apiUrl.length > 2000) {
    return "API-URL mag maximaal 2000 tekens bevatten";
  }

  if (apiMethod && !VALID_API_METHODS.includes(apiMethod as string)) {
    return `Ongeldige HTTP-methode. Kies uit: ${VALID_API_METHODS.join(", ")}`;
  }

  if (apiAuthType && !VALID_API_AUTH_TYPES.includes(apiAuthType as string)) {
    return `Ongeldig authenticatietype. Kies uit: ${VALID_API_AUTH_TYPES.join(", ")}`;
  }

  if (apiHeaders !== undefined && apiHeaders !== null) {
    if (typeof apiHeaders !== "object" || Array.isArray(apiHeaders)) {
      return "API-headers moeten een object zijn met sleutel-waarde paren";
    }
  }

  if (apiCredentials !== undefined && apiCredentials !== null) {
    if (typeof apiCredentials !== "object" || Array.isArray(apiCredentials)) {
      return "API-credentials moeten een object zijn";
    }
  }

  return null;
}

export async function GET() {
  try {
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
