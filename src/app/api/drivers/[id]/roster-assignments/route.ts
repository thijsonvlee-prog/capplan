import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPerfLogging } from "@/lib/perf";
import { resolveScenarioId, autoCloseOpenRecords, getNextSequenceNumber, validateRequired, validateOptionalForeignKey, validateDateFormat, validateDateRange, requireRole, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

export const GET = withPerfLogging(
  "GET /api/drivers/[id]/roster-assignments",
  async (
    request: NextRequest,
    context?: any
  ) => {
    try {
      const authError = await requireRole("VIEWER");
      if (authError) return authError;

      const { id } = await context.params;
      const records = await prisma.driverRosterAssignment.findMany({
        where: { driverId: id },
        include: { rosterProfile: { select: { name: true } } },
        orderBy: { sequenceNumber: "asc" },
      });

      const result = records.map((r) => ({
        ...r,
        profileName: r.rosterProfile.name,
        rosterProfile: undefined,
      }));

      return NextResponse.json(result);
    } catch (error) {
      console.error("Error fetching roster assignments:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Kan roostertoewijzingen niet ophalen" },
        { status: 500 }
      );
    }
  }
);

export const POST = withPerfLogging(
  "POST /api/drivers/[id]/roster-assignments",
  async (
    request: NextRequest,
    context?: any
  ) => {
    try {
      const authError = await requireRole("PLANNER");
      if (authError) return authError;

      const { id: driverId } = await context.params;
      const parsed = await parseJsonBody(request);
      if (parsed.error) return parsed.error;
      const body = parsed.data;
      const { startDate, endDate, rosterProfileId, weeklyHours, scenarioId } =
        body;

      const validationError = validateRequired(body, [
        { field: "startDate", label: "Startdatum" },
        { field: "rosterProfileId", label: "Roosterprofiel" },
      ]);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
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

      if (weeklyHours != null && (weeklyHours < 0 || weeklyHours > 168)) {
        return NextResponse.json(
          { error: "Wekelijkse uren moet tussen 0 en 168 liggen" },
          { status: 400 }
        );
      }

      const fkError = await validateOptionalForeignKey(rosterProfileId, prisma.rosterProfile, "roosterprofiel");
      if (fkError) {
        return NextResponse.json({ error: fkError }, { status: 400 });
      }

      const record = await prisma.$transaction(async (tx) => {
        // Auto-close open-ended records + get next sequence number (independent reads)
        const [, nextSeq] = await Promise.all([
          autoCloseOpenRecords(tx.driverRosterAssignment, driverId, startDate),
          getNextSequenceNumber(tx.driverRosterAssignment, driverId),
        ]);

        const created = await tx.driverRosterAssignment.create({
          data: {
            driverId,
            sequenceNumber: nextSeq,
            startDate,
            endDate: endDate || null,
            rosterProfileId,
            weeklyHours: weeklyHours ?? null,
          },
        });

        // Generate 364 days of planning entries based on roster profile pattern
        const rosterProfile = await tx.rosterProfile.findUnique({
          where: { id: rosterProfileId },
          include: { days: true },
        });

        if (rosterProfile) {
          const resolvedScenarioId = resolveScenarioId(scenarioId);

          // Build a map of dayOffset -> status
          const patternMap: Record<number, string> = {};
          for (const day of rosterProfile.days) {
            patternMap[day.dayOffset] = day.status;
          }

          const start = new Date(startDate);

          // Generate all date strings upfront
          const allDates: string[] = [];
          const statusByDate: Record<string, string> = {};
          for (let i = 0; i < 364; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            const dateStr = currentDate.toISOString().split("T")[0];
            allDates.push(dateStr);
            statusByDate[dateStr] = patternMap[i % 28] || "ROSTER_FREE";
          }

          // Batch: fetch all existing entries for this driver+scenario in one query
          const existingEntries = await tx.planningEntry.findMany({
            where: {
              driverId,
              date: { in: allDates },
              scenarioId: resolvedScenarioId,
            },
            select: { id: true, date: true, status: true },
          });

          const existingByDate = new Map(
            existingEntries.map((e) => [e.date, e])
          );

          // Separate into: skip (LEAVE/SICK), update, create
          const toUpdate: { id: string; status: string }[] = [];
          const toCreate: { driverId: string; date: string; status: string; scenarioId: string | null }[] = [];

          for (const dateStr of allDates) {
            const existing = existingByDate.get(dateStr);
            if (existing && (existing.status === "LEAVE" || existing.status === "SICK")) {
              continue; // Preserve leave/sick entries
            }
            if (existing) {
              if (existing.status !== statusByDate[dateStr]) {
                toUpdate.push({ id: existing.id, status: statusByDate[dateStr] });
              }
            } else {
              toCreate.push({
                driverId,
                date: dateStr,
                status: statusByDate[dateStr],
                scenarioId: resolvedScenarioId,
              });
            }
          }

          // Batch create new entries
          if (toCreate.length > 0) {
            await tx.planningEntry.createMany({ data: toCreate });
          }

          // Batch update existing entries (grouped by status to minimize queries)
          const updatesByStatus: Record<string, string[]> = {};
          for (const u of toUpdate) {
            if (!updatesByStatus[u.status]) updatesByStatus[u.status] = [];
            updatesByStatus[u.status].push(u.id);
          }
          for (const status of Object.keys(updatesByStatus)) {
            await tx.planningEntry.updateMany({
              where: { id: { in: updatesByStatus[status] } },
              data: { status },
            });
          }
        }

        return created;
      });

      const userId = await getAuditUserId();
      logAudit("DriverRosterAssignment", record.id, "CREATE", null, { driverId, startDate, endDate: endDate || null, rosterProfileId, weeklyHours: weeklyHours ?? null }, userId);

      return NextResponse.json(record, { status: 201 });
    } catch (error) {
      console.error("Error creating roster assignment:", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json(
        { error: "Kan roostertoewijzing niet aanmaken" },
        { status: 500 }
      );
    }
  }
);
