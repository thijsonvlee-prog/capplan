import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

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
    const { id } = await params;
    const body = await request.json();
    const { name, targetEntity, fieldMappings, description } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
      { field: "targetEntity", label: "Doelentiteit" },
      { field: "fieldMappings", label: "Veldkoppelingen" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (!VALID_TARGET_ENTITIES.includes(targetEntity)) {
      return NextResponse.json(
        { error: `Ongeldige doelentiteit. Kies uit: ${VALID_TARGET_ENTITIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (typeof fieldMappings !== "object" || fieldMappings === null || Array.isArray(fieldMappings)) {
      return NextResponse.json(
        { error: "Veldkoppelingen moeten een object zijn met bronkolom-doelveld paren" },
        { status: 400 }
      );
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
    const { id } = await params;

    const existing = await prisma.importSource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
      );
    }

    await prisma.importSource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting import source:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan importbron niet verwijderen" },
      { status: 500 }
    );
  }
}
