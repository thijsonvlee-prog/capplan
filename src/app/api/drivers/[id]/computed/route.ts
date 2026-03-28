import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const employmentTypeLabels: Record<string, string> = {
  FULLTIME: "Fulltime",
  PARTTIME: "Parttime",
  ONCALL: "Oproepkracht",
  TEMPORARY: "Uitzendkracht",
  CHARTER: "Charter",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find active employment record (no endDate)
    const activeEmployment = await prisma.driverEmploymentRecord.findFirst({
      where: { driverId: id, endDate: null },
      include: { employer: true },
    });

    // Find active function record (no endDate)
    const activeFunction = await prisma.driverFunctionRecord.findFirst({
      where: { driverId: id, endDate: null },
      include: { location: true, department: true },
    });

    // Find active roster assignment (no endDate)
    const activeRoster = await prisma.driverRosterAssignment.findFirst({
      where: { driverId: id, endDate: null },
      include: { rosterProfile: true },
    });

    return NextResponse.json({
      currentEmployer: activeEmployment?.employer?.description || null,
      currentEmploymentType: activeEmployment
        ? employmentTypeLabels[activeEmployment.employmentType] ||
          activeEmployment.employmentType
        : null,
      currentPosition: activeFunction?.position || null,
      currentDepartment: activeFunction?.department?.description || null,
      currentLocation: activeFunction?.location?.description || null,
      currentManager: activeFunction?.manager || null,
      currentRosterProfile: activeRoster?.rosterProfile?.name || null,
      currentWeeklyHours: activeRoster?.weeklyHours ?? null,
    });
  } catch (error) {
    console.error("Error fetching computed driver data:", error);
    return NextResponse.json(
      { error: "Failed to fetch computed driver data" },
      { status: 500 }
    );
  }
}
