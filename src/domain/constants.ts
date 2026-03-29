import type { PlanningStatus, EmploymentType, GroupByField } from "./enums";

// === Planning Status Constants ===

export const ALL_PLANNING_STATUSES: PlanningStatus[] = [
  "ROSTER_FREE", "BASE_ROSTER", "AVAILABLE_EXTRA", "LEAVE", "SICK",
];

export const ROSTER_PROFILE_STATUSES = ["ROSTER_FREE", "BASE_ROSTER", "AVAILABLE_EXTRA"] as const;
export type RosterProfileStatus = (typeof ROSTER_PROFILE_STATUSES)[number];

export const STATUS_LABELS: Record<PlanningStatus, string> = {
  ROSTER_FREE: "Roostervrij",
  BASE_ROSTER: "Basisrooster",
  AVAILABLE_EXTRA: "Aanvullend beschikbaar",
  LEAVE: "Verlof",
  SICK: "Ziek",
};

export const STATUS_CODES: Record<PlanningStatus, string> = {
  ROSTER_FREE: "-",
  BASE_ROSTER: "B",
  AVAILABLE_EXTRA: "A",
  LEAVE: "V",
  SICK: "Z",
};

export const STATUS_COLORS: Record<PlanningStatus, string> = {
  ROSTER_FREE: "bg-surface-inset text-text-secondary",
  BASE_ROSTER: "bg-success-700 text-text-inverse",
  AVAILABLE_EXTRA: "bg-success-300 text-success-900",
  LEAVE: "bg-warning-300 text-warning-900",
  SICK: "bg-danger-500 text-text-inverse",
};

/** Dot indicator colors for compact cell rendering (CSS variable references) */
export const STATUS_DOT_COLORS: Record<PlanningStatus, string> = {
  ROSTER_FREE: "bg-surface-inset",
  BASE_ROSTER: "bg-success-700",
  AVAILABLE_EXTRA: "bg-success-300",
  LEAVE: "bg-warning-300",
  SICK: "bg-danger-500",
};

export const STATUS_CHART_COLORS: Record<PlanningStatus, string> = {
  ROSTER_FREE: "#9ca3af",
  BASE_ROSTER: "#15803d",
  AVAILABLE_EXTRA: "#86efac",
  LEAVE: "#fde047",
  SICK: "#ef4444",
};

// === Employment Type Constants ===

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULLTIME: "Fulltime",
  PARTTIME: "Parttime",
  ONCALL: "Oproepkracht",
  TEMPORARY: "Uitzendkracht",
  CHARTER: "Charter",
};

// === Group By Constants ===

export const GROUP_BY_LABELS: Record<GroupByField, string> = {
  none: "Geen",
  employer: "Werkgever",
  department: "Afdeling",
  location: "Standplaats",
  licenseType: "Rijbewijstype",
  employmentType: "Dienstverband",
};

// === UI Constants ===

export const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

export const MONTH_SHORT = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"] as const;

// === Planning defaults ===

/** Default number of days shown in planning grid and capacity page (8 weeks) */
export const DEFAULT_PERIOD_DAYS = 56;

/** Fallback label for unknown/missing lookup values */
export const UNKNOWN_LABEL = "Onbekend";
