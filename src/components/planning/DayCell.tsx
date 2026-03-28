"use client";

import { useState } from "react";
import type { PlanningEntry, PlanningStatus } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { cn } from "@/lib/utils";

type Props = {
  entry?: PlanningEntry;
  driverId: string;
  date: string;
  compact?: boolean;
  onUpdate: (driverId: string, date: string, status: PlanningStatus, notes?: string) => void;
};

export function DayCell({ entry, driverId, date, compact, onUpdate }: Props) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <td className="relative border border-gray-200 p-0.5">
      <button
        onClick={() => setShowSelector(true)}
        className={cn(
          "w-full rounded-sm flex items-center justify-center transition-colors cursor-pointer",
          compact ? "h-7" : "h-10",
          entry ? "hover:opacity-80" : "bg-gray-50 hover:bg-gray-100"
        )}
        title={entry?.notes || undefined}
      >
        {entry ? (
          <StatusBadge status={entry.status} compact />
        ) : (
          <span className="text-gray-300 text-xs">-</span>
        )}
      </button>

      {showSelector && (
        <StatusSelector
          currentStatus={entry?.status}
          onSelect={(status, notes) => {
            onUpdate(driverId, date, status, notes);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </td>
  );
}
