"use client";

import { useState } from "react";
import type { PlanningStatus } from "@/domain/enums";
import { ALL_PLANNING_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/domain/constants";
import { useApiData } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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

  const leaveTypes = useApiData(() => api.settings.getLeaveTypes(), [], []);

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
    <div>
      {!showLeaveMenu && !showSickInput && (
        <div className="space-y-1">
          {ALL_PLANNING_STATUSES.map((status) => (
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
          <div className="text-xs font-semibold text-gray-500 px-3 mb-1">Aanwezigheidspercentage</div>
          <div className="text-xs text-gray-400 px-3 mb-2">Hoeveel procent is de chauffeur inzetbaar? (0% = volledig ziek)</div>
          <div className="px-3 space-y-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={99}
                value={sickPct}
                onChange={(e) => setSickPct(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                className="input-field flex-1"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSickConfirm(); }}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
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
