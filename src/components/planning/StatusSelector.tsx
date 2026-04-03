"use client";

import { useState } from "react";
import type { PlanningStatus } from "@/domain/enums";
import { ALL_PLANNING_STATUSES, STATUS_LABELS, STATUS_DOT_COLORS } from "@/domain/constants";
import { useApiData } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

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
        <div className="space-y-0.5">
          {ALL_PLANNING_STATUSES.map((status) => {
            const isActive = status === currentStatus;
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2.5",
                  isActive
                    ? "bg-surface-tertiary font-medium"
                    : "hover:bg-surface-secondary"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", STATUS_DOT_COLORS[status])} />
                <span className="flex-1">{STATUS_LABELS[status]}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                {(status === "LEAVE" || status === "SICK") && !isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {showLeaveMenu && (
        <div>
          <button
            onClick={() => setShowLeaveMenu(false)}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mb-2 px-1 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Terug
          </button>
          <div className="text-caption uppercase tracking-wide px-2.5 mb-1.5">Verloftype</div>
          <div className="space-y-0.5">
            {leaveTypes.map((lt) => {
              const isActive = currentLeaveTypeId === lt.id;
              return (
                <button
                  key={lt.id}
                  onClick={() => handleLeaveSelect(lt.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2",
                    isActive ? "bg-warning-200 text-warning-900 font-medium" : "hover:bg-surface-secondary"
                  )}
                >
                  <span className="text-xs text-text-tertiary shrink-0 w-5">{lt.code}</span>
                  <span className="flex-1">{lt.description}</span>
                  {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
            {leaveTypes.length === 0 && (
              <div className="text-xs text-text-tertiary px-2.5 py-2">
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
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mb-2 px-1 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Terug
          </button>
          <div className="text-caption uppercase tracking-wide px-2.5 mb-1">Aanwezigheid</div>
          <div className="text-xs text-text-tertiary px-2.5 mb-2">Hoeveel procent is de chauffeur inzetbaar? (0% = volledig ziek)</div>
          <div className="px-2.5 space-y-2">
            <div className="flex items-center gap-1.5">
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
              <span className="text-sm text-text-secondary">%</span>
            </div>
            <button
              onClick={handleSickConfirm}
              className="btn-primary w-full justify-center bg-danger-500 hover:bg-danger-600"
            >
              Bevestigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
