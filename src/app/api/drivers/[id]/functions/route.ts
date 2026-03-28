import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const openRecords = await prisma.driverFunctionRecord.findMany({
      where: { driverId: id, endDate: null },
    });

    if (openRecords.length > 0) {
      const dayBefore = new Date(startDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const endDateStr = dayBefore.toISOString().split("T")[0];

      await Promise.all(
        openRecords.map((r) =>
          prisma.driverFunctionRecord.update({
            where: { id: r.id },
            data: { endDate: endDateStr },
          })
        )
      );
    }

    // Get next sequence number
    const maxSeq = await prisma.driverFunctionRecord.aggregate({
      where: { driverId: id },
      _max: { sequenceNumber: true },
    });
    const nextSeq = (maxSeq._max.sequenceNumber || 0) + 1;

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
