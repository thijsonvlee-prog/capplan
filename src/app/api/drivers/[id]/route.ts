import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function transformDriver(dbDriver: any) {
  return {
    id: dbDriver.id,
    firstName: dbDriver.firstName,
    lastName: dbDriver.lastName,
    employeeNumber: dbDriver.employeeNumber || undefined,
    licenseTypes: dbDriver.licenseTypes || [],
    skillIds: dbDriver.skills?.map((ds: any) => ds.skillId) || [],
    employmentRecords: dbDriver.employmentRecords || [],
    functionRecords: dbDriver.functionRecords || [],
    rosterAssignments: dbDriver.rosterAssignments || [],
    isActive: dbDriver.isActive,
    createdAt: dbDriver.createdAt.toISOString(),
    updatedAt: dbDriver.updatedAt.toISOString(),
  };
}

const driverInclude = {
  skills: true,
  employmentRecords: true,
  functionRecords: true,
  rosterAssignments: true,
};

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
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(transformDriver(driver));
  } catch (error) {
    console.error("Error fetching driver:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
    if (driverData.isActive !== undefined)
      updateData.isActive = driverData.isActive;

    if (skillIds !== undefined) {
      await prisma.driverSkill.deleteMany({ where: { driverId: id } });
      if (skillIds.length > 0) {
        await prisma.driverSkill.createMany({
          data: skillIds.map((skillId: string) => ({ driverId: id, skillId })),
        });
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: updateData,
      include: driverInclude,
    });

    return NextResponse.json(transformDriver(driver));
  } catch (error) {
    console.error("Error updating driver:", error);
    return NextResponse.json(
      { error: "Failed to update driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.planningEntry.deleteMany({ where: { driverId: id } });
    await prisma.driver.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting driver:", error);
    return NextResponse.json(
      { error: "Failed to delete driver" },
      { status: 500 }
    );
  }
}
