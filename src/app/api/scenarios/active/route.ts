import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

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
      { error: "Kan actief scenario niet ophalen" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateRequired(body, [
      { field: "activeId", label: "Actief scenario" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

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
      { error: "Kan actief scenario niet instellen" },
      { status: 500 }
    );
  }
}
