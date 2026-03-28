import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformProfile } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const profiles = await prisma.rosterProfile.findMany({
      include: { days: { orderBy: { dayOffset: "asc" } } },
    });

    return NextResponse.json(profiles.map(transformProfile));
  } catch (error) {
    console.error("Error fetching roster profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roster profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, entries } = body;

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
    console.error("Error creating roster profile:", error);
    return NextResponse.json(
      { error: "Failed to create roster profile" },
      { status: 500 }
    );
  }
}
