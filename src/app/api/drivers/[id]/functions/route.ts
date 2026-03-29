import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoCloseOpenRecords, getNextSequenceNumber, validateRequired } from "@/lib/api-route-utils";

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
    console.error("Error fetching function records:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan functierecords niet ophalen" },
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

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "position", label: "Functie" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
    }

    const record = await prisma.$transaction(async (tx) => {
      // Auto-close open-ended records
      await autoCloseOpenRecords(tx.driverFunctionRecord, id, startDate);

      // Get next sequence number
      const nextSeq = await getNextSequenceNumber(tx.driverFunctionRecord, id);

      return tx.driverFunctionRecord.create({
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
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating function record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan functierecord niet aanmaken" },
      { status: 500 }
    );
  }
}
