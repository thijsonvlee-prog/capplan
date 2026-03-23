import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfWeek,
  addDays,
  getISOWeek,
  getYear,
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
