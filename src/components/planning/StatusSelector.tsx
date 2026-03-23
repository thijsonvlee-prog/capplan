"use client";

import { useState, useRef, useEffect } from "react";
import type { PlanningStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_COLORS, cn } from "@/lib/utils";

const ALL_STATUSES: PlanningStatus[] = [
  "ROSTER_FREE",
  "BASE_ROSTER",
  "AVAILABLE_EXTRA",
  "LEAVE",
  "SICK",
  "HIRED",
];

type Props = {
  currentStatus?: PlanningStatus;
  onSelect: (status: PlanningStatus, notes?: string) => void;
  onClose: () => void;
};

export function StatusSelector({ currentStatus, onSelect, onClose }: Props) {
  const [notes, setNotes] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-52"
    >
      <div className="space-y-1">
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onSelect(status, notes || undefined)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
              status === currentStatus
                ? STATUS_COLORS[status] + " font-semibold"
                : "hover:bg-gray-100"
            )}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <input
          type="text"
          placeholder="Notitie..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentStatus) {
              onSelect(currentStatus, notes || undefined);
            }
          }}
        />
      </div>
    </div>
  );
}
