import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { afasClient } from "@/lib/afas/client";
import { runFullSync } from "@/lib/afas/sync";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!afasClient.isConfigured()) {
    return NextResponse.json(
      { error: "AFAS is not configured. Set AFAS_ENVIRONMENT and AFAS_TOKEN." },
      { status: 400 }
    );
  }

  try {
    const result = await runFullSync();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
