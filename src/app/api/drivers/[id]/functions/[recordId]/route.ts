import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await request.json();

    const record = await prisma.driverFunctionRecord.update({
      where: { id: recordId },
      data: {
        startDate: body.startDate,
        endDate: body.endDate ?? undefined,
        position: body.position,
        locationId: body.locationId ?? undefined,
        departmentId: body.departmentId ?? undefined,
        manager: body.manager ?? undefined,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating function record:", error);
    return NextResponse.json(
      { error: "Failed to update function record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;

    await prisma.driverFunctionRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting function record:", error);
    return NextResponse.json(
      { error: "Failed to delete function record" },
      { status: 500 }
    );
  }
}
