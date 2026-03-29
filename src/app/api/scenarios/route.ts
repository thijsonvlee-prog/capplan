import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const scenario = await prisma.scenario.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error("Error creating scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }
}
