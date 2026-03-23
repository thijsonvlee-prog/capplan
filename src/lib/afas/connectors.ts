export const AFAS_CONNECTORS = {
  EMPLOYEES: "Profit_Employees",
  ROSTER: "Profit_Roster",
  LEAVE: "Profit_Leave",
  ABSENCE: "Profit_Absence",
} as const;

export const EMPLOYEE_FIELDS = {
  id: "EmId",
  employeeNumber: "CdNr",
  firstName: "VoNm",
  lastName: "AcNm",
  startDate: "InDt",
  endDate: "UtDt",
  function: "FuNm",
} as const;

export const ROSTER_FIELDS = {
  employeeId: "EmId",
  dayNumber: "DgNr",
  startTime: "BgTd",
  endTime: "EdTd",
  isWorkDay: "WkDg",
  validFrom: "InDt",
} as const;

export const LEAVE_FIELDS = {
  employeeId: "EmId",
  leaveType: "VlSrt",
  startDate: "BgDt",
  endDate: "EdDt",
  status: "Sts",
} as const;

export const ABSENCE_FIELDS = {
  employeeId: "EmId",
  startDate: "BgDt",
  endDate: "EdDt",
  absenceType: "VzSrt",
} as const;
