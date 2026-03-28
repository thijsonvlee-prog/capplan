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
  // Get January 4th of the year (always in ISO week 1)
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

export const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

export const STATUS_LABELS: Record<string, string> = {
  ROSTER_FREE: "Roostervrij",
  BASE_ROSTER: "Basisrooster",
  AVAILABLE_EXTRA: "Extra beschikbaar",
  LEAVE: "Verlof",
  SICK: "Ziek",
  HIRED: "Ingehuurd",
};

export const STATUS_COLORS: Record<string, string> = {
  ROSTER_FREE: "bg-gray-100 text-gray-600",
  BASE_ROSTER: "bg-blue-100 text-blue-700",
  AVAILABLE_EXTRA: "bg-green-100 text-green-700",
  LEAVE: "bg-yellow-100 text-yellow-700",
  SICK: "bg-red-100 text-red-700",
  HIRED: "bg-purple-100 text-purple-700",
};

export const STATUS_CHART_COLORS: Record<string, string> = {
  ROSTER_FREE: "#9ca3af",
  BASE_ROSTER: "#3b82f6",
  AVAILABLE_EXTRA: "#22c55e",
  LEAVE: "#eab308",
  SICK: "#ef4444",
  HIRED: "#a855f7",
};

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
