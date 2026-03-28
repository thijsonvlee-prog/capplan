"use client";

import { useState, useMemo } from "react";
import type { AggregationLevel } from "@/domain/enums";
import type { PlanningStatus } from "@/domain/enums";
import { useApiData } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { CapacityTable } from "@/components/capacity/CapacityTable";
import { CapacityChart } from "@/components/capacity/CapacityChart";
import { PeriodSelector } from "@/components/planning/WeekSelector";
import { ZoomSelector } from "@/components/planning/ZoomSelector";
import { DAY_LABELS } from "@/domain/constants";
import {
  getDateRange,
  getISOWeekNumber,
} from "@/lib/utils";
import { addDays } from "date-fns";

type ColumnHeader = { key: string; label: string };

const DEFAULT_CAPACITY_DAYS = 56;

export default function CapacityPage() {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return addDays(today, mondayOffset).toISOString().split("T")[0];
  });
  const [dayCount] = useState(DEFAULT_CAPACITY_DAYS);
  const [aggregation, setAggregation] = useState<AggregationLevel>("week");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const activeId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const scenarios = useApiData(() => api.scenarios.list(), [], []);

  const allDates = useMemo(() => {
    if (!startDate) return [];
    return getDateRange(startDate, dayCount);
  }, [startDate, dayCount]);

  // Compute aggregated column headers + date groups
  const { columnHeaders, dateGroups } = useMemo(() => {
    if (allDates.length === 0) return { columnHeaders: [] as ColumnHeader[], dateGroups: [] as string[][] };
    const MONTH_SHORT = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const headers: ColumnHeader[] = [];
    const groups: string[][] = [];

    switch (aggregation) {
      case "day":
        for (const date of allDates) {
          const d = new Date(date + "T00:00:00");
          const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
          headers.push({ key: date, label: `${DAY_LABELS[dayIdx]} ${d.getDate()}` });
          groups.push([date]);
        }
        break;
      case "week": {
        const weekMap = new Map<string, string[]>();
        for (const date of allDates) {
          const wk = getISOWeekNumber(date);
          const yr = new Date(date + "T00:00:00").getFullYear();
          const key = `${yr}-W${wk}`;
          if (!weekMap.has(key)) weekMap.set(key, []);
          weekMap.get(key)!.push(date);
        }
        Array.from(weekMap.entries()).forEach(([key, dates]) => {
          headers.push({ key, label: `Wk ${key.split("-W")[1]}` });
          groups.push(dates);
        });
        break;
      }
      case "4weeks": {
        for (let i = 0; i < allDates.length; i += 28) {
          const blockDates = allDates.slice(i, i + 28);
          if (blockDates.length === 0) break;
          const firstWk = getISOWeekNumber(blockDates[0]);
          const lastWk = getISOWeekNumber(blockDates[blockDates.length - 1]);
          headers.push({ key: `4w-${i}`, label: `Wk ${firstWk}–${lastWk}` });
          groups.push(blockDates);
        }
        break;
      }
      case "month": {
        const monthMap = new Map<string, string[]>();
        for (const date of allDates) {
          const d = new Date(date + "T00:00:00");
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!monthMap.has(key)) monthMap.set(key, []);
          monthMap.get(key)!.push(date);
        }
        Array.from(monthMap.entries()).forEach(([key, dates]) => {
          const [yr, m] = key.split("-").map(Number);
          headers.push({ key, label: `${MONTH_SHORT[m]} ${yr}` });
          groups.push(dates);
        });
        break;
      }
      case "quarter": {
        const qMap = new Map<string, string[]>();
        for (const date of allDates) {
          const d = new Date(date + "T00:00:00");
          const q = Math.floor(d.getMonth() / 3) + 1;
          const key = `${d.getFullYear()}-Q${q}`;
          if (!qMap.has(key)) qMap.set(key, []);
          qMap.get(key)!.push(date);
        }
        Array.from(qMap.entries()).forEach(([key, dates]) => {
          headers.push({ key, label: key.replace("-", " ") });
          groups.push(dates);
        });
        break;
      }
      case "year": {
        const yMap = new Map<string, string[]>();
        for (const date of allDates) {
          const yr = new Date(date + "T00:00:00").getFullYear().toString();
          if (!yMap.has(yr)) yMap.set(yr, []);
          yMap.get(yr)!.push(date);
        }
        Array.from(yMap.entries()).forEach(([key, dates]) => {
          headers.push({ key, label: key });
          groups.push(dates);
        });
        break;
      }
    }

    return { columnHeaders: headers, dateGroups: groups };
  }, [allDates, aggregation]);

  const emptyCapacity: Record<string, Record<PlanningStatus, number>> = {};
  const rawCapacity = useApiData(
    () => allDates.length > 0 ? api.planning.getCapacity(allDates, activeId) as Promise<Record<string, Record<PlanningStatus, number>>> : Promise.resolve(emptyCapacity),
    [allDates.length > 0 ? allDates[0] : "", allDates.length, activeId],
    emptyCapacity
  );

  // Aggregate into display data
  const displayData = useMemo(() => {
    const result: Record<string, Record<PlanningStatus, number>> = {};
    for (let i = 0; i < columnHeaders.length; i++) {
      const dates = dateGroups[i];
      const key = columnHeaders[i].key;
      const agg = { ROSTER_FREE: 0, BASE_ROSTER: 0, AVAILABLE_EXTRA: 0, LEAVE: 0, SICK: 0 } as Record<PlanningStatus, number>;
      for (const date of dates) {
        const dayData = rawCapacity[date];
        if (dayData) {
          for (const [status, count] of Object.entries(dayData)) {
            agg[status as PlanningStatus] = (agg[status as PlanningStatus] || 0) + (count as number);
          }
        }
      }
      // Average per day
      if (dates.length > 1) {
        for (const status of Object.keys(agg) as PlanningStatus[]) {
          agg[status] = Math.round(agg[status] / dates.length * 10) / 10;
        }
      }
      result[key] = agg;
    }
    return result;
  }, [rawCapacity, columnHeaders, dateGroups]);

  // Compare scenarios - fetch capacity for each compare scenario
  const compareCapacities = useApiData(
    () => {
      const ids = compareIds.filter((id) => id !== activeId);
      if (ids.length === 0 || allDates.length === 0) return Promise.resolve([]);
      return Promise.all(
        ids.map(async (id) => {
          const scenario = scenarios.find((s) => s.id === id);
          const data = await api.planning.getCapacity(allDates, id);
          return { name: scenario?.name || id, data };
        })
      );
    },
    [compareIds.join(","), activeId, allDates.length > 0 ? allDates[0] : "", allDates.length],
    [] as { name: string; data: Record<string, Record<string, number>> }[]
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
          <PeriodSelector startDate={startDate} dayCount={dayCount} onChangeStart={setStartDate} />
          <ZoomSelector value={aggregation} onChange={setAggregation} />
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

      {columnHeaders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2" />
          <div className="text-sm">Capaciteitsgegevens laden...</div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <CapacityChart
              capacityData={displayData}
              columnHeaders={columnHeaders}
              compareData={compareCapacities.length > 0 ? compareCapacities : undefined}
            />
          </div>

          <CapacityTable
            capacityData={displayData}
            columnHeaders={columnHeaders}
          />
        </>
      )}
    </div>
  );
}
