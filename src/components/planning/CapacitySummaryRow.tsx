"use client";

import { memo, useState, useMemo } from "react";
import type { PlanningStatus, DensityLevel } from "@/domain/enums";
import { ALL_PLANNING_STATUSES, STATUS_COLORS, STATUS_CODES, STATUS_LABELS } from "@/domain/constants";

type ColumnHeader = { key: string; label: string; sub?: string; dates: string[] };

const DENSITY_FONT: Record<DensityLevel, string> = {
  spacious: "text-xs",
  comfortable: "text-[10px]",
  compact: "text-[9px]",
};

export const CapacitySummaryRow = memo(function CapacitySummaryRow({
  capacityData,
  columnHeaders,
  extraColumnCount,
  density,
  driverColWidth,
  extraColWidth,
  minCellWidth,
}: {
  capacityData: Record<string, Record<string, number>>;
  columnHeaders: ColumnHeader[];
  extraColumnCount: number;
  density: DensityLevel;
  driverColWidth: number;
  extraColWidth: number;
  minCellWidth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const fontSize = DENSITY_FONT[density];

  // Aggregate capacity data per column from the full-dataset API response
  const columnCounts = useMemo(() =>
    columnHeaders.map((col) => {
      const counts: Record<string, number> = {};
      for (const status of ALL_PLANNING_STATUSES) counts[status] = 0;

      for (const date of col.dates) {
        const dayCounts = capacityData[date];
        if (dayCounts) {
          for (const status of ALL_PLANNING_STATUSES) {
            counts[status] += dayCounts[status] || 0;
          }
        }
      }
      return counts;
    }),
    [columnHeaders, capacityData]
  );

  // Compact view: show only the "available" count (BASE_ROSTER + AVAILABLE_EXTRA)
  // Expanded view: show all statuses

  if (!expanded) {
    return (
      <tr className="grid-totals-row bg-brand-50/60">
        <td
          className={`px-2 py-1 sticky left-0 bg-brand-50 z-10 ${fontSize} font-semibold text-brand-700 cursor-pointer whitespace-nowrap grid-sticky-edge`}
          style={{ minWidth: driverColWidth }}
          onClick={() => setExpanded(true)}
          title="Klik om alle statussen te tonen"
        >
          ▸ Totalen (beschikbaar)
        </td>
        {Array.from({ length: extraColumnCount }).map((_, i) => (
          <td
            key={`extra-${i}`}
            className="sticky bg-brand-50 z-10"
            style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth }}
          />
        ))}
        {columnCounts.map((counts, i) => {
          const available = counts.BASE_ROSTER + counts.AVAILABLE_EXTRA;
          const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
          return (
            <td
              key={columnHeaders[i].key}
              className={`text-center py-0.5 ${fontSize}`}
              style={{ minWidth: minCellWidth }}
              title={ALL_PLANNING_STATUSES.map((s) => `${STATUS_LABELS[s]}: ${counts[s]}`).join("\n")}
            >
              <span className="font-semibold text-success-700">{available}</span>
              <span className="text-text-tertiary">/{total}</span>
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <>
      {ALL_PLANNING_STATUSES.map((status, statusIdx) => (
        <tr key={status} className={statusIdx === 0 ? "grid-totals-row bg-brand-50/40" : "bg-brand-50/40"}>
          <td
            className={`px-2 py-0.5 sticky left-0 bg-brand-50 z-10 ${fontSize} whitespace-nowrap grid-sticky-edge ${
              statusIdx === 0 ? "cursor-pointer font-semibold text-brand-700" : "pl-5 text-text-secondary"
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
              className="sticky bg-brand-50 z-10"
              style={{ left: driverColWidth + i * extraColWidth, minWidth: extraColWidth }}
            />
          ))}
          {columnCounts.map((counts, i) => (
            <td
              key={columnHeaders[i].key}
              className={`text-center py-0.5 ${fontSize} ${
                counts[status] > 0 ? "font-medium" : "text-text-tertiary"
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
