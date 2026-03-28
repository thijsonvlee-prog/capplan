import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
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
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    const userId = body.userId || "default";

    const pref = await prisma.userPreference.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: { value },
      create: { userId, key, value },
    });

    return NextResponse.json(pref);
  } catch (error) {
    console.error("Error setting preference:", error);
    return NextResponse.json(
      { error: "Failed to set preference" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "key parameter is required" },
        { status: 400 }
      );
    }

    await prisma.userPreference.deleteMany({
      where: { userId, key },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preference:", error);
    return NextResponse.json(
      { error: "Failed to delete preference" },
      { status: 500 }
    );
  }
}
