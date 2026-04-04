import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoCloseOpenRecords, getNextSequenceNumber, validateRequired, validateOptionalForeignKey, validateDateFormat, requireRole, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";
import { EmploymentType } from "@/domain/enums";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("VIEWER");
    if (authError) return authError;

    const { id } = await params;
    const records = await prisma.driverEmploymentRecord.findMany({
      where: { driverId: id },
      orderBy: { sequenceNumber: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching employment records:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan dienstverbandrecords niet ophalen" },
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
    const { startDate, endDate, employmentType, employerId } = body;

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "employmentType", label: "Type dienstverband" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const validEmploymentTypes = Object.values(EmploymentType);
    if (!validEmploymentTypes.includes(employmentType)) {
      return NextResponse.json(
        { error: `Ongeldig type dienstverband. Geldige waarden: ${validEmploymentTypes.join(", ")}` },
        { status: 400 }
      );
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

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
    }

    const fkError = await validateOptionalForeignKey(employerId, prisma.employer, "werkgever");
    if (fkError) {
      return NextResponse.json({ error: fkError }, { status: 400 });
    }

    const record = await prisma.$transaction(async (tx) => {
      // Auto-close open-ended records
      await autoCloseOpenRecords(tx.driverEmploymentRecord, id, startDate);

      // Get next sequence number
      const nextSeq = await getNextSequenceNumber(tx.driverEmploymentRecord, id);

      return tx.driverEmploymentRecord.create({
        data: {
          driverId: id,
          sequenceNumber: nextSeq,
          startDate,
          endDate: endDate || null,
          employmentType,
          employerId: employerId || null,
        },
      });
    });

    const userId = await getAuditUserId();
    logAudit("DriverEmploymentRecord", record.id, "CREATE", null, { driverId: id, startDate, endDate: endDate || null, employmentType, employerId: employerId || null }, userId);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating employment record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan dienstverbandrecord niet aanmaken" },
      { status: 500 }
    );
  }
}
