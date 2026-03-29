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
import { DEFAULT_PERIOD_DAYS } from "@/domain/constants";
import { getDateRange, getMondayStart } from "@/lib/utils";
import { getAggregatedColumns } from "@/lib/aggregation";



export default function CapacityPage() {
  const [startDate, setStartDate] = useState(getMondayStart);
  const [dayCount] = useState(DEFAULT_PERIOD_DAYS);
  const [aggregation, setAggregation] = useState<AggregationLevel>("week");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const activeId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const scenarios = useApiData(() => api.scenarios.list(), [], []);

  const allDates = useMemo(() => {
    if (!startDate) return [];
    return getDateRange(startDate, dayCount);
  }, [startDate, dayCount]);

  // Compute aggregated column headers (shared logic with PlanningGrid)
  const columnHeaders = useMemo(
    () => getAggregatedColumns(allDates, aggregation),
    [allDates, aggregation]
  );
  const dateGroups = useMemo(() => columnHeaders.map((col) => col.dates), [columnHeaders]);

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

  const activeScenarioName = scenarios.find((s) => s.id === activeId)?.name;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-context">
            <h1 className="text-page-title">Capaciteit</h1>
            {activeId !== "default" && activeScenarioName && (
              <span className="count-badge">{activeScenarioName}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <PeriodSelector startDate={startDate} dayCount={dayCount} onChangeStart={setStartDate} />
          <ZoomSelector value={aggregation} onChange={setAggregation} />
        </div>

        {scenarios.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-tertiary">Vergelijk:</span>
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleCompare(s.id)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  compareIds.includes(s.id)
                    ? "bg-warning-50 text-warning-700 border-warning-200"
                    : "bg-surface-primary text-text-secondary border-border-default hover:bg-surface-secondary"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {columnHeaders.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          <div className="spinner mb-2" />
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
