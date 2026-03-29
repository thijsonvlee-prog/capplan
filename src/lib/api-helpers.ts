import type {
  DriverWithEntries,
  DriverComputedFields,
  StamtabelRecord,
} from "@/domain/types";
import type { GroupByField } from "@/domain/enums";
import { EMPLOYMENT_TYPE_LABELS, UNKNOWN_LABEL } from "@/domain/constants";

// Group drivers by field (client-side, using pre-fetched data)
export function groupDrivers(
  drivers: DriverWithEntries[],
  groupBy: GroupByField,
  lookups: {
    employers: StamtabelRecord[];
    departments: StamtabelRecord[];
    locations: StamtabelRecord[];
  }
): { label: string; drivers: DriverWithEntries[] }[] {
  if (groupBy === "none") {
    return [{ label: "", drivers }];
  }

  const employerMap = new Map(lookups.employers.map((e) => [e.id, e.description]));
  const departmentMap = new Map(lookups.departments.map((d) => [d.id, d.description]));
  const locationMap = new Map(lookups.locations.map((l) => [l.id, l.description]));

  const groups = new Map<string, DriverWithEntries[]>();

  for (const driver of drivers) {
    let keys: string[];
    const emp = getActiveRecord(driver.employmentRecords);
    const pos = getActiveRecord(driver.functionRecords);

    switch (groupBy) {
      case "employer":
        keys = [
          (emp?.employerId && employerMap.get(emp.employerId)) ||
            UNKNOWN_LABEL,
        ];
        break;
      case "department":
        keys = [
          (pos?.departmentId && departmentMap.get(pos.departmentId)) ||
            UNKNOWN_LABEL,
        ];
        break;
      case "location":
        keys = [
          (pos?.locationId && locationMap.get(pos.locationId)) ||
            UNKNOWN_LABEL,
        ];
        break;
      case "licenseType":
        keys = driver.licenseTypes?.length ? driver.licenseTypes : [UNKNOWN_LABEL];
        break;
      case "employmentType":
        keys = [
          emp?.employmentType
            ? EMPLOYMENT_TYPE_LABELS[
                emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
              ]
            : UNKNOWN_LABEL,
        ];
        break;
      default:
        keys = [UNKNOWN_LABEL];
    }

    for (const key of keys) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(driver);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, drivers]) => ({ label, drivers }));
}

// Pre-build lookup Maps from stamtabel arrays for O(1) access
export function buildLookupMaps(lookups: {
  employers: StamtabelRecord[];
  departments: StamtabelRecord[];
  locations: StamtabelRecord[];
  rosterProfiles?: { id: string; name: string }[];
}) {
  return {
    employerMap: new Map(lookups.employers.map((e) => [e.id, e.description])),
    departmentMap: new Map(lookups.departments.map((d) => [d.id, d.description])),
    locationMap: new Map(lookups.locations.map((l) => [l.id, l.description])),
    rosterProfileMap: lookups.rosterProfiles
      ? new Map(lookups.rosterProfiles.map((p) => [p.id, p.name]))
      : new Map<string, string>(),
  };
}

// Get computed fields from driver sub-records (client-side, using pre-fetched lookups)
export function getComputedFields(
  driver: any,
  lookups: {
    employers: StamtabelRecord[];
    departments: StamtabelRecord[];
    locations: StamtabelRecord[];
    rosterProfiles: { id: string; name: string }[];
  },
  maps?: ReturnType<typeof buildLookupMaps>
): DriverComputedFields {
  const m = maps || buildLookupMaps(lookups);
  const emp: any = getActiveRecord(driver.employmentRecords);
  const pos: any = getActiveRecord(driver.functionRecords);
  const ros: any = getActiveRecord(driver.rosterAssignments);

  return {
    currentEmployer:
      (emp?.employerId && m.employerMap.get(emp.employerId)) || "",
    currentEmploymentType: emp?.employmentType
      ? EMPLOYMENT_TYPE_LABELS[
          emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
        ] || ""
      : "",
    currentPosition: pos?.position || "",
    currentDepartment:
      (pos?.departmentId && m.departmentMap.get(pos.departmentId)) || "",
    currentLocation:
      (pos?.locationId && m.locationMap.get(pos.locationId)) || "",
    currentManager: pos?.manager || "",
    currentRosterProfile:
      (ros?.rosterProfileId && m.rosterProfileMap.get(ros.rosterProfileId)) || "",
    currentWeeklyHours: ros?.weeklyHours,
  };
}

// Get the active (open-ended) record from a list of sub-records
export function getActiveRecord<T extends { endDate?: string }>(records: T[] | undefined): T | undefined {
  return (records || []).find((r) => !r.endDate);
}

