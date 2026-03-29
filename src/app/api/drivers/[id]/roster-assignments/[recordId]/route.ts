import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired } from "@/lib/api-route-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params;
    const body = await request.json();

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "rosterProfileId", label: "Roosterprofiel" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.endDate && body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
    }

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
    console.error("Error updating roster assignment:", error instanceof Error ? error.message : "Unknown error");
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
    console.error("Error deleting roster assignment:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to delete roster assignment" },
      { status: 500 }
    );
  }
}
