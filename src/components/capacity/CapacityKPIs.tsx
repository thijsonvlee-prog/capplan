"use client";

import { useMemo } from "react";
import { Users, UserCheck, CalendarOff, HeartPulse } from "lucide-react";
import type { PlanningStatus } from "@/domain/enums";

type Props = {
  capacityData: Record<string, Record<PlanningStatus, number>>;
};

type KPIItem = {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
};

export function CapacityKPIs({ capacityData }: Props) {
  const kpis = useMemo(() => {
    const keys = Object.keys(capacityData);
    if (keys.length === 0) return null;

    let totalBase = 0;
    let totalExtra = 0;
    let totalLeave = 0;
    let totalSick = 0;
    let totalRosterFree = 0;

    for (const key of keys) {
      const d = capacityData[key];
      if (d) {
        totalBase += d.BASE_ROSTER || 0;
        totalExtra += d.AVAILABLE_EXTRA || 0;
        totalLeave += d.LEAVE || 0;
        totalSick += d.SICK || 0;
        totalRosterFree += d.ROSTER_FREE || 0;
      }
    }

    const count = keys.length;
    const avgAvailable = Math.round(((totalBase + totalExtra) / count) * 10) / 10;
    const avgTotal = Math.round(((totalBase + totalExtra + totalLeave + totalSick + totalRosterFree) / count) * 10) / 10;
    const avgLeave = Math.round((totalLeave / count) * 10) / 10;
    const avgSick = Math.round((totalSick / count) * 10) / 10;
    const utilization = avgTotal > 0 ? Math.round((avgAvailable / avgTotal) * 100) : 0;

    return { avgAvailable, avgTotal, avgLeave, avgSick, utilization };
  }, [capacityData]);

  if (!kpis) return null;

  const items: KPIItem[] = [
    {
      label: "Gem. beschikbaar",
      value: kpis.avgAvailable,
      icon: <UserCheck size={18} strokeWidth={1.75} />,
      colorClass: "text-success-700",
      bgClass: "bg-success-50",
    },
    {
      label: "Gem. totaal",
      value: kpis.avgTotal,
      icon: <Users size={18} strokeWidth={1.75} />,
      colorClass: "text-brand-700",
      bgClass: "bg-brand-50",
    },
    {
      label: "Gem. verlof",
      value: kpis.avgLeave,
      icon: <CalendarOff size={18} strokeWidth={1.75} />,
      colorClass: "text-warning-700",
      bgClass: "bg-warning-50",
    },
    {
      label: "Gem. ziek",
      value: kpis.avgSick,
      icon: <HeartPulse size={18} strokeWidth={1.75} />,
      colorClass: "text-danger-600",
      bgClass: "bg-danger-50",
    },
    {
      label: "Bezettingsgraad",
      value: kpis.utilization,
      suffix: "%",
      icon: <UserCheck size={18} strokeWidth={1.75} />,
      colorClass: kpis.utilization >= 80 ? "text-success-700" : kpis.utilization >= 60 ? "text-warning-700" : "text-danger-600",
      bgClass: kpis.utilization >= 80 ? "bg-success-50" : kpis.utilization >= 60 ? "bg-warning-50" : "bg-danger-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface-primary rounded-lg shadow-card p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className={`${item.bgClass} ${item.colorClass} rounded-md p-1.5`}>
              {item.icon}
            </div>
            <span className="text-caption font-medium text-text-tertiary uppercase tracking-wide">
              {item.label}
            </span>
          </div>
          <div className={`text-xl font-semibold ${item.colorClass} font-[var(--font-display)]`}>
            {item.value}{item.suffix || ""}
          </div>
        </div>
      ))}
    </div>
  );
}
