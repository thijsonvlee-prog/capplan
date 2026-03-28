import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await request.json();

    const record = await prisma.driverRosterAssignment.update({
      where: { id: recordId },
      data: {
        startDate: body.startDate,
        endDate: body.endDate ?? undefined,
        rosterProfileId: body.rosterProfileId,
        weeklyHours: body.weeklyHours ?? undefined,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating roster assignment:", error);
    return NextResponse.json(
      { error: "Failed to update roster assignment" },
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

    await prisma.driverRosterAssignment.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roster assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete roster assignment" },
      { status: 500 }
    );
  }
}
