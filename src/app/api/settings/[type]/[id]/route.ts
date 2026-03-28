import { NextRequest, NextResponse } from "next/server";
import { getSettingsModel } from "@/lib/api-route-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Unknown settings type" },
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
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Unknown settings type" },
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
