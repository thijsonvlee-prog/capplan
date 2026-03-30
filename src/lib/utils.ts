import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, getISOWeek } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get today's date snapped to the preceding Monday (ISO string) */
export function getMondayStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return addDays(today, mondayOffset).toISOString().split("T")[0];
}

// Generate a range of consecutive dates from a start date
export function getDateRange(startDate: string, days: number): string[] {
  const start = new Date(startDate + "T00:00:00");
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i);
    return d.toISOString().split("T")[0];
  });
}

// Get ISO week number for a date string
export function getISOWeekNumber(dateStr: string): number {
  return getISOWeek(new Date(dateStr + "T00:00:00"));
}

