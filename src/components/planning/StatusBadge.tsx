"use client";

import type { PlanningStatus } from "@/domain/enums";
import { STATUS_LABELS, STATUS_COLORS, STATUS_CODES } from "@/domain/constants";
import { cn } from "@/lib/utils";

type Props = {
  status: PlanningStatus;
  compact?: boolean;
  sickPercentage?: number;
};

export function StatusBadge({ status, compact, sickPercentage }: Props) {
  // Sick with attendance > 0: show split red/green
  if (status === "SICK" && sickPercentage !== undefined && sickPercentage > 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md font-medium overflow-hidden",
          compact ? "text-xs" : "text-sm"
        )}
        style={{
          background: `linear-gradient(to right, var(--color-danger-500) ${100 - sickPercentage}%, var(--color-success-500) ${100 - sickPercentage}%)`,
          color: "var(--color-text-inverse)",
          padding: compact ? "2px 6px" : "4px 8px",
        }}
      >
        {compact ? `${STATUS_CODES[status]}${sickPercentage}` : `${STATUS_LABELS[status]} (${sickPercentage}%)`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        STATUS_COLORS[status]
      )}
    >
      {compact ? STATUS_CODES[status] : STATUS_LABELS[status]}
    </span>
  );
}
