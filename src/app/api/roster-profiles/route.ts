import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformProfile, validateRequired, requireRole, parseJsonBody } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const profiles = await prisma.rosterProfile.findMany({
      include: { days: { orderBy: { dayOffset: "asc" } } },
    });

    return NextResponse.json(profiles.map(transformProfile));
  } catch (error) {
    console.error("Error fetching roster profiles:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roosterprofielen niet ophalen" },
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
    const { name, entries } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const profile = await prisma.rosterProfile.create({
      data: {
        name,
        days: entries?.length
          ? {
              create: entries.map((e: any) => ({
                dayOffset: e.dayOffset,
                status: e.status,
              })),
            }
          : undefined,
      },
      include: { days: { orderBy: { dayOffset: "asc" } } },
    });

    return NextResponse.json(transformProfile(profile), { status: 201 });
  } catch (error) {
    console.error("Error creating roster profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roosterprofiel niet aanmaken" },
      { status: 500 }
    );
  }
}
