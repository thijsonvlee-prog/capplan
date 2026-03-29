import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoCloseOpenRecords, getNextSequenceNumber, validateRequired } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const records = await prisma.driverEmploymentRecord.findMany({
      where: { driverId: id },
      orderBy: { sequenceNumber: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching employment records:", error);
    return NextResponse.json(
      { error: "Failed to fetch employment records" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, employmentType, employerId } = body;

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "employmentType", label: "Type dienstverband" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Auto-close open-ended records
    await autoCloseOpenRecords(prisma.driverEmploymentRecord, id, startDate);

    // Get next sequence number
    const nextSeq = await getNextSequenceNumber(prisma.driverEmploymentRecord, id);

    const record = await prisma.driverEmploymentRecord.create({
      data: {
        driverId: id,
        sequenceNumber: nextSeq,
        startDate,
        endDate: endDate || null,
        employmentType,
        employerId: employerId || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating employment record:", error);
    return NextResponse.json(
      { error: "Failed to create employment record" },
      { status: 500 }
    );
  }
}
