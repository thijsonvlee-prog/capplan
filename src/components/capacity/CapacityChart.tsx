"use client";

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
import type { PlanningStatus } from "@/lib/store";
import { STATUS_LABELS, STATUS_CHART_COLORS } from "@/lib/utils";

const CHART_STATUSES: PlanningStatus[] = [
  "BASE_ROSTER", "AVAILABLE_EXTRA", "HIRED", "ROSTER_FREE", "LEAVE", "SICK",
];

type Props = {
  capacityData: Record<string, Record<PlanningStatus, number>>;
  columnHeaders: { key: string; label: string }[];
  compareData?: { name: string; data: Record<string, Record<PlanningStatus, number>> }[];
};

export function CapacityChart({ capacityData, columnHeaders, compareData }: Props) {
  // Build chart data: each row = one date column
  const chartData = columnHeaders.map((col) => {
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
          ? (sd.BASE_ROSTER || 0) + (sd.AVAILABLE_EXTRA || 0) + (sd.HIRED || 0)
          : 0;
        row[`compare_${scenario.name}`] = available;
      }
    }

    return row;
  });

  const COMPARE_COLORS = ["#f97316", "#06b6d4", "#8b5cf6"];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Capaciteitsverloop</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
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
}
