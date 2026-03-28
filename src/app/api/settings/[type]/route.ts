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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const model = getModel(type);

    if (!model) {
      return NextResponse.json(
        { error: `Unknown settings type: ${type}` },
        { status: 400 }
      );
    }

    const records = await model.findMany({
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const model = getModel(type);

    if (!model) {
      return NextResponse.json(
        { error: `Unknown settings type: ${type}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code, description } = body;

    const record = await model.create({
      data: { code, description },
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating settings record:", error);
    return NextResponse.json(
      { error: "Failed to create settings record" },
      { status: 500 }
    );
  }
}
