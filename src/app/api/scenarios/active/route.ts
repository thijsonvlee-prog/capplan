import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, requireRole, parseJsonBody, resolveUserId } from "@/lib/api-route-utils";

const PREFERENCE_KEY = "activeScenario";

export async function GET() {
  try {
    const resolved = await resolveUserId();
    if ("error" in resolved) return resolved.error;
    const { userId } = resolved;

    const pref = await prisma.userPreference.findFirst({
      where: {
        userId,
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
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const validationError = validateRequired(body, [
      { field: "activeId", label: "Actief scenario" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const resolved = await resolveUserId();
    if ("error" in resolved) return resolved.error;
    const { userId } = resolved;

    const { activeId } = body;

    if (activeId !== "default") {
      const scenarioExists = await prisma.scenario.findUnique({
        where: { id: activeId },
        select: { id: true },
      });
      if (!scenarioExists) {
        return NextResponse.json(
          { error: "Scenario niet gevonden" },
          { status: 404 }
        );
      }
    }

    if (activeId === "default") {
      await prisma.userPreference.deleteMany({
        where: {
          userId,
          key: PREFERENCE_KEY,
        },
      });
    } else {
      await prisma.userPreference.upsert({
        where: {
          userId_key: {
            userId,
            key: PREFERENCE_KEY,
          },
        },
        update: { value: activeId },
        create: {
          userId,
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
