"use client";

import { memo, useState } from "react";
import type { PlanningStatus, DensityLevel } from "@/domain/enums";
import type { PlanningEntry, StamtabelRecord } from "@/domain/types";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { cn } from "@/lib/utils";

const DENSITY_HEIGHT: Record<DensityLevel, string> = {
  spacious: "h-10",
  comfortable: "h-8",
  compact: "h-6",
};

type Props = {
  entry?: PlanningEntry;
  driverId: string;
  date: string;
  compact?: boolean;
  baseRosterHours?: number;
  leaveTypes?: StamtabelRecord[];
  density?: DensityLevel;
  onUpdate: (driverId: string, date: string, status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) => void;
};

export const DayCell = memo(function DayCell({ entry, driverId, date, compact, baseRosterHours, leaveTypes, density = "comfortable", onUpdate }: Props) {
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

  const h = DENSITY_HEIGHT[density];

  return (
    <>
      <button
        onMouseDown={(e) => { e.stopPropagation(); }}
        onClick={() => setShowSelector(true)}
        className={cn(
          "w-full rounded-sm flex items-center justify-center transition-colors cursor-pointer",
          h,
          entry ? "hover:opacity-80" : "bg-surface-secondary hover:bg-surface-tertiary"
        )}
        title={title || undefined}
      >
        {entry ? (
          <StatusBadge status={entry.status} compact sickPercentage={entry.sickPercentage} />
        ) : (
          <span className="text-text-tertiary text-xs">-</span>
        )}
      </button>

      {showSelector && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={`Status instellen — ${date}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowSelector(false);
          }}
        >
          <div
            className="fixed inset-0 bg-black/10"
          />
          <div
            className="fixed z-50 bg-surface-primary rounded-lg shadow-dropdown border border-border-default p-2 w-56"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-medium text-text-secondary mb-2 px-1">
              Status instellen — {date}
            </div>
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
          </div>
        </div>
      )}
    </>
  );
});
