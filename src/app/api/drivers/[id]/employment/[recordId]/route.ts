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
    const existing = await prisma.driverEmploymentRecord.findFirst({
      where: { id: recordId, driverId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = await prisma.driverEmploymentRecord.update({
      where: { id: recordId },
      data: {
        startDate: body.startDate,
        endDate: body.endDate ?? undefined,
        employmentType: body.employmentType,
        employerId: body.employerId ?? undefined,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating employment record:", error);
    return NextResponse.json(
      { error: "Failed to update employment record" },
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
    const existing = await prisma.driverEmploymentRecord.findFirst({
      where: { id: recordId, driverId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.driverEmploymentRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employment record:", error);
    return NextResponse.json(
      { error: "Failed to delete employment record" },
      { status: 500 }
    );
  }
}
