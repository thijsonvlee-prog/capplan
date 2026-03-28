"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { PlanningEntry, PlanningStatus, StamtabelRecord, DensityLevel } from "@/lib/store";
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

export function DayCell({ entry, driverId, date, compact, baseRosterHours, leaveTypes, density = "comfortable", onUpdate }: Props) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectorPos, setSelectorPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setSelectorPos({ top: rect.bottom, left: rect.left });
    }
    setShowSelector(true);
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onMouseDown={(e) => { e.stopPropagation(); }}
        onClick={handleClick}
        className={cn(
          "w-full rounded-sm flex items-center justify-center transition-colors cursor-pointer",
          h,
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

      {showSelector && createPortal(
        <div
          className="fixed z-50"
          style={{ top: selectorPos.top, left: selectorPos.left }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}
