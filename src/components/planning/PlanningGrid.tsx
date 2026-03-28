"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { PlanningStatus, AggregationLevel, DensityLevel, GroupByField } from "@/domain/enums";
import type { DriverWithEntries, StamtabelRecord } from "@/domain/types";
import { ALL_PLANNING_STATUSES, STATUS_COLORS, STATUS_CODES, GROUP_BY_LABELS, DAY_LABELS, EMPLOYMENT_TYPE_LABELS } from "@/domain/constants";
import { useApiData } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { groupDrivers, getActiveRecord } from "@/lib/api-helpers";
import { PeriodSelector } from "./WeekSelector";
import { ZoomSelector } from "./ZoomSelector";
import { ScenarioSelector } from "./ScenarioSelector";
import { DayCell } from "./DayCell";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { RosterAssigner } from "./RosterAssigner";
import { CapacitySummaryRow } from "./CapacitySummaryRow";
import { CalendarCog, Columns3, ArrowUp, ArrowDown, Maximize2, Minus, AlignJustify } from "lucide-react";
import {
  getDateRange,
  getISOWeekNumber,
  cn,
} from "@/lib/utils";
import { addDays } from "date-fns";

const DEFAULT_DAY_COUNT = 56;

// Available extra columns from driver master data
type DriverColumnKey = "employeeNumber" | "employer" | "department" | "location" | "employmentType" | "manager" | "licenseTypes" | "skills";

const DRIVER_COLUMNS: { key: DriverColumnKey; label: string }[] = [
  { key: "employeeNumber", label: "Personeelsnr." },
  { key: "employer", label: "Werkgever" },
  { key: "department", label: "Afdeling" },
  { key: "location", label: "Standplaats" },
  { key: "employmentType", label: "Dienstverband" },
  { key: "manager", label: "Leidinggevende" },
  { key: "licenseTypes", label: "Rijbewijs" },
  { key: "skills", label: "Vaardigheden" },
];

type SortConfig = { key: "name" | DriverColumnKey; direction: "asc" | "desc" } | null;

// Density settings
const DENSITY_CONFIG: Record<DensityLevel, { cellH: string; cellPad: string; fontSize: string; minW: number; label: string }> = {
  spacious: { cellH: "h-10", cellPad: "p-2", fontSize: "text-sm", minW: 80, label: "Ruim" },
  comfortable: { cellH: "h-8", cellPad: "p-1", fontSize: "text-xs", minW: 50, label: "Normaal" },
  compact: { cellH: "h-6", cellPad: "p-0.5", fontSize: "text-xs", minW: 32, label: "Compact" },
};

const DENSITY_ICONS: Record<DensityLevel, typeof Maximize2> = {
  spacious: Maximize2,
  comfortable: AlignJustify,
  compact: Minus,
};

// Aggregation column header type
type ColumnHeader = { key: string; label: string; sub?: string; dates: string[] };

export function PlanningGrid() {
  // Start date for the visible range (snapped to Monday — computed synchronously to avoid empty first render)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return addDays(today, mondayOffset).toISOString().split("T")[0];
  });
  const [dayCount] = useState(DEFAULT_DAY_COUNT);
  const [aggregation, setAggregation] = useState<AggregationLevel>("day");
  const [density, setDensity] = useState<DensityLevel>("comfortable");
  const [filter, setFilter] = useState("");
  const [groupBy, setGroupBy] = useState<GroupByField>("none");
  const [assigningDriver, setAssigningDriver] = useState<{ id: string; name: string } | null>(null);
  const [extraColumns, setExtraColumns] = useState<DriverColumnKey[]>([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [showCapacitySummary, setShowCapacitySummary] = useState(true); // POC: capacity summary row

  // Multi-select drag state
  const [dragState, setDragState] = useState<{
    driverId: string;
    dates: string[];
    active: boolean;
  } | null>(null);
  const [showBulkSelector, setShowBulkSelector] = useState(false);

  const activeScenarioId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const leaveTypes = useApiData(() => api.settings.getLeaveTypes(), [], []);
  const skills = useApiData(() => api.settings.getSkills(), [], []);
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);

  // Compute all day-level dates for the range
  const allDates = useMemo(() => {
    if (!startDate) return [];
    return getDateRange(startDate, dayCount);
  }, [startDate, dayCount]);

  // Compute aggregated column headers
  const columnHeaders = useMemo((): ColumnHeader[] => {
    if (allDates.length === 0) return [];

    switch (aggregation) {
      case "day":
        return allDates.map((date) => {
          const d = new Date(date + "T00:00:00");
          const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
          return { key: date, label: DAY_LABELS[dayIdx], sub: `${d.getDate()}/${d.getMonth() + 1}`, dates: [date] };
        });

      case "week": {
        const weekMap = new Map<string, string[]>();
        for (const date of allDates) {
          const wk = getISOWeekNumber(date);
          const yr = new Date(date + "T00:00:00").getFullYear();
          const key = `${yr}-W${wk}`;
          if (!weekMap.has(key)) weekMap.set(key, []);
          weekMap.get(key)!.push(date);
        }
        return Array.from(weekMap.entries()).map(([key, dates]) => ({
          key, label: `Wk ${key.split("-W")[1]}`, dates,
        }));
      }

      case "4weeks": {
        const blocks: ColumnHeader[] = [];
        for (let i = 0; i < allDates.length; i += 28) {
          const blockDates = allDates.slice(i, i + 28);
          if (blockDates.length === 0) break;
          const firstWk = getISOWeekNumber(blockDates[0]);
          const lastWk = getISOWeekNumber(blockDates[blockDates.length - 1]);
          blocks.push({ key: `4w-${i}`, label: `Wk ${firstWk}–${lastWk}`, dates: blockDates });
        }
        return blocks;
      }

      case "month": {
        const monthMap = new Map<string, string[]>();
        const MONTH_SHORT = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
        for (const date of allDates) {
          const d = new Date(date + "T00:00:00");
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!monthMap.has(key)) monthMap.set(key, []);
          monthMap.get(key)!.push(date);
        }
        return Array.from(monthMap.entries()).map(([key, dates]) => {
          const [yr, m] = key.split("-").map(Number);
          return { key, label: `${MONTH_SHORT[m]} ${yr}`, dates };
        });
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
        return Array.from(qMap.entries()).map(([key, dates]) => ({
          key, label: key.replace("-", " "), dates,
        }));
      }

      case "year": {
        const yMap = new Map<string, string[]>();
        for (const date of allDates) {
          const yr = new Date(date + "T00:00:00").getFullYear().toString();
          if (!yMap.has(yr)) yMap.set(yr, []);
          yMap.get(yr)!.push(date);
        }
        return Array.from(yMap.entries()).map(([key, dates]) => ({
          key, label: key, dates,
        }));
      }
    }
  }, [allDates, aggregation]);

  const data = useApiData(
    () => allDates.length > 0 ? api.planning.getForRange(allDates, activeScenarioId) : Promise.resolve(null),
    [allDates.length > 0 ? allDates[0] : "", allDates.length, activeScenarioId],
    null as { drivers: DriverWithEntries[]; dates: string[] } | null
  );

  const skillMap = useMemo(() => new Map(skills.map((s) => [s.id, s.name])), [skills]);

  // Local data layer: mirrors API data but allows instant optimistic updates.
  // Resets when the API returns new data (date range / scenario change).
  const [localData, setLocalData] = useState(data);
  useEffect(() => { setLocalData(data); }, [data]);

  const resolveColumnValue = useCallback((driver: DriverWithEntries, col: DriverColumnKey): string => {
    const emp = getActiveRecord(driver.employmentRecords);
    const pos = getActiveRecord(driver.functionRecords);
    switch (col) {
      case "employeeNumber": return driver.employeeNumber || "";
      case "employer": return (emp?.employerId && employers.find((e) => e.id === emp.employerId)?.description) || "";
      case "department": return (pos?.departmentId && departments.find((d) => d.id === pos.departmentId)?.description) || "";
      case "location": return (pos?.locationId && locations.find((l) => l.id === pos.locationId)?.description) || "";
      case "employmentType": return emp?.employmentType ? (EMPLOYMENT_TYPE_LABELS[emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || "") : "";
      case "manager": return pos?.manager || "";
      case "licenseTypes": return driver.licenseTypes?.join(", ") || "";
      case "skills": return driver.skillIds?.map((id) => skillMap.get(id) || id).join(", ") || "";
    }
  }, [skillMap, employers, departments, locations]);

  function handleUpdate(driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) {
    // Optimistic update — modify local state immediately, no full refetch
    setLocalData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        drivers: prev.drivers.map(d => {
          if (d.id !== driverId) return d;
          const idx = d.planningEntries.findIndex(e => e.date === date);
          const entry = {
            id: idx >= 0 ? d.planningEntries[idx].id : `temp-${Date.now()}`,
            driverId, date, status,
            leaveTypeId: options?.leaveTypeId,
            sickPercentage: options?.sickPercentage,
            notes: options?.notes,
            scenarioId: activeScenarioId === "default" ? undefined : activeScenarioId,
          };
          const entries = [...d.planningEntries];
          if (idx >= 0) entries[idx] = entry; else entries.push(entry);
          return { ...d, planningEntries: entries };
        }),
      };
    });
    // Fire and forget — no invalidation, no refetch storm
    api.planning.upsert({ driverId, date, status, ...options, scenarioId: activeScenarioId });
  }

  function toggleColumn(key: DriverColumnKey) {
    setExtraColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleSort(key: "name" | DriverColumnKey) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  }

  function cycleDensity() {
    setDensity((prev) => {
      if (prev === "spacious") return "comfortable";
      if (prev === "comfortable") return "compact";
      return "spacious";
    });
  }

  // Multi-select drag handlers
  function handleDragStart(driverId: string, date: string) {
    setDragState({ driverId, dates: [date], active: true });
  }

  function handleDragEnter(driverId: string, date: string) {
    if (!dragState?.active || dragState.driverId !== driverId) return;
    setDragState((prev) => {
      if (!prev) return prev;
      if (prev.dates.includes(date)) return prev;
      return { ...prev, dates: [...prev.dates, date] };
    });
  }

  function handleDragEnd() {
    if (dragState && dragState.dates.length > 1) {
      setShowBulkSelector(true);
    } else {
      setDragState(null);
    }
  }

  function handleBulkSelect(status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) {
    if (!dragState) return;
    const { driverId, dates } = dragState;
    // Optimistic update for all selected dates
    setLocalData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        drivers: prev.drivers.map(d => {
          if (d.id !== driverId) return d;
          const entries = [...d.planningEntries];
          for (const date of dates) {
            const idx = entries.findIndex(e => e.date === date);
            const entry = {
              id: idx >= 0 ? entries[idx].id : `temp-${date}`,
              driverId, date, status,
              leaveTypeId: options?.leaveTypeId,
              sickPercentage: options?.sickPercentage,
              notes: options?.notes,
              scenarioId: activeScenarioId === "default" ? undefined : activeScenarioId,
            };
            if (idx >= 0) entries[idx] = entry; else entries.push(entry);
          }
          return { ...d, planningEntries: entries };
        }),
      };
    });
    api.planning.upsertBulk({ driverId, dates, status, ...options, scenarioId: activeScenarioId });
    setDragState(null);
    setShowBulkSelector(false);
  }

  // Global mouseup listener for drag
  useEffect(() => {
    function onMouseUp() {
      if (dragState?.active) {
        handleDragEnd();
      }
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [dragState]);

  const filteredDrivers =
    localData?.drivers.filter(
      (d) =>
        !filter ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  // Apply sorting
  const sortedDrivers = useMemo(() => {
    if (!sortConfig) return filteredDrivers;
    const sorted = [...filteredDrivers];
    sorted.sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortConfig.key === "name") {
        aVal = `${a.lastName} ${a.firstName}`.toLowerCase();
        bVal = `${b.lastName} ${b.firstName}`.toLowerCase();
      } else {
        aVal = resolveColumnValue(a, sortConfig.key).toLowerCase();
        bVal = resolveColumnValue(b, sortConfig.key).toLowerCase();
      }
      const cmp = aVal.localeCompare(bVal);
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredDrivers, sortConfig, resolveColumnValue]);

  const groups = groupDrivers(sortedDrivers, groupBy, { employers, departments, locations });
  const dc = DENSITY_CONFIG[density];

  // Calculate sticky left offset
  const driverColWidth = 180;
  const extraColWidth = 120;

  function SortIcon({ colKey }: { colKey: "name" | DriverColumnKey }) {
    if (sortConfig?.key !== colKey) return <ArrowUp className="w-3 h-3 text-gray-300 ml-0.5 inline" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp className="w-3 h-3 text-blue-600 ml-0.5 inline" />
      : <ArrowDown className="w-3 h-3 text-blue-600 ml-0.5 inline" />;
  }

  const DensityIcon = DENSITY_ICONS[density];

  return (
    <div className="select-none flex flex-col h-full min-h-0">
      {/* Top bar: navigation + aggregation + scenario */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <PeriodSelector startDate={startDate} dayCount={dayCount} onChangeStart={setStartDate} />
          <ZoomSelector value={aggregation} onChange={setAggregation} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cycleDensity}
            className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            title={`Dichtheid: ${dc.label}`}
          >
            <DensityIcon className="w-4 h-4" />
            {dc.label}
          </button>
          <ScenarioSelector />
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-3 flex-wrap flex-shrink-0">
        <input
          type="text"
          placeholder="Zoek chauffeur..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Groepeer op:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            {Object.entries(GROUP_BY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Column picker */}
        <div className="relative">
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-sm transition-colors ${
              extraColumns.length > 0 ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            title="Kolommen toevoegen"
          >
            <Columns3 className="w-4 h-4" />
            Kolommen{extraColumns.length > 0 && ` (${extraColumns.length})`}
          </button>
          {showColumnPicker && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowColumnPicker(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[200px]">
                {DRIVER_COLUMNS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={extraColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* POC: toggle capacity summary row */}
        <button
          onClick={() => setShowCapacitySummary((v) => !v)}
          className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-sm transition-colors ${
            showCapacitySummary ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          title="Capaciteitssamenvatting tonen/verbergen"
        >
          Σ Totalen
        </button>

        <div className="flex gap-1.5 flex-wrap ml-auto">
          {ALL_PLANNING_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Drag selection info bar */}
      {dragState && dragState.dates.length > 1 && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {dragState.dates.length} dagen geselecteerd — laat muisknop los om status te kiezen
        </div>
      )}

      {!localData ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2" />
          <div className="text-sm">Planning laden...</div>
        </div>
      ) : (
        <div className="overflow-auto bg-white rounded-lg shadow flex-1 min-h-0">
          <table className="border-collapse" style={{ minWidth: `${driverColWidth + extraColumns.length * extraColWidth + columnHeaders.length * dc.minW}px` }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50">
                <th
                  className={`text-left ${dc.cellPad} border border-gray-200 font-semibold ${dc.fontSize} sticky left-0 bg-gray-50 z-30 cursor-pointer whitespace-nowrap`}
                  style={{ minWidth: driverColWidth }}
                  onClick={() => handleSort("name")}
                >
                  Chauffeur <SortIcon colKey="name" />
                </th>
                {extraColumns.map((colKey, i) => {
                  const colDef = DRIVER_COLUMNS.find((c) => c.key === colKey)!;
                  return (
                    <th
                      key={colKey}
                      className={`text-left ${dc.cellPad} border border-gray-200 font-medium ${dc.fontSize} sticky bg-gray-50 z-30 cursor-pointer whitespace-nowrap`}
                      style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth }}
                      onClick={() => handleSort(colKey)}
                    >
                      {colDef.label} <SortIcon colKey={colKey} />
                    </th>
                  );
                })}
                {columnHeaders.map((col) => (
                  <th
                    key={col.key}
                    className={`border border-gray-200 text-center font-medium ${dc.cellPad} ${dc.fontSize}`}
                    style={{ minWidth: dc.minW }}
                  >
                    <div>{col.label}</div>
                    {col.sub && <div className="text-xs text-gray-400 font-normal">{col.sub}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <GroupRows
                  key={group.label || "__all"}
                  group={group}
                  columnHeaders={columnHeaders}
                  extraColumns={extraColumns}
                  aggregation={aggregation}
                  density={density}
                  leaveTypes={leaveTypes}
                  employers={employers}
                  driverColWidth={driverColWidth}
                  extraColWidth={extraColWidth}
                  resolveColumnValue={resolveColumnValue}
                  dragState={dragState}
                  onUpdate={handleUpdate}
                  onAssignRoster={(id, name) => setAssigningDriver({ id, name })}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                />
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={columnHeaders.length + 1 + extraColumns.length} className="text-center py-8 text-gray-400 text-sm">
                    {filter ? `Geen chauffeurs gevonden voor "${filter}"` : "Geen chauffeurs beschikbaar. Voeg chauffeurs toe via het Chauffeurs-scherm."}
                  </td>
                </tr>
              )}
              {/* POC: Capacity summary row */}
              {showCapacitySummary && filteredDrivers.length > 0 && (
                <CapacitySummaryRow
                  drivers={filteredDrivers}
                  columnHeaders={columnHeaders}
                  extraColumnCount={extraColumns.length}
                  density={density}
                  driverColWidth={driverColWidth}
                  extraColWidth={extraColWidth}
                  minCellWidth={dc.minW}
                />
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk status selector after drag */}
      {showBulkSelector && dragState && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 min-w-[280px]">
            <div className="text-sm font-semibold mb-2">
              Status instellen voor {dragState.dates.length} dagen
            </div>
            <StatusSelector
              onSelect={(status, options) => handleBulkSelect(status, options)}
              onClose={() => { setShowBulkSelector(false); setDragState(null); }}
            />
          </div>
        </div>
      )}

      {assigningDriver && (
        <RosterAssigner
          driverId={assigningDriver.id}
          driverName={assigningDriver.name}
          onClose={() => setAssigningDriver(null)}
        />
      )}
    </div>
  );
}

// === Helper: group rows ===

function GroupRows({
  group,
  columnHeaders,
  extraColumns,
  aggregation,
  density,
  leaveTypes,
  employers,
  driverColWidth,
  extraColWidth,
  resolveColumnValue,
  dragState,
  onUpdate,
  onAssignRoster,
  onDragStart,
  onDragEnter,
}: {
  group: { label: string; drivers: DriverWithEntries[] };
  columnHeaders: ColumnHeader[];
  extraColumns: DriverColumnKey[];
  aggregation: AggregationLevel;
  density: DensityLevel;
  leaveTypes: StamtabelRecord[];
  employers: StamtabelRecord[];
  driverColWidth: number;
  extraColWidth: number;
  resolveColumnValue: (driver: DriverWithEntries, col: DriverColumnKey) => string;
  dragState: { driverId: string; dates: string[]; active: boolean } | null;
  onUpdate: (driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) => void;
  onAssignRoster: (driverId: string, driverName: string) => void;
  onDragStart: (driverId: string, date: string) => void;
  onDragEnter: (driverId: string, date: string) => void;
}) {
  const dc = DENSITY_CONFIG[density];
  const isDayLevel = aggregation === "day";
  const isCompact = density === "compact";

  return (
    <>
      {group.label && (
        <tr className="bg-gray-100">
          <td colSpan={columnHeaders.length + 1 + extraColumns.length} className={`${dc.cellPad} ${dc.fontSize} font-semibold text-gray-700 sticky left-0`}>
            {group.label} ({group.drivers.length})
          </td>
        </tr>
      )}
      {group.drivers.map((driver) => (
        <tr key={driver.id} className="hover:bg-gray-50/50">
          <td className={`${dc.cellPad} border border-gray-200 sticky left-0 bg-white z-10`} style={{ minWidth: driverColWidth }}>
            <div className="flex items-center justify-between">
              <div>
                {(() => {
                  const pos = getActiveRecord(driver.functionRecords);
                  const emp = getActiveRecord(driver.employmentRecords);
                  return (
                    <>
                      <div className={`font-medium ${dc.fontSize} whitespace-nowrap`}>
                        {driver.firstName} {driver.lastName}
                        {pos?.manager && <span className="ml-1 text-xs text-gray-400" title={`LG: ${pos.manager}`}>(LG)</span>}
                      </div>
                      {density !== "compact" && (
                        <div className="text-xs text-gray-400">
                          {driver.employeeNumber || (emp?.employmentType === "CHARTER" ? "Charter" : "")}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => onAssignRoster(driver.id, `${driver.firstName} ${driver.lastName}`)}
                className="p-1 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Roosterprofiel toewijzen"
              >
                <CalendarCog className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
          {extraColumns.map((colKey, i) => (
            <td
              key={colKey}
              className={`${dc.cellPad} border border-gray-200 ${dc.fontSize} text-gray-600 sticky bg-white z-10 whitespace-nowrap`}
              style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth, maxWidth: extraColWidth }}
            >
              <div className="truncate">{resolveColumnValue(driver, colKey) || "-"}</div>
            </td>
          ))}
          {isDayLevel
            ? columnHeaders.map((col) => {
                const date = col.dates[0];
                const entry = driver.planningEntries.find((e) => e.date === date);
                const isDragging = dragState?.active && dragState.driverId === driver.id;
                const isSelected = dragState?.driverId === driver.id && dragState.dates.includes(date);
                return (
                  <td
                    key={col.key}
                    className={cn(
                      "relative border border-gray-200",
                      dc.cellPad,
                      isSelected && "ring-2 ring-inset ring-blue-400"
                    )}
                    onMouseDown={(e) => { e.preventDefault(); onDragStart(driver.id, date); }}
                    onMouseEnter={() => onDragEnter(driver.id, date)}
                  >
                    {!isDragging ? (
                      <DayCell
                        entry={entry}
                        driverId={driver.id}
                        date={date}
                        compact={isCompact}
                        leaveTypes={leaveTypes}
                        onUpdate={onUpdate}
                        density={density}
                      />
                    ) : (
                      <div className={`w-full ${dc.cellH} flex items-center justify-center`}>
                        {entry ? (
                          <StatusBadge status={entry.status} compact sickPercentage={entry.sickPercentage} />
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })
            : columnHeaders.map((col) => {
                // Aggregated view: show dominant status count
                const colEntries = driver.planningEntries.filter((e) => col.dates.includes(e.date));
                const statusCounts: Record<string, number> = {};
                for (const e of colEntries) {
                  statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
                }
                const dominant = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
                const total = col.dates.length;
                return (
                  <td key={col.key} className={`border border-gray-200 ${dc.cellPad} text-center`}>
                    {dominant ? (
                      <div
                        className={`rounded px-1 py-0.5 ${dc.fontSize} ${STATUS_COLORS[dominant[0] as PlanningStatus]}`}
                        title={Object.entries(statusCounts).map(([s, c]) => `${STATUS_CODES[s as PlanningStatus]}: ${c}/${total}`).join(", ")}
                      >
                        {STATUS_CODES[dominant[0] as PlanningStatus]} {dominant[1]}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                );
              })}
        </tr>
      ))}
    </>
  );
}
