"use client";

import { useState, useRef, useEffect } from "react";
import type { PlanningStatus } from "@/lib/store";
import { useStore, getLeaveTypes } from "@/lib/store";
import { STATUS_LABELS, STATUS_COLORS, cn } from "@/lib/utils";

const MAIN_STATUSES: PlanningStatus[] = [
  "ROSTER_FREE",
  "BASE_ROSTER",
  "AVAILABLE_EXTRA",
  "LEAVE",
  "SICK",
];

type Props = {
  currentStatus?: PlanningStatus;
  currentLeaveTypeId?: string;
  currentSickPercentage?: number;
  onSelect: (status: PlanningStatus, options?: { leaveTypeId?: string; sickPercentage?: number; notes?: string }) => void;
  onClose: () => void;
};

export function StatusSelector({ currentStatus, currentLeaveTypeId, currentSickPercentage, onSelect, onClose }: Props) {
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);
  const [showSickInput, setShowSickInput] = useState(false);
  const [sickPct, setSickPct] = useState(currentSickPercentage ?? 0);
  const ref = useRef<HTMLDivElement>(null);

  const leaveTypes = useStore(() => getLeaveTypes());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleStatusClick(status: PlanningStatus) {
    if (status === "LEAVE") {
      setShowLeaveMenu(true);
      setShowSickInput(false);
      return;
    }
    if (status === "SICK") {
      setShowSickInput(true);
      setShowLeaveMenu(false);
      return;
    }
    onSelect(status);
  }

  function handleLeaveSelect(leaveTypeId: string) {
    onSelect("LEAVE", { leaveTypeId });
  }

  function handleSickConfirm() {
    onSelect("SICK", { sickPercentage: sickPct });
  }

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-56"
      style={{ left: 0, top: "100%" }}
    >
      {!showLeaveMenu && !showSickInput && (
        <div className="space-y-1">
          {MAIN_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
                status === currentStatus
                  ? STATUS_COLORS[status] + " font-semibold"
                  : "hover:bg-gray-100"
              )}
            >
              <span>{STATUS_LABELS[status]}</span>
              {(status === "LEAVE" || status === "SICK") && (
                <span className="text-gray-400 text-xs">&#9654;</span>
              )}
            </button>
          ))}
        </div>
      )}

      {showLeaveMenu && (
        <div>
          <button
            onClick={() => setShowLeaveMenu(false)}
            className="text-xs text-blue-600 hover:underline mb-2 px-1"
          >
            &#9664; Terug
          </button>
          <div className="text-xs font-semibold text-gray-500 px-3 mb-1">Verloftype</div>
          <div className="space-y-1">
            {leaveTypes.map((lt) => (
              <button
                key={lt.id}
                onClick={() => handleLeaveSelect(lt.id)}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                  currentLeaveTypeId === lt.id ? "bg-yellow-200 text-yellow-900 font-semibold" : "hover:bg-gray-100"
                )}
              >
                <span className="text-xs text-gray-400 mr-2">{lt.code}</span>
                {lt.description}
              </button>
            ))}
            {leaveTypes.length === 0 && (
              <div className="text-xs text-gray-400 px-3 py-2">
                Geen verloftypes. Voeg toe via Instellingen.
              </div>
            )}
          </div>
        </div>
      )}

      {showSickInput && (
        <div>
          <button
            onClick={() => setShowSickInput(false)}
            className="text-xs text-blue-600 hover:underline mb-2 px-1"
          >
            &#9664; Terug
          </button>
          <div className="text-xs font-semibold text-gray-500 px-3 mb-2">Aanwezigheidspercentage (0–99)</div>
          <div className="px-3 space-y-2">
            <input
              type="number"
              min={0}
              max={99}
              value={sickPct}
              onChange={(e) => setSickPct(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSickConfirm(); }}
            />
            <button
              onClick={handleSickConfirm}
              className="w-full bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
            >
              Bevestigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
