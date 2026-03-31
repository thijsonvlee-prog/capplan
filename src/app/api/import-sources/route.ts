import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, requireRole, validateFieldMappings, parseJsonBody } from "@/lib/api-route-utils";

const VALID_TARGET_ENTITIES = ["drivers", "employers", "departments", "locations"];

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
    const { name, type, targetEntity, fieldMappings, description } = body;

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

    // Only CSV is supported for now
    if (type && type !== "CSV") {
      return NextResponse.json(
        { error: "Alleen CSV-import wordt momenteel ondersteund" },
        { status: 400 }
      );
    }

    const source = await prisma.importSource.create({
      data: {
        name,
        type: type || "CSV",
        targetEntity,
        fieldMappings,
        description: description || null,
      },
    });

    return NextResponse.json({ data: source }, { status: 201 });
  } catch (error) {
    console.error("Error creating import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet aanmaken" },
      { status: 500 }
    );
  }
}
