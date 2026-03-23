"use client";

import { cn, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import type { PlanningStatus } from "@prisma/client";

type Props = {
  status: PlanningStatus;
  compact?: boolean;
};

export function StatusBadge({ status, compact }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        STATUS_COLORS[status]
      )}
    >
      {compact ? status.charAt(0) : STATUS_LABELS[status]}
    </span>
  );
}
