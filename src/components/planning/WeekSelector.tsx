"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { addDays, format, getISOWeek, getYear } from "date-fns";
import { nl } from "date-fns/locale";

type Props = {
  startDate: string; // YYYY-MM-DD
  dayCount: number;
  onChangeStart: (newStart: string) => void;
};

export function PeriodSelector({ startDate, dayCount, onChangeStart }: Props) {
  if (!startDate) return <div className="flex items-center gap-2"><span className="text-sm text-text-tertiary">Laden...</span></div>;

  const start = new Date(startDate + "T00:00:00");
  const end = addDays(start, dayCount - 1);

  const startLabel = format(start, "d MMM yyyy", { locale: nl });
  const endLabel = format(end, "d MMM yyyy", { locale: nl });
  const startWeek = getISOWeek(start);
  const endWeek = getISOWeek(end);
  const label = startWeek === endWeek
    ? `Wk ${startWeek} — ${startLabel}`
    : `Wk ${startWeek}–${endWeek} — ${startLabel} t/m ${endLabel}`;

  function shiftDays(n: number) {
    const d = addDays(start, n);
    onChangeStart(d.toISOString().split("T")[0]);
  }

  function goToToday() {
    const today = new Date();
    // Snap to Monday
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(today, mondayOffset);
    onChangeStart(monday.toISOString().split("T")[0]);
  }

  // Shift by roughly one "page" (half the dayCount for overlap)
  const shiftAmount = Math.max(7, Math.floor(dayCount / 2));

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shiftDays(-shiftAmount)} className="btn-icon p-1" title="Eerder">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToToday}
        className="p-1 rounded hover:bg-surface-tertiary transition-colors text-brand-600"
        title="Vandaag"
      >
        <Home className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold min-w-[280px] text-center">{label}</span>
      <button onClick={() => shiftDays(shiftAmount)} className="btn-icon p-1" title="Later">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
