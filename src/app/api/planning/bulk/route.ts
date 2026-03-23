import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bulkUpdateSchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const results = await prisma.$transaction(
    parsed.data.entries.map((entry) =>
      prisma.planningEntry.upsert({
        where: {
          driverId_date: {
            driverId: entry.driverId,
            date: new Date(entry.date),
          },
        },
        update: {
          status: entry.status,
          startTime: entry.startTime,
          endTime: entry.endTime,
          plannedHours: entry.plannedHours,
          notes: entry.notes,
          isOverride: true,
        },
        create: {
          driverId: entry.driverId,
          date: new Date(entry.date),
          status: entry.status,
          startTime: entry.startTime,
          endTime: entry.endTime,
          plannedHours: entry.plannedHours,
          notes: entry.notes,
          isOverride: true,
        },
      })
    )
  );

  for (const entry of results) {
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "PlanningEntry",
      entityId: entry.id,
      newValue: entry,
    });
  }

  return NextResponse.json({ count: results.length });
}
