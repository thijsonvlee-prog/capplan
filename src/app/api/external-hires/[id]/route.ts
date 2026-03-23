import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { driverSchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";

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

  const hire = await prisma.driver.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Driver",
    entityId: hire.id,
    oldValue: old,
    newValue: hire,
  });

  return NextResponse.json(hire);
}
