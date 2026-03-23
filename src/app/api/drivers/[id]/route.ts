import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { driverSchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: { baseRosters: true },
  });

  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(driver);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = driverSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const old = await prisma.driver.findUnique({ where: { id: params.id } });
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const driver = await prisma.driver.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Driver",
    entityId: driver.id,
    oldValue: old,
    newValue: driver,
  });

  return NextResponse.json(driver);
}
