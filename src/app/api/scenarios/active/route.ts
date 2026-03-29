import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = "default";
const PREFERENCE_KEY = "activeScenario";

export async function GET() {
  try {
    const pref = await prisma.userPreference.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        key: PREFERENCE_KEY,
      },
    });

    return NextResponse.json({ activeId: pref?.value || "default" });
  } catch (error) {
    console.error("Error fetching active scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch active scenario" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { activeId } = body;

    if (activeId === "default") {
      await prisma.userPreference.deleteMany({
        where: {
          userId: DEFAULT_USER_ID,
          key: PREFERENCE_KEY,
        },
      });
    } else {
      await prisma.userPreference.upsert({
        where: {
          userId_key: {
            userId: DEFAULT_USER_ID,
            key: PREFERENCE_KEY,
          },
        },
        update: { value: activeId },
        create: {
          userId: DEFAULT_USER_ID,
          key: PREFERENCE_KEY,
          value: activeId,
        },
      });
    }

    return NextResponse.json({ activeId });
  } catch (error) {
    console.error("Error setting active scenario:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to set active scenario" },
      { status: 500 }
    );
  }
}
