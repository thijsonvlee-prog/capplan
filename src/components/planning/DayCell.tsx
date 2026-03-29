"use client";

import { memo, useState, useRef } from "react";
import type { PlanningStatus, DensityLevel } from "@/domain/enums";
import type { PlanningEntry, StamtabelRecord } from "@/domain/types";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { useFocusTrap } from "@/hooks/useFocusTrap";
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

const POPUP_WIDTH = 224; // w-56 = 14rem
const POPUP_MAX_HEIGHT = 280;
const VIEWPORT_PAD = 8;

export const DayCell = memo(function DayCell({ entry, driverId, date, compact, baseRosterHours, leaveTypes, density = "comfortable", onUpdate }: Props) {
  const [showSelector, setShowSelector] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const focusTrapRef = useFocusTrap();

  function openSelector() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let top = rect.bottom + 4;
      let left = rect.left;

      if (top + POPUP_MAX_HEIGHT > window.innerHeight - VIEWPORT_PAD) {
        top = rect.top - POPUP_MAX_HEIGHT - 4;
      }
      if (left + POPUP_WIDTH > window.innerWidth - VIEWPORT_PAD) {
        left = window.innerWidth - POPUP_WIDTH - VIEWPORT_PAD;
      }
      if (left < VIEWPORT_PAD) {
        left = VIEWPORT_PAD;
      }
      if (top < VIEWPORT_PAD) {
        top = VIEWPORT_PAD;
      }

      setPopupPos({ top, left });
    }
    setShowSelector(true);
  }

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
        ref={buttonRef}
        onMouseDown={(e) => { e.stopPropagation(); }}
        onClick={openSelector}
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
          onKeyDown={(e) => { if (e.key === "Escape") setShowSelector(false); }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowSelector(false);
          }}
        >
          <div
            ref={focusTrapRef}
            className="fixed z-50 bg-surface-primary rounded-lg shadow-dropdown border border-border-subtle p-3 w-56"
            style={popupPos ? { top: popupPos.top, left: popupPos.left } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-caption uppercase tracking-wide mb-2 px-1">
              {date}
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
