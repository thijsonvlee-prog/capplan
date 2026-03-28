"use client";

import { memo, useState } from "react";
import type { PlanningStatus, DensityLevel } from "@/domain/enums";
import type { DriverWithEntries } from "@/domain/types";
import { ALL_PLANNING_STATUSES, STATUS_COLORS, STATUS_CODES, STATUS_LABELS } from "@/domain/constants";

// POC EXPERIMENT: Capacity Summary Row
// Shows per-column status totals at the bottom of the planning grid.
// To remove: delete this file + remove import/usage from PlanningGrid.tsx

type ColumnHeader = { key: string; label: string; sub?: string; dates: string[] };

const DENSITY_FONT: Record<DensityLevel, string> = {
  spacious: "text-xs",
  comfortable: "text-[10px]",
  compact: "text-[9px]",
};

export const CapacitySummaryRow = memo(function CapacitySummaryRow({
  drivers,
  columnHeaders,
  extraColumnCount,
  density,
  driverColWidth,
  extraColWidth,
  minCellWidth,
}: {
  drivers: DriverWithEntries[];
  columnHeaders: ColumnHeader[];
  extraColumnCount: number;
  density: DensityLevel;
  driverColWidth: number;
  extraColWidth: number;
  minCellWidth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const fontSize = DENSITY_FONT[density];

  // Pre-compute: for each column, count statuses
  const columnCounts = columnHeaders.map((col) => {
    const counts: Record<string, number> = {};
    for (const status of ALL_PLANNING_STATUSES) counts[status] = 0;

    for (const driver of drivers) {
      for (const date of col.dates) {
        const entry = driver.planningEntries.find((e) => e.date === date);
        if (entry) {
          counts[entry.status] = (counts[entry.status] || 0) + 1;
        }
      }
    }
    return counts;
  });

  // Compact view: show only the "available" count (BASE_ROSTER + AVAILABLE_EXTRA)
  // Expanded view: show all statuses

  if (!expanded) {
    return (
      <tr className="bg-blue-50/60 border-t-2 border-blue-200">
        <td
          className={`px-2 py-1 border border-gray-200 sticky left-0 bg-blue-50 z-10 ${fontSize} font-semibold text-blue-700 cursor-pointer whitespace-nowrap`}
          style={{ minWidth: driverColWidth }}
          onClick={() => setExpanded(true)}
          title="Klik om alle statussen te tonen"
        >
          ▸ Totalen (beschikbaar)
        </td>
        {Array.from({ length: extraColumnCount }).map((_, i) => (
          <td
            key={`extra-${i}`}
            className="border border-gray-200 sticky bg-blue-50 z-10"
            style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth }}
          />
        ))}
        {columnCounts.map((counts, i) => {
          const available = counts.BASE_ROSTER + counts.AVAILABLE_EXTRA;
          const total = drivers.length * columnHeaders[i].dates.length;
          return (
            <td
              key={columnHeaders[i].key}
              className={`border border-gray-200 text-center py-0.5 ${fontSize}`}
              style={{ minWidth: minCellWidth }}
              title={ALL_PLANNING_STATUSES.map((s) => `${STATUS_LABELS[s]}: ${counts[s]}`).join("\n")}
            >
              <span className="font-semibold text-green-700">{available}</span>
              <span className="text-gray-400">/{total}</span>
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <>
      {ALL_PLANNING_STATUSES.map((status, statusIdx) => (
        <tr key={status} className="bg-blue-50/40">
          <td
            className={`px-2 py-0.5 border border-gray-200 sticky left-0 bg-blue-50 z-10 ${fontSize} whitespace-nowrap ${
              statusIdx === 0 ? "cursor-pointer font-semibold text-blue-700" : "pl-5 text-gray-600"
            }`}
            style={{ minWidth: driverColWidth }}
            onClick={statusIdx === 0 ? () => setExpanded(false) : undefined}
            title={statusIdx === 0 ? "Klik om samen te vouwen" : undefined}
          >
            {statusIdx === 0 ? "▾ " : ""}
            <span className={`inline-block w-3 h-3 rounded-sm mr-1 align-middle ${STATUS_COLORS[status].split(" ")[0]}`} />
            {STATUS_CODES[status]} {STATUS_LABELS[status]}
          </td>
          {Array.from({ length: extraColumnCount }).map((_, i) => (
            <td
              key={`extra-${i}`}
              className="border border-gray-200 sticky bg-blue-50 z-10"
              style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth }}
            />
          ))}
          {columnCounts.map((counts, i) => (
            <td
              key={columnHeaders[i].key}
              className={`border border-gray-200 text-center py-0.5 ${fontSize} ${
                counts[status] > 0 ? "font-medium" : "text-gray-300"
              }`}
              style={{ minWidth: minCellWidth }}
            >
              {counts[status] > 0 ? counts[status] : "-"}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
});
