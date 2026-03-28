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
  ROSTER_FREE: "bg-gray-200 text-gray-600",
  BASE_ROSTER: "bg-green-700 text-white",
  AVAILABLE_EXTRA: "bg-green-300 text-green-900",
  LEAVE: "bg-yellow-300 text-yellow-900",
  SICK: "bg-red-500 text-white",
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
