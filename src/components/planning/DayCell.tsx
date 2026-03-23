"use client";

import { useState } from "react";
import type { PlanningEntry, PlanningStatus } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { cn } from "@/lib/utils";

type Props = {
  entry?: PlanningEntry;
  driverId: string;
  date: string;
  onUpdate: (driverId: string, date: string, status: PlanningStatus, notes?: string) => void;
  readonly?: boolean;
};

export function DayCell({ entry, driverId, date, onUpdate, readonly }: Props) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <td className="relative border border-gray-200 p-1">
      <button
        onClick={() => !readonly && setShowSelector(true)}
        className={cn(
          "w-full h-10 rounded-md flex items-center justify-center transition-colors",
          entry
            ? "cursor-pointer hover:opacity-80"
            : "bg-gray-50 hover:bg-gray-100 cursor-pointer",
          readonly && "cursor-default hover:opacity-100"
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
