"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { PlanningStatus, PlanningEntry, Driver } from "@prisma/client";
import { WeekSelector } from "./WeekSelector";
import { DayCell } from "./DayCell";
import { StatusBadge } from "./StatusBadge";
import { getCurrentWeek, DAY_LABELS } from "@/lib/utils";

type DriverWithEntries = Driver & { planningEntries: PlanningEntry[] };
type GridData = {
  drivers: DriverWithEntries[];
  weekDates: string[];
  year: number;
  week: number;
};

export function PlanningGrid() {
  const { data: session } = useSession();
  const [data, setData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(0);
  const [week, setWeek] = useState(0);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const current = getCurrentWeek();
    setYear(current.year);
    setWeek(current.week);
  }, []);

  const fetchData = useCallback(async () => {
    if (!year || !week) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/planning?week=${week}&year=${year}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch planning data:", err);
    } finally {
      setLoading(false);
    }
  }, [year, week]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpdate(
    driverId: string,
    date: string,
    status: PlanningStatus,
    notes?: string
  ) {
    // Optimistic update
    if (data) {
      setData({
        ...data,
        drivers: data.drivers.map((d) => {
          if (d.id !== driverId) return d;
          const existing = d.planningEntries.find(
            (e) => e.date.toString().startsWith(date)
          );
          if (existing) {
            return {
              ...d,
              planningEntries: d.planningEntries.map((e) =>
                e.id === existing.id ? { ...e, status, notes: notes || e.notes } : e
              ),
            };
          }
          return {
            ...d,
            planningEntries: [
              ...d.planningEntries,
              {
                id: "temp-" + Date.now(),
                driverId,
                date: new Date(date),
                status,
                notes: notes || null,
                startTime: null,
                endTime: null,
                plannedHours: null,
                isOverride: true,
                sourceAfas: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          };
        }),
      });
    }

    try {
      await fetch("/api/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, date, status, notes, isOverride: true }),
      });
    } catch {
      // Rollback on error
      fetchData();
    }
  }

  function handleWeekChange(newYear: number, newWeek: number) {
    setYear(newYear);
    setWeek(newWeek);
  }

  const readonly = session?.user.role === "VIEWER";

  const filteredDrivers =
    data?.drivers.filter(
      (d) =>
        !filter ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <WeekSelector year={year} week={week} onChange={handleWeekChange} />
        <input
          type="text"
          placeholder="Zoek chauffeur..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64"
        />
      </div>

      <div className="mb-3 flex gap-2 flex-wrap">
        {(["ROSTER_FREE", "BASE_ROSTER", "AVAILABLE_EXTRA", "LEAVE", "SICK", "HIRED"] as PlanningStatus[]).map(
          (s) => (
            <StatusBadge key={s} status={s} />
          )
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Laden...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200 font-semibold text-sm min-w-[200px]">
                  Chauffeur
                </th>
                {data?.weekDates.map((date, i) => (
                  <th
                    key={date}
                    className="p-2 border border-gray-200 text-center text-sm font-medium min-w-[80px]"
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {date.split("-").slice(1).join("/")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50/50">
                  <td className="p-2 border border-gray-200">
                    <div className="font-medium text-sm">
                      {driver.firstName} {driver.lastName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {driver.type === "INTERNAL"
                        ? driver.employeeNumber || "Intern"
                        : driver.type === "CHARTER"
                          ? `Charter: ${driver.companyName || ""}`
                          : "Uitzendkracht"}
                    </div>
                  </td>
                  {data?.weekDates.map((date) => {
                    const entry = driver.planningEntries.find((e) =>
                      e.date.toString().startsWith(date)
                    );
                    return (
                      <DayCell
                        key={date}
                        entry={entry}
                        driverId={driver.id}
                        date={date}
                        onUpdate={handleUpdate}
                        readonly={readonly}
                      />
                    );
                  })}
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    Geen chauffeurs gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
