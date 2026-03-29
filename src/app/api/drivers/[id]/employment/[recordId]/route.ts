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
      { field: "employmentType", label: "Type dienstverband" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.endDate && body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
    }

    const record = await prisma.$transaction(async (tx) => {
      // Verify the record belongs to the specified driver
      const existing = await tx.driverEmploymentRecord.findFirst({
        where: { id: recordId, driverId: id },
      });
      if (!existing) {
        return null;
      }

      return tx.driverEmploymentRecord.update({
        where: { id: recordId },
        data: {
          startDate: body.startDate,
          endDate: body.endDate ?? undefined,
          employmentType: body.employmentType,
          employerId: body.employerId ?? undefined,
        },
      });
    });

    if (!record) {
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating employment record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan dienstverbandrecord niet bijwerken" },
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
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    await prisma.driverEmploymentRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employment record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan dienstverbandrecord niet verwijderen" },
      { status: 500 }
    );
  }
}
