import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPlanningEntrySchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";
import { getWeekDates } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const week = parseInt(searchParams.get("week") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  if (!week || !year) {
    return NextResponse.json({ error: "week and year required" }, { status: 400 });
  }

  const weekDates = getWeekDates(year, week);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  const drivers = await prisma.driver.findMany({
    where: { isActive: true },
    include: {
      planningEntries: {
        where: {
          date: { gte: startDate, lte: endDate },
        },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json({
    drivers,
    weekDates: weekDates.map((d) => d.toISOString().split("T")[0]),
    year,
    week,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPlanningEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.planningEntry.upsert({
    where: {
      driverId_date: {
        driverId: parsed.data.driverId,
        date: new Date(parsed.data.date),
      },
    },
    update: {
      status: parsed.data.status,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      plannedHours: parsed.data.plannedHours,
      notes: parsed.data.notes,
      isOverride: parsed.data.isOverride ?? true,
    },
    create: {
      driverId: parsed.data.driverId,
      date: new Date(parsed.data.date),
      status: parsed.data.status,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      plannedHours: parsed.data.plannedHours,
      notes: parsed.data.notes,
      isOverride: parsed.data.isOverride ?? true,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "PlanningEntry",
    entityId: entry.id,
    newValue: entry,
  });

  return NextResponse.json(entry, { status: 201 });
}
