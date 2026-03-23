import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updatePlanningEntrySchema } from "@/lib/validators/planning";
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
  const parsed = updatePlanningEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const old = await prisma.planningEntry.findUnique({ where: { id: params.id } });
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entry = await prisma.planningEntry.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      isOverride: true,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "PlanningEntry",
    entityId: entry.id,
    oldValue: old,
    newValue: entry,
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const old = await prisma.planningEntry.findUnique({ where: { id: params.id } });
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.planningEntry.delete({ where: { id: params.id } });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "PlanningEntry",
    entityId: params.id,
    oldValue: old,
  });

  return NextResponse.json({ success: true });
}
