import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequired, validateOptionalForeignKey, requireRole, parseJsonBody } from "@/lib/api-route-utils";

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
      { field: "position", label: "Functie" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.position && typeof body.position === "string" && body.position.length > 200) {
      return NextResponse.json(
        { error: "Functie mag maximaal 200 tekens bevatten" },
        { status: 400 }
      );
    }

    if (body.manager && typeof body.manager === "string" && body.manager.length > 200) {
      return NextResponse.json(
        { error: "Leidinggevende mag maximaal 200 tekens bevatten" },
        { status: 400 }
      );
    }

    if (body.endDate && body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json({ error: "Einddatum mag niet voor de startdatum liggen" }, { status: 400 });
    }

    const fkChecks = [];
    if (body.locationId !== undefined) {
      fkChecks.push(validateOptionalForeignKey(body.locationId, prisma.location, "locatie"));
    }
    if (body.departmentId !== undefined) {
      fkChecks.push(validateOptionalForeignKey(body.departmentId, prisma.department, "afdeling"));
    }
    if (fkChecks.length > 0) {
      const fkErrors = await Promise.all(fkChecks);
      const fkError = fkErrors.find((e) => e !== null);
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }
    }

    const record = await prisma.$transaction(async (tx) => {
      // Verify the record belongs to the specified driver
      const existing = await tx.driverFunctionRecord.findFirst({
        where: { id: recordId, driverId: id },
      });
      if (!existing) {
        return null;
      }

      return tx.driverFunctionRecord.update({
        where: { id: recordId },
        data: {
          startDate: body.startDate,
          endDate: body.endDate ?? undefined,
          position: body.position,
          locationId: body.locationId ?? undefined,
          departmentId: body.departmentId ?? undefined,
          manager: body.manager ?? undefined,
        },
      });
    });

    if (!record) {
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating function record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan functierecord niet bijwerken" },
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
    const existing = await prisma.driverFunctionRecord.findFirst({
      where: { id: recordId, driverId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Record niet gevonden" }, { status: 404 });
    }

    await prisma.driverFunctionRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting function record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan functierecord niet verwijderen" },
      { status: 500 }
    );
  }
}
