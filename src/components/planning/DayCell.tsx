"use client";

import { useState } from "react";
import type { PlanningEntry, PlanningStatus, StamtabelRecord } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { cn } from "@/lib/utils";

type Props = {
  entry?: PlanningEntry;
  driverId: string;
  date: string;
  compact?: boolean;
  baseRosterHours?: number;
  leaveTypes?: StamtabelRecord[];
  onUpdate: (driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) => void;
};

export function DayCell({ entry, driverId, date, compact, baseRosterHours, leaveTypes, onUpdate }: Props) {
  const [showSelector, setShowSelector] = useState(false);

  // Build hover title
  let title = "";
  if (entry) {
    if (entry.status === "BASE_ROSTER" && baseRosterHours !== undefined) {
      title = `Basisrooster: ${baseRosterHours} uur`;
    } else if (entry.status === "LEAVE" && entry.leaveTypeId && leaveTypes) {
      const lt = leaveTypes.find((l) => l.id === entry.leaveTypeId);
      title = lt ? `Verlof: ${lt.description}` : "Verlof";
    } else if (entry.status === "SICK") {
      title = entry.sickPercentage !== undefined && entry.sickPercentage > 0
        ? `Ziek (${entry.sickPercentage}% aanwezig)`
        : "Ziek (0% aanwezig)";
    }
    if (entry.notes) title += title ? ` — ${entry.notes}` : entry.notes;
  }

  return (
    <td className="relative border border-gray-200 p-0.5">
      <button
        onClick={() => setShowSelector(true)}
        className={cn(
          "w-full rounded-sm flex items-center justify-center transition-colors cursor-pointer",
          compact ? "h-7" : "h-10",
          entry ? "hover:opacity-80" : "bg-gray-50 hover:bg-gray-100"
        )}
        title={title || undefined}
      >
        {entry ? (
          <StatusBadge status={entry.status} compact sickPercentage={entry.sickPercentage} />
        ) : (
          <span className="text-gray-300 text-xs">-</span>
        )}
      </button>

      {showSelector && (
        <StatusSelector
          currentStatus={entry?.status}
          currentLeaveTypeId={entry?.leaveTypeId}
          currentSickPercentage={entry?.sickPercentage}
          onSelect={(status, options) => {
            onUpdate(driverId, date, status, options);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </td>
  );
}
