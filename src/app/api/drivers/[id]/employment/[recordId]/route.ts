import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { recordId } = await params;
    const body = await request.json();

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
    const { recordId } = await params;

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
