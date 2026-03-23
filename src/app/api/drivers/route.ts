import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { driverSchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const active = searchParams.get("active");
  const search = searchParams.get("search");

  const drivers = await prisma.driver.findMany({
    where: {
      ...(type && { type: type as "INTERNAL" | "CHARTER" | "TEMPORARY" }),
      ...(active !== null && { isActive: active !== "false" }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { employeeNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(drivers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = driverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const driver = await prisma.driver.create({ data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Driver",
    entityId: driver.id,
    newValue: driver,
  });

  return NextResponse.json(driver, { status: 201 });
}
