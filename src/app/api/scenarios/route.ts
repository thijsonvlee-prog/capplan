import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateMaxLengths, requireRole, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export async function GET() {
  try {
    const authError = await requireRole("VIEWER");
    if (authError) return authError;

    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan scenario's niet ophalen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { name, description } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
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

    const scenario = await prisma.scenario.create({
      data: {
        name,
        description: description || null,
      },
    });

    const userId = await getAuditUserId();
    logAudit("Scenario", scenario.id, "CREATE", null, { name, description: description || null }, userId);

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error("Error creating scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan scenario niet aanmaken" },
      { status: 500 }
    );
  }
}
