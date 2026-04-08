import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoCloseOpenRecords, getNextSequenceNumber, validateRequired, validateMaxLengths, validateOptionalForeignKey, validateDateFormat, validateDateRange, requireRole, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("VIEWER");
    if (authError) return authError;

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
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { startDate, endDate, position, locationId, departmentId, manager } =
      body;

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "position", label: "Functie" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const lengthError = validateMaxLengths([
      { value: position, maxLength: 200, label: "Functie" },
      { value: manager, maxLength: 200, label: "Leidinggevende" },
    ]);
    if (lengthError) {
      return NextResponse.json({ error: lengthError }, { status: 400 });
    }

    const startDateError = validateDateFormat(String(startDate));
    if (startDateError) {
      return NextResponse.json({ error: startDateError }, { status: 400 });
    }
    if (endDate) {
      const endDateError = validateDateFormat(String(endDate));
      if (endDateError) {
        return NextResponse.json({ error: endDateError }, { status: 400 });
      }
    }

    const dateRangeError = validateDateRange(startDate, endDate);
    if (dateRangeError) {
      return NextResponse.json({ error: dateRangeError }, { status: 400 });
    }

    const fkErrors = await Promise.all([
      validateOptionalForeignKey(locationId, prisma.location, "locatie"),
      validateOptionalForeignKey(departmentId, prisma.department, "afdeling"),
    ]);
    const fkError = fkErrors.find((e) => e !== null);
    if (fkError) {
      return NextResponse.json({ error: fkError }, { status: 400 });
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

    const userId = await getAuditUserId();
    logAudit("DriverFunctionRecord", record.id, "CREATE", null, { driverId: id, startDate, endDate: endDate || null, position, locationId: locationId || null, departmentId: departmentId || null, manager: manager || null }, userId);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating function record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan functierecord niet aanmaken" },
      { status: 500 }
    );
  }
}
