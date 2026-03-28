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
    <div className="flex rounded-lg border border-border-default overflow-hidden">
      {AGGREGATION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-brand-600 text-white"
              : "bg-surface-primary text-text-secondary hover:bg-surface-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
