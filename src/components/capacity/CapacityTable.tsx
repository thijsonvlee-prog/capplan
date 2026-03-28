"use client";

import type { PlanningStatus } from "@/lib/store";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

const ALL_STATUSES: PlanningStatus[] = [
  "BASE_ROSTER", "AVAILABLE_EXTRA", "ROSTER_FREE", "LEAVE", "SICK",
];

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
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border border-gray-200 font-semibold min-w-[140px]">Status</th>
            {columnHeaders.map((col) => (
              <th key={col.key} className="p-2 border border-gray-200 text-center text-xs font-medium min-w-[50px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_STATUSES.map((status) => (
            <tr key={status} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-200">
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              </td>
              {columnHeaders.map((col) => (
                <td key={col.key} className="p-2 border border-gray-200 text-center text-xs">
                  {capacityData[col.key]?.[status] || 0}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="p-2 border border-gray-200 text-xs">Beschikbaar</td>
            {columnHeaders.map((col) => (
              <td key={col.key} className="p-2 border border-gray-200 text-center text-xs text-green-700">
                {availableDrivers(col.key)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50 font-semibold">
            <td className="p-2 border border-gray-200 text-xs">Totaal ingepland</td>
            {columnHeaders.map((col) => (
              <td key={col.key} className="p-2 border border-gray-200 text-center text-xs">
                {totalDrivers(col.key)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
