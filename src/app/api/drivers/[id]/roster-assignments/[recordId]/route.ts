import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params;
    const body = await request.json();

    // Verify the record belongs to the specified driver
    const existing = await prisma.driverRosterAssignment.findFirst({
      where: { id: recordId, driverId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

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
    const { id, recordId } = await params;

    // Verify the record belongs to the specified driver
    const existing = await prisma.driverRosterAssignment.findFirst({
      where: { id: recordId, driverId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

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
