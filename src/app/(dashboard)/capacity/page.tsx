"use client";

import { useState, useEffect } from "react";
import type { ZoomLevel } from "@/lib/store";
import {
  useStore,
  getCapacityForDateRange,
  getScenarios,
  getActiveScenarioId,
} from "@/lib/store";
import { CapacityTable } from "@/components/capacity/CapacityTable";
import { CapacityChart } from "@/components/capacity/CapacityChart";
import { PeriodSelector } from "@/components/planning/WeekSelector";
import { ZoomSelector } from "@/components/planning/ZoomSelector";
import {
  getCurrentWeek,
  DAY_LABELS,
  getWeekDates,
  get4WeekDates,
  getMonthDates,
  getYearMonths,
} from "@/lib/utils";

type ColumnHeader = { key: string; label: string };

function computeCapacityColumns(
  zoom: ZoomLevel,
  year: number,
  week: number,
  month: number
): { dates: string[]; columnHeaders: ColumnHeader[] } {
  if (!year) return { dates: [], columnHeaders: [] };

  switch (zoom) {
    case "week": {
      const weekDates = getWeekDates(year, week).map((d) => d.toISOString().split("T")[0]);
      return {
        dates: weekDates,
        columnHeaders: weekDates.map((date, i) => ({ key: date, label: `${DAY_LABELS[i]} ${date.split("-")[2]}` })),
      };
    }
    case "4weeks": {
      const allDates = get4WeekDates(year, week).map((d) => d.toISOString().split("T")[0]);
      return {
        dates: allDates,
        columnHeaders: allDates.map((date) => ({ key: date, label: date.split("-")[2] })),
      };
    }
    case "month": {
      const allDates = getMonthDates(year, month).map((d) => d.toISOString().split("T")[0]);
      return {
        dates: allDates,
        columnHeaders: allDates.map((date) => ({ key: date, label: date.split("-")[2] })),
      };
    }
    case "year": {
      const months = getYearMonths(year);
      // For year view in capacity, aggregate per month: use first date of month as key
      return {
        dates: months.map((m) => m.startDate),
        columnHeaders: months.map((m) => ({ key: m.startDate, label: m.label })),
      };
    }
  }
}

export default function CapacityPage() {
  const [year, setYear] = useState(0);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [zoom, setZoom] = useState<ZoomLevel>("week");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const current = getCurrentWeek();
    setYear(current.year);
    setWeek(current.week);
    setMonth(new Date().getMonth() + 1);
  }, []);

  const activeId = useStore(() => getActiveScenarioId());
  const scenarios = useStore(() => getScenarios());

  // For year view, get all dates in the year for capacity calculation
  let allDates: string[];
  if (zoom === "year" && year) {
    const months = getYearMonths(year);
    allDates = [];
    for (let m = 1; m <= 12; m++) {
      const monthDates = getMonthDates(year, m).map((d) => d.toISOString().split("T")[0]);
      allDates.push(...monthDates);
    }
  } else {
    const { dates } = computeCapacityColumns(zoom, year, week, month);
    allDates = dates;
  }

  const capacityData = useStore(() =>
    allDates.length > 0 ? getCapacityForDateRange(allDates, activeId) : {}
  );

  // For year view, aggregate daily data into monthly data
  const { columnHeaders } = computeCapacityColumns(zoom, year, week, month);

  let displayData = capacityData;
  if (zoom === "year" && year) {
    displayData = {};
    const months = getYearMonths(year);
    for (let m = 0; m < 12; m++) {
      const monthDates = getMonthDates(year, m + 1).map((d) => d.toISOString().split("T")[0]);
      const agg = { ROSTER_FREE: 0, BASE_ROSTER: 0, AVAILABLE_EXTRA: 0, LEAVE: 0, SICK: 0 } as Record<string, number>;
      for (const date of monthDates) {
        const dayData = capacityData[date];
        if (dayData) {
          for (const [status, count] of Object.entries(dayData)) {
            agg[status] = (agg[status] || 0) + count;
          }
        }
      }
      // Average per day in month
      const days = monthDates.length;
      const key = months[m].startDate;
      displayData[key] = {} as Record<string, number>;
      for (const [status, total] of Object.entries(agg)) {
        (displayData[key] as Record<string, number>)[status] = Math.round(total / days * 10) / 10;
      }
    }
  }

  // Compare scenarios
  const compareData = useStore(() =>
    compareIds
      .filter((id) => id !== activeId)
      .map((id) => {
        const scenario = scenarios.find((s) => s.id === id);
        const data = getCapacityForDateRange(allDates, id);
        return { name: scenario?.name || id, data };
      })
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Capaciteitsoverzicht</h2>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <PeriodSelector
            year={year}
            week={week}
            month={month}
            zoom={zoom}
            onChange={(y, w, m) => { setYear(y); setWeek(w); setMonth(m); }}
          />
          <ZoomSelector value={zoom} onChange={setZoom} />
        </div>

        {scenarios.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Vergelijk:</span>
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleCompare(s.id)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  compareIds.includes(s.id)
                    ? "bg-orange-100 text-orange-700 border-orange-300"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {columnHeaders.length > 0 && (
        <>
          <div className="mb-6">
            <CapacityChart
              capacityData={displayData as Record<string, Record<import("@/lib/store").PlanningStatus, number>>}
              columnHeaders={columnHeaders}
              compareData={compareData.length > 0 ? compareData : undefined}
            />
          </div>

          <CapacityTable
            capacityData={displayData as Record<string, Record<import("@/lib/store").PlanningStatus, number>>}
            columnHeaders={columnHeaders}
          />
        </>
      )}
    </div>
  );
}
