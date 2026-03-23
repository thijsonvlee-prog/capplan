import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { driverSchema } from "@/lib/validators/planning";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hires = await prisma.driver.findMany({
    where: { type: { in: ["CHARTER", "TEMPORARY"] } },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(hires);
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

  if (!["CHARTER", "TEMPORARY"].includes(parsed.data.type)) {
    return NextResponse.json(
      { error: "Type must be CHARTER or TEMPORARY" },
      { status: 400 }
    );
  }

  const hire = await prisma.driver.create({ data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Driver",
    entityId: hire.id,
    newValue: hire,
  });

  return NextResponse.json(hire, { status: 201 });
}
