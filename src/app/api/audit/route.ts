import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const entity = searchParams.get("entity");
  const entityId = searchParams.get("entityId");
  const limit = parseInt(searchParams.get("limit") || "50");

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(entity && { entityType: entity }),
      ...(entityId && { entityId }),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { timestamp: "desc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json(logs);
}
