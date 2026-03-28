import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function transformProfile(profile: any) {
  return {
    id: profile.id,
    name: profile.name,
    entries: (profile.days || []).map((d: any) => ({
      dayOffset: d.dayOffset,
      status: d.status,
    })),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

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
        { error: "Roster profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformProfile(profile));
  } catch (error) {
    console.error("Error fetching roster profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch roster profile" },
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
    const { name, entries } = body;

    // Update profile name
    await prisma.rosterProfile.update({
      where: { id },
      data: { name },
    });

    // Replace all days
    if (entries !== undefined) {
      await prisma.rosterProfileDay.deleteMany({
        where: { rosterProfileId: id },
      });

      if (entries.length > 0) {
        await prisma.rosterProfileDay.createMany({
          data: entries.map((e: any) => ({
            rosterProfileId: id,
            dayOffset: e.dayOffset,
            status: e.status,
          })),
        });
      }
    }

    const profile = await prisma.rosterProfile.findUnique({
      where: { id },
      include: { days: { orderBy: { dayOffset: "asc" } } },
    });

    return NextResponse.json(transformProfile(profile));
  } catch (error) {
    console.error("Error updating roster profile:", error);
    return NextResponse.json(
      { error: "Failed to update roster profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.rosterProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roster profile:", error);
    return NextResponse.json(
      { error: "Failed to delete roster profile" },
      { status: 500 }
    );
  }
}
