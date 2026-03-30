import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformDriver, driverInclude, validateForeignKeys, requireRole, parseJsonBody } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: driverInclude,
    });

    if (!driver) {
      return NextResponse.json({ error: "Chauffeur niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(transformDriver(driver));
  } catch (error) {
    console.error("Error fetching driver:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan chauffeur niet ophalen" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { skillIds, ...driverData } = body;

    const updateData: any = {};
    if (driverData.firstName !== undefined)
      updateData.firstName = driverData.firstName;
    if (driverData.lastName !== undefined)
      updateData.lastName = driverData.lastName;
    if (driverData.employeeNumber !== undefined)
      updateData.employeeNumber = driverData.employeeNumber || null;
    if (driverData.licenseTypes !== undefined)
      updateData.licenseTypes = driverData.licenseTypes;

    if (skillIds !== undefined && Array.isArray(skillIds) && skillIds.length > 0) {
      const fkError = await validateForeignKeys([
        { ids: skillIds, model: prisma.skill, label: "competenties" },
      ]);
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }
    }

    const driver = await prisma.$transaction(async (tx) => {
      if (skillIds !== undefined) {
        await tx.driverSkill.deleteMany({ where: { driverId: id } });
        if (skillIds.length > 0) {
          await tx.driverSkill.createMany({
            data: skillIds.map((skillId: string) => ({ driverId: id, skillId })),
          });
        }
      }

      return tx.driver.update({
        where: { id },
        data: updateData,
        include: driverInclude,
      });
    });

    return NextResponse.json(transformDriver(driver));
  } catch (error) {
    console.error("Error updating driver:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan chauffeur niet bijwerken" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("PLANNER");
    if (authError) return authError;

    const { id } = await params;

    await prisma.driver.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting driver:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan chauffeur niet verwijderen" },
      { status: 500 }
    );
  }
}
