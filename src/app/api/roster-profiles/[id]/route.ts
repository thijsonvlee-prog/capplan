import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformProfile, validateRequired, requireRole, parseJsonBody } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.rosterProfile.findUnique({
      where: { id },
      include: { days: { orderBy: { dayOffset: "asc" } } },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Roosterprofiel niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformProfile(profile));
  } catch (error) {
    console.error("Error fetching roster profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roosterprofiel niet ophalen" },
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
    const { name, entries } = body;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (typeof name === "string" && name.length > 200) {
      return NextResponse.json({ error: "Naam mag maximaal 200 tekens bevatten" }, { status: 400 });
    }

    const profile = await prisma.$transaction(async (tx) => {
      // Update profile name
      await tx.rosterProfile.update({
        where: { id },
        data: { name },
      });

      // Replace all days
      if (entries !== undefined) {
        await tx.rosterProfileDay.deleteMany({
          where: { rosterProfileId: id },
        });

        if (entries.length > 0) {
          await tx.rosterProfileDay.createMany({
            data: entries.map((e: any) => ({
              rosterProfileId: id,
              dayOffset: e.dayOffset,
              status: e.status,
            })),
          });
        }
      }

      return tx.rosterProfile.findUnique({
        where: { id },
        include: { days: { orderBy: { dayOffset: "asc" } } },
      });
    });

    return NextResponse.json(transformProfile(profile));
  } catch (error) {
    console.error("Error updating roster profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roosterprofiel niet bijwerken" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    await prisma.rosterProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Roosterprofiel niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting roster profile:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roosterprofiel niet verwijderen" },
      { status: 500 }
    );
  }
}
