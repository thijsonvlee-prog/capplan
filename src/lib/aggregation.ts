/**
 * Shared date aggregation logic for PlanningGrid and CapacityPage.
 * Groups a flat list of date strings into column headers by aggregation level.
 */
import type { AggregationLevel } from "@/domain/enums";
import { DAY_LABELS, MONTH_SHORT } from "@/domain/constants";
import { getISOWeekNumber } from "@/lib/utils";

export type ColumnHeader = {
  key: string;
  label: string;
  /** Sub-label (e.g. day/month number), only used in day-level view */
  sub?: string;
  dates: string[];
};

/**
 * Aggregate an array of date strings into column headers based on the given level.
 * Returns one ColumnHeader per aggregated group (day, week, 4-week, month, quarter, year).
 */
export function getAggregatedColumns(
  allDates: string[],
  aggregation: AggregationLevel
): ColumnHeader[] {
  if (allDates.length === 0) return [];

  switch (aggregation) {
    case "day":
      return allDates.map((date) => {
        const d = new Date(date + "T00:00:00");
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return {
          key: date,
          label: DAY_LABELS[dayIdx],
          sub: `${d.getDate()}/${d.getMonth() + 1}`,
          dates: [date],
        };
      });

    case "week": {
      const weekMap = new Map<string, string[]>();
      for (const date of allDates) {
        const wk = getISOWeekNumber(date);
        const yr = new Date(date + "T00:00:00").getFullYear();
        const key = `${yr}-W${wk}`;
        if (!weekMap.has(key)) weekMap.set(key, []);
        weekMap.get(key)!.push(date);
      }
      return Array.from(weekMap.entries()).map(([key, dates]) => ({
        key,
        label: `Wk ${key.split("-W")[1]}`,
        dates,
      }));
    }

    case "4weeks": {
      const blocks: ColumnHeader[] = [];
      for (let i = 0; i < allDates.length; i += 28) {
        const blockDates = allDates.slice(i, i + 28);
        if (blockDates.length === 0) break;
        const firstWk = getISOWeekNumber(blockDates[0]);
        const lastWk = getISOWeekNumber(blockDates[blockDates.length - 1]);
        blocks.push({
          key: `4w-${i}`,
          label: `Wk ${firstWk}–${lastWk}`,
          dates: blockDates,
        });
      }
      return blocks;
    }

    case "month": {
      const monthMap = new Map<string, string[]>();
      for (const date of allDates) {
        const d = new Date(date + "T00:00:00");
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!monthMap.has(key)) monthMap.set(key, []);
        monthMap.get(key)!.push(date);
      }
      return Array.from(monthMap.entries()).map(([key, dates]) => {
        const [yr, m] = key.split("-").map(Number);
        return { key, label: `${MONTH_SHORT[m]} ${yr}`, dates };
      });
    }

    case "quarter": {
      const qMap = new Map<string, string[]>();
      for (const date of allDates) {
        const d = new Date(date + "T00:00:00");
        const q = Math.floor(d.getMonth() / 3) + 1;
        const key = `${d.getFullYear()}-Q${q}`;
        if (!qMap.has(key)) qMap.set(key, []);
        qMap.get(key)!.push(date);
      }
      return Array.from(qMap.entries()).map(([key, dates]) => ({
        key,
        label: key.replace("-", " "),
        dates,
      }));
    }

    case "year": {
      const yMap = new Map<string, string[]>();
      for (const date of allDates) {
        const yr = new Date(date + "T00:00:00").getFullYear().toString();
        if (!yMap.has(yr)) yMap.set(yr, []);
        yMap.get(yr)!.push(date);
      }
      return Array.from(yMap.entries()).map(([key, dates]) => ({
        key,
        label: key,
        dates,
      }));
    }
  }
}
