import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateOptionalForeignKey, validateDateFormat, validateDateRange, requireRole, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";
import { EmploymentType } from "@/domain/enums";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const { id, recordId } = await params;
    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const validationError = validateRequired(body, [
      { field: "startDate", label: "Startdatum" },
      { field: "employmentType", label: "Type dienstverband" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const validEmploymentTypes = Object.values(EmploymentType);
    if (!validEmploymentTypes.includes(body.employmentType)) {
      return NextResponse.json(
        { error: `Ongeldig type dienstverband. Geldige waarden: ${validEmploymentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const startDateError = validateDateFormat(String(body.startDate));
    if (startDateError) {
      return NextResponse.json({ error: startDateError }, { status: 400 });
    }
    if (body.endDate) {
      const endDateError = validateDateFormat(String(body.endDate));
      if (endDateError) {
        return NextResponse.json({ error: endDateError }, { status: 400 });
      }
    }

    const dateRangeError = validateDateRange(body.startDate, body.endDate);
    if (dateRangeError) {
      return NextResponse.json({ error: dateRangeError }, { status: 400 });
    }

    if (body.employerId !== undefined) {
      const fkError = await validateOptionalForeignKey(body.employerId, prisma.employer, "werkgever");
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }
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

    const userId = await getAuditUserId();
    logAudit("DriverEmploymentRecord", recordId, "UPDATE", null, { startDate: body.startDate, endDate: body.endDate, employmentType: body.employmentType, employerId: body.employerId }, userId);

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
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

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

    const userId = await getAuditUserId();
    logAudit("DriverEmploymentRecord", recordId, "DELETE", existing, null, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employment record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan dienstverbandrecord niet verwijderen" },
      { status: 500 }
    );
  }
}
