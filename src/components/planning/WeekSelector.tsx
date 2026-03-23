"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  year: number;
  week: number;
  onChange: (year: number, week: number) => void;
};

export function WeekSelector({ year, week, onChange }: Props) {
  function prevWeek() {
    if (week <= 1) {
      onChange(year - 1, 52);
    } else {
      onChange(year, week - 1);
    }
  }

  function nextWeek() {
    if (week >= 52) {
      onChange(year + 1, 1);
    } else {
      onChange(year, week + 1);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prevWeek}
        className="p-1 rounded hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-semibold min-w-[140px] text-center">
        Week {week}, {year}
      </span>
      <button
        onClick={nextWeek}
        className="p-1 rounded hover:bg-gray-200 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
