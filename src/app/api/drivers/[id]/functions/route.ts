import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoCloseOpenRecords, getNextSequenceNumber } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const records = await prisma.driverFunctionRecord.findMany({
      where: { driverId: id },
      orderBy: { sequenceNumber: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching function records:", error);
    return NextResponse.json(
      { error: "Failed to fetch function records" },
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
    const { startDate, endDate, position, locationId, departmentId, manager } =
      body;

    // Auto-close open-ended records
    await autoCloseOpenRecords(prisma.driverFunctionRecord, id, startDate);

    // Get next sequence number
    const nextSeq = await getNextSequenceNumber(prisma.driverFunctionRecord, id);

    const record = await prisma.driverFunctionRecord.create({
      data: {
        driverId: id,
        sequenceNumber: nextSeq,
        startDate,
        endDate: endDate || null,
        position,
        locationId: locationId || null,
        departmentId: departmentId || null,
        manager: manager || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating function record:", error);
    return NextResponse.json(
      { error: "Failed to create function record" },
      { status: 500 }
    );
  }
}
