import { prisma } from "../prisma";
import { afasClient } from "./client";
import { AFAS_CONNECTORS } from "./connectors";
import type { AfasEmployee, AfasLeave, AfasAbsence, AfasRoster } from "@/types/afas";
import { eachDayOfInterval, parseISO } from "date-fns";

export async function syncEmployees(): Promise<number> {
  const employees = await afasClient.getConnector<AfasEmployee>(
    AFAS_CONNECTORS.EMPLOYEES
  );

  let count = 0;
  for (const emp of employees) {
    await prisma.driver.upsert({
      where: { afasEmployeeId: emp.EmId },
      update: {
        employeeNumber: emp.CdNr,
        firstName: emp.VoNm,
        lastName: emp.AcNm,
        isActive: !emp.UtDt,
      },
      create: {
        afasEmployeeId: emp.EmId,
        employeeNumber: emp.CdNr,
        firstName: emp.VoNm,
        lastName: emp.AcNm,
        type: "INTERNAL",
        isActive: !emp.UtDt,
      },
    });
    count++;
  }
  return count;
}

export async function syncBaseRosters(): Promise<number> {
  const rosters = await afasClient.getConnector<AfasRoster>(
    AFAS_CONNECTORS.ROSTER
  );

  let count = 0;
  for (const roster of rosters) {
    const driver = await prisma.driver.findUnique({
      where: { afasEmployeeId: roster.EmId },
    });
    if (!driver) continue;

    await prisma.baseRoster.upsert({
      where: {
        driverId_dayOfWeek_validFrom: {
          driverId: driver.id,
          dayOfWeek: roster.DgNr,
          validFrom: new Date(roster.InDt),
        },
      },
      update: {
        startTime: roster.BgTd,
        endTime: roster.EdTd,
        isWorkDay: roster.WkDg,
        afasSynced: true,
      },
      create: {
        driverId: driver.id,
        dayOfWeek: roster.DgNr,
        startTime: roster.BgTd,
        endTime: roster.EdTd,
        isWorkDay: roster.WkDg,
        validFrom: new Date(roster.InDt),
        afasSynced: true,
      },
    });
    count++;
  }
  return count;
}

export async function syncLeaveAndAbsence(): Promise<number> {
  const [leaves, absences] = await Promise.all([
    afasClient.getConnector<AfasLeave>(AFAS_CONNECTORS.LEAVE),
    afasClient.getConnector<AfasAbsence>(AFAS_CONNECTORS.ABSENCE),
  ]);

  let count = 0;

  for (const leave of leaves) {
    const driver = await prisma.driver.findUnique({
      where: { afasEmployeeId: leave.EmId },
    });
    if (!driver) continue;

    const days = eachDayOfInterval({
      start: parseISO(leave.BgDt),
      end: parseISO(leave.EdDt),
    });

    for (const day of days) {
      await prisma.planningEntry.upsert({
        where: {
          driverId_date: { driverId: driver.id, date: day },
        },
        update: { status: "LEAVE", sourceAfas: true },
        create: {
          driverId: driver.id,
          date: day,
          status: "LEAVE",
          sourceAfas: true,
        },
      });
      count++;
    }
  }

  for (const absence of absences) {
    const driver = await prisma.driver.findUnique({
      where: { afasEmployeeId: absence.EmId },
    });
    if (!driver) continue;

    const days = eachDayOfInterval({
      start: parseISO(absence.BgDt),
      end: parseISO(absence.EdDt),
    });

    for (const day of days) {
      await prisma.planningEntry.upsert({
        where: {
          driverId_date: { driverId: driver.id, date: day },
        },
        update: { status: "SICK", sourceAfas: true },
        create: {
          driverId: driver.id,
          date: day,
          status: "SICK",
          sourceAfas: true,
        },
      });
      count++;
    }
  }

  return count;
}

export async function runFullSync() {
  const log = await prisma.afasSyncLog.create({
    data: { connector: "ALL", status: "PENDING" },
  });

  try {
    const empCount = await syncEmployees();
    const rosterCount = await syncBaseRosters();
    const leaveCount = await syncLeaveAndAbsence();

    await prisma.afasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        recordCount: empCount + rosterCount + leaveCount,
        completedAt: new Date(),
      },
    });

    return { empCount, rosterCount, leaveCount };
  } catch (error) {
    await prisma.afasSyncLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMsg: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
