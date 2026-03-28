import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { transformDriver, driverInclude } from "@/lib/api-route-utils";

export const GET = withPerfLogging(
  "GET /api/drivers",
  async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const drivers = await prisma.driver.findMany({
      where,
      include: driverInclude,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json(drivers.map(transformDriver));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
  }
);

export const POST = withPerfLogging(
  "POST /api/drivers",
  async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      employeeNumber,
      licenseTypes,
      skillIds,
      employmentRecords,
      functionRecords,
      rosterAssignments,
    } = body;

    const driver = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        employeeNumber: employeeNumber || null,
        licenseTypes: licenseTypes || [],
        skills: skillIds?.length
          ? {
              create: skillIds.map((skillId: string) => ({ skillId })),
            }
          : undefined,
        employmentRecords: employmentRecords?.length
          ? {
              create: employmentRecords.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                employmentType: r.employmentType,
                employerId: r.employerId || null,
              })),
            }
          : undefined,
        functionRecords: functionRecords?.length
          ? {
              create: functionRecords.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                position: r.position,
                locationId: r.locationId || null,
                departmentId: r.departmentId || null,
                manager: r.manager || null,
              })),
            }
          : undefined,
        rosterAssignments: rosterAssignments?.length
          ? {
              create: rosterAssignments.map((r: any, i: number) => ({
                sequenceNumber: i + 1,
                startDate: r.startDate,
                endDate: r.endDate || null,
                rosterProfileId: r.rosterProfileId,
                weeklyHours: r.weeklyHours ?? null,
              })),
            }
          : undefined,
      },
      include: driverInclude,
    });

    return NextResponse.json(transformDriver(driver), { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error);
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
  }
);
