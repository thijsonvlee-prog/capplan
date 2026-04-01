"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight, User, Home } from "lucide-react";
import { useApiData, useApiDataWithLoading } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { useHeaderSubtitle } from "@/hooks/useHeaderSubtitle";
import { getDateRange, cn } from "@/lib/utils";
import { STATUS_LABELS, DAY_LABELS, MONTH_SHORT } from "@/domain/constants";
import type { PlanningEntry, Driver } from "@/domain/types";
import type { PlanningStatus } from "@/domain/enums";
import { addDays, addMonths, subMonths, parseISO, getISOWeek, startOfMonth, endOfMonth, getDay } from "date-fns";

const DEFAULT_PAGINATED = { data: [] as Driver[], total: 0, page: 1, pageSize: 20 };

const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

/** Get the Monday on or before the given date */
function getMondayOf(date: Date): Date {
  const day = getDay(date);
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

/** Get the Sunday on or after the given date */
function getSundayOf(date: Date): Date {
  const day = getDay(date);
  if (day === 0) return date;
  return addDays(date, 7 - day);
}

/** Build the calendar grid for a given month (year, monthIndex 0-based).
 *  Returns an array of weeks, each with 7 date strings (Mon-Sun).
 *  Includes leading/trailing days from adjacent months. */
function buildCalendarGrid(year: number, month: number): string[][] {
  const firstDay = startOfMonth(new Date(year, month, 1));
  const lastDay = endOfMonth(firstDay);
  const gridStart = getMondayOf(firstDay);
  const gridEnd = getSundayOf(lastDay);

  const weeks: string[][] = [];
  let current = gridStart;
  while (current <= gridEnd) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current.toISOString().split("T")[0]);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

interface MobilePlanningViewProps {
  onBackToHome?: () => void;
}

export function MobilePlanningView({ onBackToHome }: MobilePlanningViewProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

  // Calendar grid for the current month
  const calendarWeeks = useMemo(
    () => buildCalendarGrid(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  // All dates needed for the calendar (includes leading/trailing days)
  const allDates = useMemo(() => calendarWeeks.flat(), [calendarWeeks]);

  // Planning entries for selected driver across the full calendar grid
  const [entries, entriesLoading] = useApiDataWithLoading(
    () => selectedDriver
      ? api.planning.getEntries(activeScenarioId, allDates, selectedDriver.id)
      : Promise.resolve([]),
    [selectedDriver?.id, activeScenarioId, allDates.join(",")],
    [] as PlanningEntry[]
  );

  // Build date→entry map
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
  const navigateMonth = useCallback((direction: -1 | 1) => {
    setCurrentMonth((prev) => {
      const d = direction === 1
        ? addMonths(new Date(prev.year, prev.month, 1), 1)
        : subMonths(new Date(prev.year, prev.month, 1), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(now.toISOString().split("T")[0]);
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // --- Driver selector screen ---
  if (!selectedDriver) {
    return (
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="btn-icon flex-shrink-0 -ml-1"
                  aria-label="Terug naar startscherm"
                >
                  <Home className="w-[1.125rem] h-[1.125rem]" />
                </button>
              )}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
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

  // --- Month calendar view for selected driver ---
  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : undefined;
  const selectedStatus: PlanningStatus = (selectedEntry?.status as PlanningStatus) || "ROSTER_FREE";

  return (
    <div className="flex flex-col gap-3">
      {/* Driver header + back + month navigation */}
      <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button
            onClick={() => { setSelectedDriver(null); setSelectedDate(null); }}
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
          <button
            onClick={goToToday}
            className="text-xs font-medium text-brand-600 active:text-brand-800 px-2 py-1"
          >
            Vandaag
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border-subtle bg-surface-secondary">
          <button
            onClick={() => navigateMonth(-1)}
            className="btn-icon"
            aria-label="Vorige maand"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-text-primary">
            {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="btn-icon"
            aria-label="Volgende maand"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      {entriesLoading && entries.length === 0 ? (
        <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center">
          <div className="spinner mb-2 mx-auto" />
          <div className="text-sm text-text-tertiary">Planning laden...</div>
        </div>
      ) : (
        <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
          {/* Day headers */}
          <div className="mobile-calendar-header">
            <div className="mobile-calendar-week-num" />
            {DAY_LABELS.map((label) => (
              <div key={label} className="mobile-calendar-day-header">
                {label}
              </div>
            ))}
          </div>

          {/* Week rows */}
          {calendarWeeks.map((week) => {
            const weekNum = getISOWeek(parseISO(week[0]));
            return (
              <div key={week[0]} className="mobile-calendar-row">
                <div className="mobile-calendar-week-num">
                  {weekNum}
                </div>
                {week.map((dateStr) => {
                  const d = parseISO(dateStr);
                  const isCurrentMonth = d.getMonth() === currentMonth.month;
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const entry = entryMap.get(dateStr);
                  const status: PlanningStatus = (entry?.status as PlanningStatus) || "ROSTER_FREE";
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={cn(
                        "mobile-calendar-cell",
                        !isCurrentMonth && "opacity-30",
                        isWeekend && isCurrentMonth && !entry && "opacity-50",
                        isSelected && "mobile-calendar-cell--selected",
                      )}
                      aria-label={`${d.getDate()} ${MONTH_SHORT[d.getMonth()]} — ${STATUS_LABELS[status]}`}
                    >
                      <span className={cn(
                        "mobile-calendar-day-number",
                        isToday && "mobile-calendar-day-number--today",
                      )}>
                        {d.getDate()}
                      </span>
                      <span className={cn("mobile-calendar-status-dot", getStatusDotColor(status))} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel for selected date */}
      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          entry={selectedEntry}
          status={selectedStatus}
          leaveTypeMap={leaveTypeMap}
        />
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

// --- Sub-components & helpers ---

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

type DayDetailPanelProps = {
  date: string;
  entry: PlanningEntry | undefined;
  status: PlanningStatus;
  leaveTypeMap: Map<string, string>;
};

function DayDetailPanel({ date, entry, status, leaveTypeMap }: DayDetailPanelProps) {
  const d = parseISO(date);
  const dayIdx = (d.getDay() + 6) % 7; // Mon=0
  const dayName = DAY_LABELS[dayIdx];
  const monthName = MONTH_SHORT[d.getMonth()].toLowerCase();

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
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary">
            {dayName} {d.getDate()} {monthName} {d.getFullYear()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getStatusDotColor(status))} />
        <span className="text-sm font-medium text-text-primary">
          {STATUS_LABELS[status]}
        </span>
      </div>
      {detail && (
        <div className="text-xs text-text-secondary mt-1.5 ml-3.5">
          {detail}
        </div>
      )}
    </div>
  );
}
