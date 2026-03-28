"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ZoomLevel } from "@/lib/store";

type Props = {
  year: number;
  week: number;
  month: number;
  zoom: ZoomLevel;
  onChange: (year: number, week: number, month: number) => void;
};

export function PeriodSelector({ year, week, month, zoom, onChange }: Props) {
  function prev() {
    switch (zoom) {
      case "week":
        onChange(week <= 1 ? year - 1 : year, week <= 1 ? 52 : week - 1, month);
        break;
      case "4weeks":
        onChange(week <= 4 ? year - 1 : year, week <= 4 ? 52 - (4 - week) : week - 4, month);
        break;
      case "month":
        onChange(month <= 1 ? year - 1 : year, week, month <= 1 ? 12 : month - 1);
        break;
      case "year":
        onChange(year - 1, week, month);
        break;
    }
  }

  function next() {
    switch (zoom) {
      case "week":
        onChange(week >= 52 ? year + 1 : year, week >= 52 ? 1 : week + 1, month);
        break;
      case "4weeks":
        onChange(week >= 49 ? year + 1 : year, week >= 49 ? week + 4 - 52 : week + 4, month);
        break;
      case "month":
        onChange(month >= 12 ? year + 1 : year, week, month >= 12 ? 1 : month + 1);
        break;
      case "year":
        onChange(year + 1, week, month);
        break;
    }
  }

  const MONTH_NAMES = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

  let label = "";
  switch (zoom) {
    case "week":
      label = `Week ${week}, ${year}`;
      break;
    case "4weeks":
      label = `Week ${week}–${Math.min(week + 3, 52)}, ${year}`;
      break;
    case "month":
      label = `${MONTH_NAMES[month - 1]} ${year}`;
      break;
    case "year":
      label = `${year}`;
      break;
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={prev} className="p-1 rounded hover:bg-gray-200 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-semibold min-w-[180px] text-center">{label}</span>
      <button onClick={next} className="p-1 rounded hover:bg-gray-200 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
