import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  getISOWeek,
  getYear,
  getDaysInMonth,
  format,
} from "date-fns";
import { nl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekDates(year: number, week: number): Date[] {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = startOfWeek(jan4, { weekStartsOn: 1 });
  const weekStart = addDays(startOfWeek1, (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function getCurrentWeek(): { year: number; week: number } {
  const now = new Date();
  return { year: getYear(now), week: getISOWeek(now) };
}

export function formatDateNL(date: Date): string {
  return format(date, "EEEEEE d MMM", { locale: nl });
}

export function get4WeekDates(year: number, week: number): Date[] {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = startOfWeek(jan4, { weekStartsOn: 1 });
  const weekStart = addDays(startOfWeek1, (week - 1) * 7);
  return Array.from({ length: 28 }, (_, i) => addDays(weekStart, i));
}

export function getMonthDates(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1));
  const days = getDaysInMonth(start);
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

export function getYearMonths(year: number): { label: string; startDate: string; endDate: string }[] {
  const MONTH_LABELS = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  return MONTH_LABELS.map((label, i) => {
    const start = startOfMonth(new Date(year, i));
    const end = endOfMonth(new Date(year, i));
    return {
      label,
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  });
}

// Generate a range of consecutive dates from a start date
export function getDateRange(startDate: string, days: number): string[] {
  const start = new Date(startDate + "T00:00:00");
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i);
    return d.toISOString().split("T")[0];
  });
}

// Get start date for "today minus offset days"
export function getStartDateForRange(daysBefore: number): string {
  const d = addDays(new Date(), -daysBefore);
  // Snap to Monday
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDays(d, mondayOffset);
  return monday.toISOString().split("T")[0];
}

// Get quarter dates for a year+quarter (1-4)
export function getQuarterDates(year: number, quarter: number): Date[] {
  const startMonth = (quarter - 1) * 3;
  const dates: Date[] = [];
  for (let m = startMonth; m < startMonth + 3; m++) {
    const monthStart = startOfMonth(new Date(year, m));
    const days = getDaysInMonth(monthStart);
    for (let d = 0; d < days; d++) {
      dates.push(addDays(monthStart, d));
    }
  }
  return dates;
}

export function getQuarterLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

// Get ISO week number for a date string
export function getISOWeekNumber(dateStr: string): number {
  return getISOWeek(new Date(dateStr + "T00:00:00"));
}

// Compute valid 4-week ISO period start dates for a given year
export function get4WeekPeriodStarts(year: number): string[] {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = startOfWeek(jan4, { weekStartsOn: 1 });
  const starts: string[] = [];
  for (let w = 0; w < 13; w++) {
    const d = addDays(startOfWeek1, w * 28);
    starts.push(d.toISOString().split("T")[0]);
  }
  return starts;
}
