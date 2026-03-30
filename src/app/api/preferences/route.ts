import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateRequired, parseJsonBody } from "@/lib/api-route-utils";

/**
 * Resolve the userId from the session. When auth is not configured
 * (no NEXTAUTH_SECRET), falls back to "default" for backward compatibility.
 * Returns null if auth is configured but the user is not logged in.
 */
async function resolveUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  if (!process.env.NEXTAUTH_SECRET) {
    return { userId: "default" };
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Niet ingelogd. Log in om voorkeuren te beheren." },
        { status: 401 }
      ),
    };
  }
  return { userId: session.user.id };
}

export async function GET(request: NextRequest) {
  try {
    const resolved = await resolveUserId();
    if ("error" in resolved) return resolved.error;
    const { userId } = resolved;

    const { searchParams } = new URL(request.url);
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
    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const validationError = validateRequired(body, [
      { field: "key", label: "Sleutel" },
      { field: "value", label: "Waarde" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { key, value } = body;

    const resolved = await resolveUserId();
    if ("error" in resolved) return resolved.error;
    const { userId } = resolved;

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
    const resolved = await resolveUserId();
    if ("error" in resolved) return resolved.error;
    const { userId } = resolved;

    const { searchParams } = new URL(request.url);
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
