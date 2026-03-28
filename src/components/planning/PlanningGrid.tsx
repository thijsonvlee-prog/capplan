"use client";

import { useState, useEffect, useMemo } from "react";
import type { PlanningStatus, ZoomLevel, GroupByField, DriverWithEntries, StamtabelRecord } from "@/lib/store";
import {
  useStore,
  getPlanningForDateRange,
  upsertPlanningEntry,
  getActiveScenarioId,
  getLeaveTypes,
  getEmployers,
  getDepartments,
  getLocations,
  getSkills,
  groupDrivers,
  GROUP_BY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@/lib/store";
import { PeriodSelector } from "./WeekSelector";
import { ZoomSelector } from "./ZoomSelector";
import { ScenarioSelector } from "./ScenarioSelector";
import { DayCell } from "./DayCell";
import { StatusBadge } from "./StatusBadge";
import { RosterAssigner } from "./RosterAssigner";
import { CalendarCog, Columns3, ArrowUp, ArrowDown } from "lucide-react";
import {
  getCurrentWeek,
  DAY_LABELS,
  STATUS_COLORS,
  getWeekDates,
  get4WeekDates,
  getMonthDates,
  getYearMonths,
} from "@/lib/utils";

const ALL_STATUSES: PlanningStatus[] = ["ROSTER_FREE", "BASE_ROSTER", "AVAILABLE_EXTRA", "LEAVE", "SICK"];

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

export function PlanningGrid() {
  const [year, setYear] = useState(0);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [zoom, setZoom] = useState<ZoomLevel>("week");
  const [filter, setFilter] = useState("");
  const [groupBy, setGroupBy] = useState<GroupByField>("none");
  const [assigningDriver, setAssigningDriver] = useState<{ id: string; name: string } | null>(null);
  const [extraColumns, setExtraColumns] = useState<DriverColumnKey[]>([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    const current = getCurrentWeek();
    setYear(current.year);
    setWeek(current.week);
    setMonth(new Date().getMonth() + 1);
  }, []);

  const activeScenarioId = useStore(() => getActiveScenarioId());
  const leaveTypes = useStore(() => getLeaveTypes());
  const employers = useStore(() => getEmployers());
  const departments = useStore(() => getDepartments());
  const locations = useStore(() => getLocations());
  const skills = useStore(() => getSkills());
  const { dates, columnHeaders } = computeColumns(zoom, year, week, month);

  const data = useStore(() =>
    dates.length > 0 ? getPlanningForDateRange(dates, activeScenarioId) : null
  );

  // Build lookup maps for stamtabel resolution
  const employerMap = useMemo(() => new Map(employers.map((e) => [e.id, e.description])), [employers]);
  const departmentMap = useMemo(() => new Map(departments.map((d) => [d.id, d.description])), [departments]);
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l.description])), [locations]);
  const skillMap = useMemo(() => new Map(skills.map((s) => [s.id, s.name])), [skills]);

  function resolveColumnValue(driver: DriverWithEntries, col: DriverColumnKey): string {
    switch (col) {
      case "employeeNumber": return driver.employeeNumber || "";
      case "employer": return (driver.employer && employerMap.get(driver.employer)) || "";
      case "department": return (driver.department && departmentMap.get(driver.department)) || "";
      case "location": return (driver.location && locationMap.get(driver.location)) || "";
      case "employmentType": return driver.employmentType ? EMPLOYMENT_TYPE_LABELS[driver.employmentType] : "";
      case "manager": return driver.manager || "";
      case "licenseTypes": return driver.licenseTypes?.join(", ") || "";
      case "skills": return driver.skillIds?.map((id) => skillMap.get(id) || id).join(", ") || "";
    }
  }

  function handleUpdate(driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) {
    upsertPlanningEntry(driverId, date, status, options, activeScenarioId);
  }

  function handlePeriodChange(newYear: number, newWeek: number, newMonth: number) {
    setYear(newYear);
    setWeek(newWeek);
    setMonth(newMonth);
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
        return null; // third click removes sort
      }
      return { key, direction: "asc" };
    });
  }

  const filteredDrivers =
    data?.drivers.filter(
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
  }, [filteredDrivers, sortConfig, employerMap, departmentMap, locationMap, skillMap]);

  const groups = groupDrivers(sortedDrivers, groupBy);
  const isYearView = zoom === "year";
  const isCompact = zoom === "4weeks" || zoom === "month";

  // Calculate sticky left offset for date columns: driver name column + extra columns
  const driverColWidth = 180;
  const extraColWidth = 120;
  const totalStickyWidth = driverColWidth + extraColumns.length * extraColWidth;

  function SortIcon({ colKey }: { colKey: "name" | DriverColumnKey }) {
    if (sortConfig?.key !== colKey) return <ArrowUp className="w-3 h-3 text-gray-300 ml-0.5 inline" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp className="w-3 h-3 text-blue-600 ml-0.5 inline" />
      : <ArrowDown className="w-3 h-3 text-blue-600 ml-0.5 inline" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <PeriodSelector year={year} week={week} month={month} zoom={zoom} onChange={handlePeriodChange} />
          <ZoomSelector value={zoom} onChange={setZoom} />
        </div>
        <ScenarioSelector />
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
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
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                  >
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

        <div className="flex gap-1.5 flex-wrap ml-auto">
          {ALL_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {!data ? (
        <div className="text-center py-12 text-gray-500">Laden...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow" style={{ maxWidth: "100%" }}>
          <table className="border-collapse" style={{ minWidth: `${totalStickyWidth + columnHeaders.length * (isCompact ? 36 : isYearView ? 60 : 80)}px` }}>
            <thead>
              <tr className="bg-gray-50">
                <th
                  className="text-left p-3 border border-gray-200 font-semibold text-sm sticky left-0 bg-gray-50 z-10 cursor-pointer select-none whitespace-nowrap"
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
                      className="text-left p-2 border border-gray-200 font-medium text-xs sticky bg-gray-50 z-10 cursor-pointer select-none whitespace-nowrap"
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
                    className={`border border-gray-200 text-center font-medium ${
                      isCompact ? "p-1 text-xs min-w-[36px]" : isYearView ? "p-2 text-xs min-w-[60px]" : "p-2 text-sm min-w-[80px]"
                    }`}
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
                  zoom={zoom}
                  isCompact={isCompact}
                  isYearView={isYearView}
                  leaveTypes={leaveTypes}
                  driverColWidth={driverColWidth}
                  extraColWidth={extraColWidth}
                  resolveColumnValue={resolveColumnValue}
                  onUpdate={handleUpdate}
                  onAssignRoster={(id, name) => setAssigningDriver({ id, name })}
                />
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={columnHeaders.length + 1 + extraColumns.length} className="text-center py-8 text-gray-400 text-sm">
                    Geen chauffeurs gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {assigningDriver && (
        <RosterAssigner
          driverId={assigningDriver.id}
          driverName={assigningDriver.name}
          year={year}
          onClose={() => setAssigningDriver(null)}
        />
      )}
    </div>
  );
}

// === Helper: compute columns ===

type ColumnHeader = { key: string; label: string; sub?: string; dates?: string[] };

function computeColumns(
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
        columnHeaders: weekDates.map((date, i) => ({
          key: date,
          label: DAY_LABELS[i],
          sub: date.split("-").slice(1).join("/"),
        })),
      };
    }
    case "4weeks": {
      const allDates = get4WeekDates(year, week).map((d) => d.toISOString().split("T")[0]);
      return {
        dates: allDates,
        columnHeaders: allDates.map((date) => {
          const d = new Date(date + "T00:00:00");
          return { key: date, label: String(d.getDate()), sub: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] };
        }),
      };
    }
    case "month": {
      const allDates = getMonthDates(year, month).map((d) => d.toISOString().split("T")[0]);
      return {
        dates: allDates,
        columnHeaders: allDates.map((date) => {
          const d = new Date(date + "T00:00:00");
          return { key: date, label: String(d.getDate()), sub: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] };
        }),
      };
    }
    case "year": {
      const months = getYearMonths(year);
      const allDates: string[] = [];
      const headers: ColumnHeader[] = months.map((m, i) => {
        const monthDates = getMonthDates(year, i + 1).map((d) => d.toISOString().split("T")[0]);
        allDates.push(...monthDates);
        return { key: m.label, label: m.label, dates: monthDates };
      });
      return { dates: allDates, columnHeaders: headers };
    }
  }
}

// === Helper: group rows ===

function GroupRows({
  group,
  columnHeaders,
  extraColumns,
  zoom,
  isCompact,
  isYearView,
  leaveTypes,
  driverColWidth,
  extraColWidth,
  resolveColumnValue,
  onUpdate,
  onAssignRoster,
}: {
  group: { label: string; drivers: DriverWithEntries[] };
  columnHeaders: ColumnHeader[];
  extraColumns: DriverColumnKey[];
  zoom: ZoomLevel;
  isCompact: boolean;
  isYearView: boolean;
  leaveTypes: StamtabelRecord[];
  driverColWidth: number;
  extraColWidth: number;
  resolveColumnValue: (driver: DriverWithEntries, col: DriverColumnKey) => string;
  onUpdate: (driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) => void;
  onAssignRoster: (driverId: string, driverName: string) => void;
}) {
  return (
    <>
      {group.label && (
        <tr className="bg-gray-100">
          <td colSpan={columnHeaders.length + 1 + extraColumns.length} className="p-2 text-sm font-semibold text-gray-700 sticky left-0">
            {group.label} ({group.drivers.length})
          </td>
        </tr>
      )}
      {group.drivers.map((driver) => (
        <tr key={driver.id} className="hover:bg-gray-50/50">
          <td className="p-2 border border-gray-200 sticky left-0 bg-white z-10" style={{ minWidth: driverColWidth }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm whitespace-nowrap">
                  {driver.firstName} {driver.lastName}
                  {driver.manager && <span className="ml-1 text-xs text-gray-400" title={`LG: ${driver.manager}`}>(LG)</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {driver.employeeNumber || (driver.employmentType === "CHARTER" ? "Charter" : "")}
                </div>
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
              className="p-2 border border-gray-200 text-xs text-gray-600 sticky bg-white z-10 whitespace-nowrap"
              style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth, maxWidth: extraColWidth }}
            >
              <div className="truncate">{resolveColumnValue(driver, colKey) || "-"}</div>
            </td>
          ))}
          {isYearView
            ? columnHeaders.map((col) => {
                const monthEntries = driver.planningEntries.filter((e) => col.dates?.includes(e.date));
                const statusCounts: Record<string, number> = {};
                for (const e of monthEntries) {
                  statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
                }
                const dominant = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
                return (
                  <td key={col.key} className="border border-gray-200 p-1 text-center">
                    {dominant ? (
                      <div className={`rounded px-1 py-0.5 text-xs ${STATUS_COLORS[dominant[0]]}`}>
                        {dominant[1]}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                );
              })
            : columnHeaders.map((col) => {
                const entry = driver.planningEntries.find((e) => e.date === col.key);
                const dayOfWeek = new Date(col.key + "T00:00:00").getDay();
                const mondayBased = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const baseHours = driver.baseRosterHours?.[String(mondayBased)];
                return (
                  <DayCell
                    key={col.key}
                    entry={entry}
                    driverId={driver.id}
                    date={col.key}
                    compact={isCompact}
                    baseRosterHours={baseHours}
                    leaveTypes={leaveTypes}
                    onUpdate={onUpdate}
                  />
                );
              })}
        </tr>
      ))}
    </>
  );
}
