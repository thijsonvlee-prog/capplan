import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hoursImportSchema } from "@/lib/validators/hours";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = hoursImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (const row of parsed.data.rows) {
    let driverId = row.driverId;

    if (!driverId && row.employeeNumber) {
      const driver = await prisma.driver.findFirst({
        where: { employeeNumber: row.employeeNumber },
      });
      if (!driver) {
        results.errors.push(`Driver not found: ${row.employeeNumber}`);
        results.skipped++;
        continue;
      }
      driverId = driver.id;
    }

    if (!driverId) {
      results.skipped++;
      continue;
    }

    const total =
      (row.monday || 0) +
      (row.tuesday || 0) +
      (row.wednesday || 0) +
      (row.thursday || 0) +
      (row.friday || 0) +
      (row.saturday || 0) +
      (row.sunday || 0);

    const entry = await prisma.realizedHours.upsert({
      where: {
        driverId_year_weekNumber: {
          driverId,
          year: row.year,
          weekNumber: row.weekNumber,
        },
      },
      update: {
        monday: row.monday,
        tuesday: row.tuesday,
        wednesday: row.wednesday,
        thursday: row.thursday,
        friday: row.friday,
        saturday: row.saturday,
        sunday: row.sunday,
        totalHours: total,
        source: "API",
      },
      create: {
        driverId,
        year: row.year,
        weekNumber: row.weekNumber,
        monday: row.monday,
        tuesday: row.tuesday,
        wednesday: row.wednesday,
        thursday: row.thursday,
        friday: row.friday,
        saturday: row.saturday,
        sunday: row.sunday,
        totalHours: total,
        source: "API",
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entityType: "RealizedHours",
      entityId: entry.id,
      newValue: entry,
    });

    results.imported++;
  }

  return NextResponse.json(results);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const week = parseInt(searchParams.get("week") || "0");
  const year = parseInt(searchParams.get("year") || "0");

  if (!week || !year) {
    return NextResponse.json({ error: "week and year required" }, { status: 400 });
  }

  const hours = await prisma.realizedHours.findMany({
    where: { year, weekNumber: week },
    include: { driver: true },
  });

  return NextResponse.json(hours);
}
