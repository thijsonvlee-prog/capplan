"use client";

import type { PlanningStatus } from "@/domain/enums";
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from "@/domain/constants";
import { cn } from "@/lib/utils";

import { ALL_PLANNING_STATUSES } from "@/domain/constants";

const ALL_STATUSES = ALL_PLANNING_STATUSES;

type Props = {
  capacityData: Record<string, Record<PlanningStatus, number>>;
  columnHeaders: { key: string; label: string }[];
};

export function CapacityTable({ capacityData, columnHeaders }: Props) {
  const totalDrivers = (dateKey: string) =>
    ALL_STATUSES.reduce((sum, s) => sum + (capacityData[dateKey]?.[s] || 0), 0);

  const availableDrivers = (dateKey: string) =>
    (capacityData[dateKey]?.BASE_ROSTER || 0) +
    (capacityData[dateKey]?.AVAILABLE_EXTRA || 0);

  return (
    <div className="overflow-x-auto bg-surface-primary rounded-lg shadow-card border border-border-subtle">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-tertiary border-b border-border-subtle">
            <th className="text-left p-2 text-label font-semibold min-w-[140px]">Status</th>
            {columnHeaders.map((col) => (
              <th key={col.key} className="p-2 text-center text-label font-medium min-w-[50px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_STATUSES.map((status, idx) => (
            <tr key={status} className={cn(
              "hover:bg-surface-secondary transition-colors",
              idx % 2 === 1 && "bg-surface-secondary/50",
              idx < ALL_STATUSES.length - 1 && "border-b border-border-subtle"
            )}>
              <td className="p-2">
                <span className={cn("status-chip-compact", STATUS_COLORS[status])}>
                  <span className={cn("status-dot", STATUS_DOT_COLORS[status])} aria-hidden="true" />
                  {STATUS_LABELS[status]}
                </span>
              </td>
              {columnHeaders.map((col) => (
                <td key={col.key} className="p-2 text-center text-xs text-text-secondary">
                  {capacityData[col.key]?.[status] || 0}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-surface-tertiary border-t border-border-default">
            <td className="p-2 text-xs font-semibold text-text-primary">Beschikbaar</td>
            {columnHeaders.map((col) => (
              <td key={col.key} className="p-2 text-center text-xs font-semibold text-success-700">
                {availableDrivers(col.key)}
              </td>
            ))}
          </tr>
          <tr className="bg-surface-tertiary border-t border-border-subtle">
            <td className="p-2 text-xs font-semibold text-text-primary">Totaal ingepland</td>
            {columnHeaders.map((col) => (
              <td key={col.key} className="p-2 text-center text-xs font-semibold text-text-primary">
                {totalDrivers(col.key)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
