import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lastSync = await prisma.afasSyncLog.findFirst({
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(lastSync || { status: "NEVER" });
}
