"use client";

import type { AggregationLevel } from "@/domain/enums";
import { cn } from "@/lib/utils";

const AGGREGATION_OPTIONS: { value: AggregationLevel; label: string }[] = [
  { value: "day", label: "Dag" },
  { value: "week", label: "Week" },
  { value: "4weeks", label: "4 Weken" },
  { value: "month", label: "Maand" },
  { value: "quarter", label: "Kwartaal" },
  { value: "year", label: "Jaar" },
];

type Props = {
  value: AggregationLevel;
  onChange: (level: AggregationLevel) => void;
};

export function ZoomSelector({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
      {AGGREGATION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
