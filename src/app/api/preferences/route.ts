import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // userId is server-determined; do not accept from client to prevent cross-user access
    const userId = "default";
    const key = searchParams.get("key");

    if (key) {
      const pref = await prisma.userPreference.findFirst({
        where: { userId, key },
      });

      return NextResponse.json(pref ? pref.value : null);
    }

    // Return all preferences for user
    const prefs = await prisma.userPreference.findMany({
      where: { userId },
    });

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Error fetching preferences:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan voorkeuren niet ophalen" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateRequired(body, [
      { field: "key", label: "Sleutel" },
      { field: "value", label: "Waarde" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { key, value } = body;
    // userId is server-determined; do not accept from client to prevent cross-user access
    const userId = "default";

    const pref = await prisma.userPreference.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: { value },
      create: { userId, key, value },
    });

    return NextResponse.json(pref);
  } catch (error) {
    console.error("Error setting preference:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan voorkeur niet instellen" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // userId is server-determined; do not accept from client to prevent cross-user access
    const userId = "default";
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Parameter 'key' is verplicht" },
        { status: 400 }
      );
    }

    await prisma.userPreference.deleteMany({
      where: { userId, key },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preference:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan voorkeur niet verwijderen" },
      { status: 500 }
    );
  }
}
