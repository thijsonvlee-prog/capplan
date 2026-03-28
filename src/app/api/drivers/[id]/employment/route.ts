import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Auto-close open-ended records
    const openRecords = await prisma.driverEmploymentRecord.findMany({
      where: { driverId: id, endDate: null },
    });

    if (openRecords.length > 0) {
      const dayBefore = new Date(startDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const endDateStr = dayBefore.toISOString().split("T")[0];

      await Promise.all(
        openRecords.map((r) =>
          prisma.driverEmploymentRecord.update({
            where: { id: r.id },
            data: { endDate: endDateStr },
          })
        )
      );
    }

    // Get next sequence number
    const maxSeq = await prisma.driverEmploymentRecord.aggregate({
      where: { driverId: id },
      _max: { sequenceNumber: true },
    });
    const nextSeq = (maxSeq._max.sequenceNumber || 0) + 1;

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
