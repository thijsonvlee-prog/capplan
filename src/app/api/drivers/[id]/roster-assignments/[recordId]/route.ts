import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateOptionalForeignKey, validateDateFormat, validateDateRange, requireRole, parseJsonBody, verifyRecordOwnership } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

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
      { field: "rosterProfileId", label: "Roosterprofiel" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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

    if (body.weeklyHours != null && (body.weeklyHours < 0 || body.weeklyHours > 168)) {
      return NextResponse.json(
        { error: "Wekelijkse uren moet tussen 0 en 168 liggen" },
        { status: 400 }
      );
    }

    if (body.rosterProfileId !== undefined) {
      const fkError = await validateOptionalForeignKey(body.rosterProfileId, prisma.rosterProfile, "roosterprofiel");
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }
    }

    const record = await prisma.$transaction(async (tx) => {
      const existing = await verifyRecordOwnership(tx.driverRosterAssignment, recordId, id);
      if (!existing) return null;

      return tx.driverRosterAssignment.update({
        where: { id: recordId },
        data: {
          startDate: body.startDate,
          endDate: body.endDate ?? undefined,
          rosterProfileId: body.rosterProfileId,
          weeklyHours: body.weeklyHours ?? undefined,
        },
      });
    });

    if (!record) {
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    const userId = await getAuditUserId();
    logAudit("DriverRosterAssignment", recordId, "UPDATE", null, { startDate: body.startDate, endDate: body.endDate, rosterProfileId: body.rosterProfileId, weeklyHours: body.weeklyHours }, userId);

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating roster assignment:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roostertoewijzing niet bijwerken" },
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

    const existing = await verifyRecordOwnership(prisma.driverRosterAssignment, recordId, id);
    if (!existing) {
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    await prisma.driverRosterAssignment.delete({
      where: { id: recordId },
    });

    const userId = await getAuditUserId();
    logAudit("DriverRosterAssignment", recordId, "DELETE", existing, null, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting roster assignment:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan roostertoewijzing niet verwijderen" },
      { status: 500 }
    );
  }
}
