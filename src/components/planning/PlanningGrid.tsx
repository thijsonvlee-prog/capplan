"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { PlanningStatus, AggregationLevel, DensityLevel, GroupByField } from "@/domain/enums";
import type { DriverWithEntries, StamtabelRecord } from "@/domain/types";
import { ALL_PLANNING_STATUSES, STATUS_COLORS, STATUS_CODES, STATUS_DOT_COLORS, GROUP_BY_LABELS, EMPLOYMENT_TYPE_LABELS, DEFAULT_PERIOD_DAYS } from "@/domain/constants";
import { useApiData } from "@/hooks/useApi";
import { useFocusTrap } from "@/hooks/useFocusTrap";
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
  getMondayStart,
  cn,
} from "@/lib/utils";
import { getAggregatedColumns } from "@/lib/aggregation";
import type { ColumnHeader } from "@/lib/aggregation";


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

export function PlanningGrid() {
  // Start date for the visible range (snapped to Monday)
  const [startDate, setStartDate] = useState(getMondayStart);
  const [dayCount] = useState(DEFAULT_PERIOD_DAYS);
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
  const bulkSelectorFocusTrapRef = useFocusTrap();

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

  // Compute aggregated column headers (shared logic with CapacityPage)
  const columnHeaders = useMemo(
    () => getAggregatedColumns(allDates, aggregation),
    [allDates, aggregation]
  );

  const data = useApiData(
    () => allDates.length > 0 ? api.planning.getForRange(allDates, activeScenarioId) : Promise.resolve(null),
    [allDates.length > 0 ? allDates[0] : "", allDates.length, activeScenarioId],
    null as { drivers: DriverWithEntries[]; dates: string[] } | null
  );

  const skillMap = useMemo(() => new Map(skills.map((s) => [s.id, s.name])), [skills]);
  const employerMap = useMemo(() => new Map(employers.map((e) => [e.id, e.description])), [employers]);
  const leaveTypeMap = useMemo(() => new Map(leaveTypes.map((l) => [l.id, l.description])), [leaveTypes]);
  const departmentMap = useMemo(() => new Map(departments.map((d) => [d.id, d.description])), [departments]);
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l.description])), [locations]);

  // Local data layer: mirrors API data but allows instant optimistic updates.
  // Resets when the API returns new data (date range / scenario change).
  const [localData, setLocalData] = useState(data);
  useEffect(() => { setLocalData(data); }, [data]);

  const resolveColumnValue = useCallback((driver: DriverWithEntries, col: DriverColumnKey): string => {
    const emp = getActiveRecord(driver.employmentRecords);
    const pos = getActiveRecord(driver.functionRecords);
    switch (col) {
      case "employeeNumber": return driver.employeeNumber || "";
      case "employer": return (emp?.employerId && employerMap.get(emp.employerId)) || "";
      case "department": return (pos?.departmentId && departmentMap.get(pos.departmentId)) || "";
      case "location": return (pos?.locationId && locationMap.get(pos.locationId)) || "";
      case "employmentType": return emp?.employmentType ? (EMPLOYMENT_TYPE_LABELS[emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || "") : "";
      case "manager": return pos?.manager || "";
      case "licenseTypes": return driver.licenseTypes?.join(", ") || "";
      case "skills": return driver.skillIds?.map((id) => skillMap.get(id) || id).join(", ") || "";
    }
  }, [skillMap, employerMap, departmentMap, locationMap]);

  // Shared helper for optimistic entry updates (used by single + bulk)
  function applyOptimisticEntries(
    driverId: string,
    dates: string[],
    status: PlanningStatus,
    options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }
  ) {
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
              id: idx >= 0 ? entries[idx].id : `temp-${date}-${Date.now()}`,
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
  }

  function handleUpdate(driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) {
    applyOptimisticEntries(driverId, [date], status, options);
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

  const handleDragEnd = useCallback(() => {
    if (dragState && dragState.dates.length > 1) {
      setShowBulkSelector(true);
    } else {
      setDragState(null);
    }
  }, [dragState]);

  function handleBulkSelect(status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) {
    if (!dragState) return;
    const { driverId, dates } = dragState;
    applyOptimisticEntries(driverId, dates, status, options);
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
  }, [dragState, handleDragEnd]);

  const filteredDrivers = useMemo(() =>
    localData?.drivers.filter(
      (d) =>
        !filter ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(filter.toLowerCase())
    ) || [],
    [localData, filter]
  );

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
    if (sortConfig?.key !== colKey) return <ArrowUp className="w-3 h-3 text-text-tertiary ml-0.5 inline" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp className="w-3 h-3 text-brand-600 ml-0.5 inline" />
      : <ArrowDown className="w-3 h-3 text-brand-600 ml-0.5 inline" />;
  }

  const DensityIcon = DENSITY_ICONS[density];

  return (
    <div className="select-none flex flex-col h-full min-h-0">
      {/* Toolbar row 1: navigation + view settings */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2 flex-shrink-0">
        <div className="control-group">
          <span className="control-group-label">Periode</span>
          <PeriodSelector startDate={startDate} dayCount={dayCount} onChangeStart={setStartDate} />
          <ZoomSelector value={aggregation} onChange={setAggregation} />
        </div>
        <div className="control-group">
          <span className="control-group-label">Weergave</span>
          <button
            onClick={cycleDensity}
            className="flex items-center gap-1.5 px-2 py-1.5 border border-border-default rounded-lg text-sm text-text-secondary hover:bg-surface-secondary bg-surface-primary transition-colors"
            title={`Dichtheid: ${dc.label}`}
          >
            <DensityIcon className="w-4 h-4" />
            {dc.label}
          </button>
          <ScenarioSelector />
        </div>
      </div>

      {/* Toolbar row 2: search/filter + display options + status legend */}
      <div className="flex items-center gap-3 mb-3 flex-wrap flex-shrink-0">
        <div className="control-group">
          <input
            type="text"
            placeholder="Zoek op naam..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-border-default rounded-lg text-sm w-56 bg-surface-primary placeholder:text-text-tertiary focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          />
          <label className="text-caption whitespace-nowrap">Groepeer op:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="input-field"
          >
            {Object.entries(GROUP_BY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          {/* Column picker */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-sm transition-colors ${
                extraColumns.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-border-default text-text-secondary hover:bg-surface-secondary bg-surface-primary"
              }`}
              title="Kolommen toevoegen"
            >
              <Columns3 className="w-4 h-4" />
              Kolommen{extraColumns.length > 0 && ` (${extraColumns.length})`}
            </button>
            {showColumnPicker && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowColumnPicker(false)} />
                <div className="absolute top-full left-0 mt-1 bg-surface-primary border border-border-default rounded-lg shadow-dropdown z-30 py-1 min-w-[200px]" role="dialog" aria-modal="true" aria-label="Kolommen selecteren">
                  {DRIVER_COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-secondary cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={extraColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="w-3.5 h-3.5 rounded border-border-default accent-brand-600"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Capacity summary toggle */}
          <button
            onClick={() => setShowCapacitySummary((v) => !v)}
            className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-sm transition-colors ${
              showCapacitySummary ? "border-brand-300 bg-brand-50 text-brand-700" : "border-border-default text-text-secondary hover:bg-surface-secondary bg-surface-primary"
            }`}
            title="Capaciteitssamenvatting tonen/verbergen"
          >
            Totalen
          </button>
        </div>

        <div className="control-group ml-auto">
          <span className="control-group-label">Status</span>
          {ALL_PLANNING_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Drag selection info bar */}
      {dragState && dragState.dates.length > 1 && (
        <div className="mb-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700">
          {dragState.dates.length} dagen geselecteerd — laat muisknop los om status te kiezen
        </div>
      )}

      {!localData ? (
        <div className="text-center py-12 text-text-tertiary">
          <div className="spinner mb-2" />
          <div className="text-sm">Planning laden...</div>
        </div>
      ) : (
        <div className="overflow-auto bg-surface-primary rounded-lg shadow-card border border-border-subtle flex-1 min-h-0">
          <table className="planning-grid" style={{ minWidth: `${driverColWidth + extraColumns.length * extraColWidth + columnHeaders.length * dc.minW}px` }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-surface-tertiary">
                <th
                  className={cn(
                    "text-left font-semibold sticky left-0 bg-surface-tertiary z-30 cursor-pointer whitespace-nowrap",
                    dc.cellPad, dc.fontSize,
                    extraColumns.length === 0 && "grid-sticky-edge"
                  )}
                  style={{ minWidth: driverColWidth }}
                  onClick={() => handleSort("name")}
                >
                  Chauffeur <SortIcon colKey="name" />
                </th>
                {extraColumns.map((colKey, i) => {
                  const colDef = DRIVER_COLUMNS.find((c) => c.key === colKey)!;
                  const isLast = i === extraColumns.length - 1;
                  return (
                    <th
                      key={colKey}
                      className={cn(
                        "text-left font-medium sticky bg-surface-tertiary z-30 cursor-pointer whitespace-nowrap",
                        dc.cellPad, dc.fontSize,
                        isLast && "grid-sticky-edge"
                      )}
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
                    className={cn("text-center font-medium", dc.cellPad, dc.fontSize)}
                    style={{ minWidth: dc.minW }}
                  >
                    <div>{col.label}</div>
                    {col.sub && <div className="text-xs text-text-tertiary font-normal">{col.sub}</div>}
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
                  leaveTypeMap={leaveTypeMap}
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
                  <td colSpan={columnHeaders.length + 1 + extraColumns.length} className="text-center py-8 text-text-tertiary text-sm">
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={`Status instellen voor ${dragState.dates.length} dagen`} onKeyDown={(e) => { if (e.key === "Escape") { setShowBulkSelector(false); setDragState(null); } }}>
          <div ref={bulkSelectorFocusTrapRef} className="bg-surface-primary rounded-lg shadow-modal p-4 min-w-[280px]">
            <div className="text-section-title mb-2">
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
  leaveTypeMap,
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
  leaveTypeMap: Map<string, string>;
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
        <tr className="grid-group-row">
          <td colSpan={columnHeaders.length + 1 + extraColumns.length} className={`${dc.cellPad} ${dc.fontSize} font-semibold text-text-secondary sticky left-0 bg-surface-inset`}>
            {group.label} ({group.drivers.length})
          </td>
        </tr>
      )}
      {group.drivers.map((driver, driverIdx) => (
        <tr key={driver.id} className={cn("hover:bg-surface-secondary/50", driverIdx % 2 === 1 && "bg-surface-secondary/30")}>
          <td className={cn(
              dc.cellPad,
              "sticky left-0 z-10",
              driverIdx % 2 === 1 ? "bg-surface-secondary/30" : "bg-surface-primary",
              extraColumns.length === 0 && "grid-sticky-edge"
            )} style={{ minWidth: driverColWidth }}>
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                {(() => {
                  const pos = getActiveRecord(driver.functionRecords);
                  const emp = getActiveRecord(driver.employmentRecords);
                  const meta = driver.employeeNumber || (emp?.employmentType === "CHARTER" ? "Charter" : "");
                  return (
                    <>
                      <div className={cn("font-semibold text-text-primary whitespace-nowrap truncate", density === "spacious" ? "text-sm" : "text-xs")}>
                        {driver.lastName}{driver.firstName ? `, ${driver.firstName}` : ""}
                        {pos?.manager && <span className="ml-1 font-normal text-text-tertiary" title={`Leidinggevende: ${pos.manager}`}>(LG)</span>}
                      </div>
                      {density !== "compact" && meta && (
                        <div className="text-caption truncate">
                          {meta}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => onAssignRoster(driver.id, `${driver.lastName}, ${driver.firstName}`)}
                className="btn-icon shrink-0"
                title="Roosterprofiel toewijzen"
                aria-label="Roosterprofiel toewijzen"
              >
                <CalendarCog className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
          {extraColumns.map((colKey, i) => {
            const isLast = i === extraColumns.length - 1;
            return (
              <td
                key={colKey}
                className={cn(
                  dc.cellPad, dc.fontSize,
                  "text-text-secondary sticky z-10 whitespace-nowrap",
                  driverIdx % 2 === 1 ? "bg-surface-secondary/30" : "bg-surface-primary",
                  isLast && "grid-sticky-edge"
                )}
                style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth, maxWidth: extraColWidth }}
              >
                <div className="truncate">{resolveColumnValue(driver, colKey) || "-"}</div>
              </td>
            );
          })}
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
                      "relative",
                      dc.cellPad,
                      isSelected && "ring-2 ring-inset ring-brand-400"
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
                        leaveTypeMap={leaveTypeMap}
                        onUpdate={onUpdate}
                        density={density}
                      />
                    ) : (
                      <div className={`w-full ${dc.cellH} flex items-center justify-center`}>
                        {entry ? (
                          <StatusBadge status={entry.status} compact sickPercentage={entry.sickPercentage} />
                        ) : (
                          <span className="text-text-tertiary/50 text-[0.625rem]">&middot;</span>
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
                  <td key={col.key} className={`${dc.cellPad} text-center`}>
                    {dominant ? (
                      <div
                        className={`status-chip-compact justify-center ${STATUS_COLORS[dominant[0] as PlanningStatus]}`}
                        title={Object.entries(statusCounts).map(([s, c]) => `${STATUS_CODES[s as PlanningStatus]}: ${c}/${total}`).join(", ")}
                      >
                        <span className={`status-dot ${STATUS_DOT_COLORS[dominant[0] as PlanningStatus]}`} aria-hidden="true" />
                        {STATUS_CODES[dominant[0] as PlanningStatus]}{dominant[1]}
                      </div>
                    ) : (
                      <span className="text-text-tertiary/50 text-[0.625rem]">&middot;</span>
                    )}
                  </td>
                );
              })}
        </tr>
      ))}
    </>
  );
}
