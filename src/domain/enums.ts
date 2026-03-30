// === Domain Enums ===

export const PlanningStatus = {
  ROSTER_FREE: "ROSTER_FREE",
  BASE_ROSTER: "BASE_ROSTER",
  AVAILABLE_EXTRA: "AVAILABLE_EXTRA",
  LEAVE: "LEAVE",
  SICK: "SICK",
} as const;
export type PlanningStatus = (typeof PlanningStatus)[keyof typeof PlanningStatus];

export const EmploymentType = {
  FULLTIME: "FULLTIME",
  PARTTIME: "PARTTIME",
  ONCALL: "ONCALL",
  TEMPORARY: "TEMPORARY",
  CHARTER: "CHARTER",
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const UserRole = {
  ADMIN: "ADMIN",
  PLANNER: "PLANNER",
  VIEWER: "VIEWER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// === UI Enums ===

export const ZoomLevel = {
  WEEK: "week",
  FOUR_WEEKS: "4weeks",
  MONTH: "month",
  YEAR: "year",
} as const;
export type ZoomLevel = (typeof ZoomLevel)[keyof typeof ZoomLevel];

export const AggregationLevel = {
  DAY: "day",
  WEEK: "week",
  FOUR_WEEKS: "4weeks",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
} as const;
export type AggregationLevel = (typeof AggregationLevel)[keyof typeof AggregationLevel];

export const DensityLevel = {
  SPACIOUS: "spacious",
  COMFORTABLE: "comfortable",
  COMPACT: "compact",
} as const;
export type DensityLevel = (typeof DensityLevel)[keyof typeof DensityLevel];

export const GroupByField = {
  NONE: "none",
  EMPLOYER: "employer",
  DEPARTMENT: "department",
  LOCATION: "location",
  LICENSE_TYPE: "licenseType",
  EMPLOYMENT_TYPE: "employmentType",
} as const;
export type GroupByField = (typeof GroupByField)[keyof typeof GroupByField];

