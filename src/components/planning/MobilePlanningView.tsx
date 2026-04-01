"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight, Calendar, CalendarDays, User } from "lucide-react";
import { useApiData, useApiDataWithLoading } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { useHeaderSubtitle } from "@/hooks/useHeaderSubtitle";
import { getDateRange, getMondayStart, cn } from "@/lib/utils";
import { STATUS_LABELS, DAY_LABELS, MONTH_SHORT } from "@/domain/constants";
import type { PlanningEntry, Driver } from "@/domain/types";
import type { PlanningStatus } from "@/domain/enums";
import { addDays, getISOWeek, parseISO } from "date-fns";

type ViewMode = "day" | "week";

const DEFAULT_PAGINATED = { data: [] as Driver[], total: 0, page: 1, pageSize: 20 };

/** Format date for display: "Ma 1 apr" */
function formatShortDate(dateStr: string): string {
  const d = parseISO(dateStr);
  const dayIdx = (d.getDay() + 6) % 7; // Mon=0
  return `${DAY_LABELS[dayIdx]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()].toLowerCase()}`;
}

/** Format date header for week view: "Week 14 — 31 mrt – 6 apr 2026" */
function formatWeekHeader(mondayStr: string): string {
  const monday = parseISO(mondayStr);
  const sunday = addDays(monday, 6);
  const weekNum = getISOWeekNumber(mondayStr);
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const startMonth = MONTH_SHORT[monday.getMonth()].toLowerCase();
  const endMonth = MONTH_SHORT[sunday.getMonth()].toLowerCase();
  const year = sunday.getFullYear();

  if (monday.getMonth() === sunday.getMonth()) {
    return `Week ${weekNum} — ${startDay}–${endDay} ${endMonth} ${year}`;
  }
  return `Week ${weekNum} — ${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
}

function getISOWeekNumber(dateStr: string): number {
  return getISOWeek(parseISO(dateStr));
}

/** Get Monday of the week containing the given date */
function getMondayOf(dateStr: string): string {
  const d = parseISO(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff).toISOString().split("T")[0];
}

export function MobilePlanningView() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => getMondayStart());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [driverPage, setDriverPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setDriverPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current);
  }, []);

  // Active scenario
  const activeScenarioId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const scenarios = useApiData(() => api.scenarios.list(), [], []);
  const activeScenarioLabel = activeScenarioId === "default"
    ? "Actuele planning"
    : scenarios.find((s) => s.id === activeScenarioId)?.name || "";

  useHeaderSubtitle(selectedDriver
    ? `${selectedDriver.lastName}, ${selectedDriver.firstName}`
    : activeScenarioLabel
  );

  // Driver list (only when no driver selected)
  const [driversResult, driversLoading] = useApiDataWithLoading(
    () => api.drivers.listPaginated({
      isActive: true,
      search: debouncedSearch || undefined,
      page: driverPage,
      pageSize: 20,
    }),
    [debouncedSearch, driverPage],
    DEFAULT_PAGINATED
  );

  const drivers = driversResult.data;
  const totalDrivers = driversResult.total;
  const totalDriverPages = Math.max(1, Math.ceil(totalDrivers / 20));

  // Date range for fetching entries
  const dates = useMemo(() => {
    const monday = getMondayOf(currentDate);
    if (viewMode === "day") {
      return [currentDate];
    }
    return getDateRange(monday, 7);
  }, [currentDate, viewMode]);

  // Planning entries for selected driver
  const [entries, entriesLoading] = useApiDataWithLoading(
    () => selectedDriver
      ? api.planning.getEntries(activeScenarioId, dates, selectedDriver.id)
      : Promise.resolve([]),
    [selectedDriver?.id, activeScenarioId, dates.join(",")],
    [] as PlanningEntry[]
  );

  // Build date→entry map for quick lookup
  const entryMap = useMemo(() => {
    const map = new Map<string, PlanningEntry>();
    for (const e of entries) {
      map.set(e.date, e);
    }
    return map;
  }, [entries]);

  // Leave types for display
  const leaveTypes = useApiData(() => api.settings.getLeaveTypes(), [], []);
  const leaveTypeMap = useMemo(() => new Map(leaveTypes.map((l) => [l.id, l.description])), [leaveTypes]);


  // Navigation
  const navigateDate = useCallback((direction: -1 | 1) => {
    const offset = viewMode === "day" ? direction : direction * 7;
    const newDate = addDays(parseISO(currentDate), offset).toISOString().split("T")[0];
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setCurrentDate(viewMode === "week" ? getMondayOf(today) : today);
  }, [viewMode]);

  // When switching to week mode, snap to Monday
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "week") {
      setCurrentDate(getMondayOf(currentDate));
    }
  }, [currentDate]);

  // --- Driver selector screen ---
  if (!selectedDriver) {
    return (
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Zoek chauffeur..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field w-full pl-9"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                  aria-label="Zoekopdracht wissen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Instruction */}
          <div className="px-3 py-2 bg-surface-secondary">
            <p className="text-xs text-text-tertiary">
              Selecteer een chauffeur om de planning te bekijken.
            </p>
          </div>
        </div>

        {/* Driver list */}
        {driversLoading && drivers.length === 0 ? (
          <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center">
            <div className="spinner mb-2 mx-auto" />
            <div className="text-sm text-text-tertiary">Chauffeurs laden...</div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center text-text-tertiary text-sm">
            {search
              ? `Geen chauffeurs gevonden voor "${search}"`
              : "Geen actieve chauffeurs gevonden."}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {drivers.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDriver(d)}
                className="mobile-planning-driver-card"
                aria-label={`Planning bekijken voor ${d.lastName}, ${d.firstName}`}
              >
                <div className="flex items-center gap-3">
                  <div className="mobile-planning-driver-avatar">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-text-primary truncate">
                      {d.lastName}, {d.firstName}
                    </div>
                    {d.employeeNumber && (
                      <div className="text-xs text-text-tertiary">
                        Nr. {d.employeeNumber}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalDrivers > 20 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-tertiary">
              {Math.min((driverPage - 1) * 20 + 1, totalDrivers)}–{Math.min(driverPage * 20, totalDrivers)} van {totalDrivers}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                disabled={driverPage <= 1}
                className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Vorige pagina"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-text-secondary px-1.5 min-w-[3rem] text-center">
                {driverPage} / {totalDriverPages}
              </span>
              <button
                onClick={() => setDriverPage((p) => Math.min(totalDriverPages, p + 1))}
                disabled={driverPage >= totalDriverPages}
                className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Volgende pagina"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Planning view for selected driver ---
  const monday = getMondayOf(currentDate);

  return (
    <div className="flex flex-col gap-3">
      {/* Driver header + back */}
      <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button
            onClick={() => setSelectedDriver(null)}
            className="btn-icon flex-shrink-0"
            aria-label="Terug naar chauffeurlijst"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-text-primary truncate">
              {selectedDriver.lastName}, {selectedDriver.firstName}
            </div>
            {selectedDriver.employeeNumber && (
              <div className="text-xs text-text-tertiary">Nr. {selectedDriver.employeeNumber}</div>
            )}
          </div>
        </div>

        {/* View mode toggle + today button */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border-subtle bg-surface-secondary">
          <div className="mobile-planning-view-toggle">
            <button
              onClick={() => handleViewModeChange("day")}
              className={cn(
                "mobile-planning-view-toggle-btn",
                viewMode === "day" && "mobile-planning-view-toggle-btn--active"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Dag
            </button>
            <button
              onClick={() => handleViewModeChange("week")}
              className={cn(
                "mobile-planning-view-toggle-btn",
                viewMode === "week" && "mobile-planning-view-toggle-btn--active"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Week
            </button>
          </div>
          <button
            onClick={goToToday}
            className="text-xs font-medium text-brand-600 active:text-brand-800 px-2 py-1"
          >
            Vandaag
          </button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="btn-icon"
          aria-label={viewMode === "day" ? "Vorige dag" : "Vorige week"}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium text-text-primary text-center">
          {viewMode === "day"
            ? formatShortDate(currentDate)
            : formatWeekHeader(monday)
          }
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="btn-icon"
          aria-label={viewMode === "day" ? "Volgende dag" : "Volgende week"}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Status content */}
      {entriesLoading && entries.length === 0 ? (
        <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center">
          <div className="spinner mb-2 mx-auto" />
          <div className="text-sm text-text-tertiary">Planning laden...</div>
        </div>
      ) : viewMode === "day" ? (
        // Day view: single status block
        <DayStatusBlock
          date={currentDate}
          entry={entryMap.get(currentDate)}
          leaveTypeMap={leaveTypeMap}
        />
      ) : (
        // Week view: 7 day blocks
        <div className="flex flex-col gap-1.5">
          {dates.map((date) => (
            <DayStatusBlock
              key={date}
              date={date}
              entry={entryMap.get(date)}
              leaveTypeMap={leaveTypeMap}
              showDate
            />
          ))}
        </div>
      )}

      {/* Status legend */}
      <div className="bg-surface-primary rounded-lg shadow-card p-3">
        <div className="text-xs font-medium text-text-secondary mb-2">Legenda</div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as PlanningStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", getStatusDotColor(status))} />
              <span className="text-xs text-text-secondary">{STATUS_LABELS[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function getStatusDotColor(status: PlanningStatus): string {
  const map: Record<PlanningStatus, string> = {
    ROSTER_FREE: "bg-surface-inset",
    BASE_ROSTER: "bg-success-700",
    AVAILABLE_EXTRA: "bg-success-300",
    LEAVE: "bg-warning-300",
    SICK: "bg-danger-500",
  };
  return map[status] || "bg-surface-inset";
}

function getStatusBgColor(status: PlanningStatus): string {
  const map: Record<PlanningStatus, string> = {
    ROSTER_FREE: "bg-surface-tertiary",
    BASE_ROSTER: "bg-success-50",
    AVAILABLE_EXTRA: "bg-success-50",
    LEAVE: "bg-warning-50",
    SICK: "bg-danger-50",
  };
  return map[status] || "bg-surface-tertiary";
}

function getStatusAccentColor(status: PlanningStatus): string {
  const map: Record<PlanningStatus, string> = {
    ROSTER_FREE: "border-l-surface-inset",
    BASE_ROSTER: "border-l-success-600",
    AVAILABLE_EXTRA: "border-l-success-400",
    LEAVE: "border-l-warning-400",
    SICK: "border-l-danger-500",
  };
  return map[status] || "border-l-surface-inset";
}

type DayStatusBlockProps = {
  date: string;
  entry: PlanningEntry | undefined;
  leaveTypeMap: Map<string, string>;
  showDate?: boolean;
};

function DayStatusBlock({ date, entry, leaveTypeMap, showDate }: DayStatusBlockProps) {
  const d = parseISO(date);
  const dayIdx = (d.getDay() + 6) % 7;
  const isWeekend = dayIdx >= 5;
  const status: PlanningStatus = entry?.status as PlanningStatus || "ROSTER_FREE";
  const isToday = date === new Date().toISOString().split("T")[0];

  // Additional info line
  let detail: string | null = null;
  if (status === "LEAVE" && entry?.leaveTypeId) {
    detail = leaveTypeMap.get(entry.leaveTypeId) || null;
  }
  if (status === "SICK" && entry?.sickPercentage !== undefined && entry.sickPercentage > 0) {
    detail = `${entry.sickPercentage}% aanwezig`;
  }
  if (entry?.notes) {
    detail = detail ? `${detail} — ${entry.notes}` : entry.notes;
  }

  return (
    <div
      className={cn(
        "mobile-planning-status-block border-l-4",
        getStatusBgColor(status),
        getStatusAccentColor(status),
        isToday && "ring-2 ring-brand-500/30",
        isWeekend && !entry && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showDate && (
            <span className={cn(
              "mobile-planning-day-label",
              isToday && "mobile-planning-day-label--today"
            )}>
              {DAY_LABELS[dayIdx]}
              <span className="ml-1 font-normal">{d.getDate()}</span>
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getStatusDotColor(status))} />
            <span className="text-sm font-medium text-text-primary">
              {STATUS_LABELS[status]}
            </span>
          </div>
        </div>
      </div>
      {detail && (
        <div className={cn("text-xs text-text-secondary mt-1", showDate && "ml-11")}>
          {detail}
        </div>
      )}
    </div>
  );
}
