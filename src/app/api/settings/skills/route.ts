import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      select: { id: true, name: true },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan competenties niet ophalen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const skill = await prisma.skill.create({
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan competentie niet aanmaken" },
      { status: 500 }
    );
  }
}
