"use client";

import { memo, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PlanningStatus } from "@/domain/enums";
import { STATUS_LABELS, STATUS_CHART_COLORS, COMPARE_COLORS } from "@/domain/constants";

const CHART_STATUSES: PlanningStatus[] = [
  "BASE_ROSTER", "AVAILABLE_EXTRA", "ROSTER_FREE", "LEAVE", "SICK",
];

// Recharts requires plain strings for SVG stroke/fill props, so these mirror
// design tokens from globals.css. Keep the comments in sync with the tokens.
const AXIS_TICK_COLOR = "#9ca3af"; // var(--color-text-tertiary)
const AXIS_LABEL_COLOR = "#4b5563"; // var(--color-text-secondary)
const GRID_STROKE_COLOR = "#e2e5eb"; // var(--color-border-default)

type Props = {
  capacityData: Record<string, Record<PlanningStatus, number>>;
  columnHeaders: { key: string; label: string }[];
  compareData?: { name: string; data: Record<string, Record<PlanningStatus, number>> }[];
};

type TooltipPayloadEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

function CapacityChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface-primary border border-border-subtle rounded-md shadow-dropdown px-3 py-2 min-w-[180px]">
      <div className="text-caption font-medium text-text-secondary uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div
            key={`${entry.dataKey ?? idx}`}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary truncate">{entry.name}</span>
            </div>
            <span className="text-text-primary font-semibold tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapacityChartLegend({
  payload,
}: {
  payload?: { value?: string; color?: string }[];
}) {
  if (!payload || payload.length === 0) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2 text-xs text-text-secondary">
      {payload.map((entry, idx) => (
        <li key={`${entry.value ?? idx}`} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export const CapacityChart = memo(function CapacityChart({ capacityData, columnHeaders, compareData }: Props) {
  // Build chart data: each row = one date column
  const chartData = useMemo(() => columnHeaders.map((col) => {
    const row: Record<string, string | number> = { name: col.label };

    // Main scenario "available" total
    const d = capacityData[col.key];
    if (d) {
      for (const status of CHART_STATUSES) {
        row[status] = d[status] || 0;
      }
    }

    // Compare scenarios - show their "available" count
    if (compareData) {
      for (const scenario of compareData) {
        const sd = scenario.data[col.key];
        const available = sd
          ? (sd.BASE_ROSTER || 0) + (sd.AVAILABLE_EXTRA || 0)
          : 0;
        row[`compare_${scenario.name}`] = available;
      }
    }

    return row;
  }), [columnHeaders, capacityData, compareData]);

  return (
    <div className="bg-surface-primary rounded-lg shadow-card p-3 md:p-5">
      <ResponsiveContainer width="100%" height="100%" className="mobile-capacity-chart-container">
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke={GRID_STROKE_COLOR}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: AXIS_TICK_COLOR }}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE_COLOR }}
            stroke={AXIS_LABEL_COLOR}
          />
          <YAxis
            tick={{ fontSize: 11, fill: AXIS_TICK_COLOR }}
            tickLine={false}
            axisLine={false}
            width={32}
            stroke={AXIS_LABEL_COLOR}
          />
          <Tooltip
            content={<CapacityChartTooltip />}
            cursor={{ fill: GRID_STROKE_COLOR, fillOpacity: 0.25 }}
          />
          <Legend content={<CapacityChartLegend />} />
          {CHART_STATUSES.map((status) => (
            <Area
              key={status}
              type="monotone"
              dataKey={status}
              name={STATUS_LABELS[status]}
              stackId="main"
              fill={STATUS_CHART_COLORS[status]}
              stroke={STATUS_CHART_COLORS[status]}
              fillOpacity={0.6}
            />
          ))}
          {compareData?.map((scenario, i) => (
            <Area
              key={scenario.name}
              type="monotone"
              dataKey={`compare_${scenario.name}`}
              name={`${scenario.name} (beschikbaar)`}
              stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
