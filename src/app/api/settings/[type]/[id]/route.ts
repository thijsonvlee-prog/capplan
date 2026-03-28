import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const typeModelMap: Record<string, string> = {
  employers: "employer",
  departments: "department",
  locations: "location",
  "leave-types": "leaveType",
};

function getModel(type: string) {
  const modelName = typeModelMap[type];
  if (!modelName) return null;
  return (prisma as any)[modelName];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const model = getModel(type);

    if (!model) {
      return NextResponse.json(
        { error: `Unknown settings type: ${type}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code, description } = body;

    const record = await model.update({
      where: { id },
      data: { code, description },
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating settings record:", error);
    return NextResponse.json(
      { error: "Failed to update settings record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const model = getModel(type);

    if (!model) {
      return NextResponse.json(
        { error: `Unknown settings type: ${type}` },
        { status: 400 }
      );
    }

    await model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting settings record:", error);
    return NextResponse.json(
      { error: "Failed to delete settings record" },
      { status: 500 }
    );
  }
}
