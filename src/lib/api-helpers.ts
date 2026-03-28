import type {
  DriverWithEntries,
  DriverComputedFields,
  StamtabelRecord,
} from "@/domain/types";
import type { GroupByField } from "@/domain/enums";
import { EMPLOYMENT_TYPE_LABELS } from "@/domain/constants";

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

  const groups = new Map<string, DriverWithEntries[]>();

  for (const driver of drivers) {
    let keys: string[];
    const emp = getActiveRecord(driver.employmentRecords);
    const pos = getActiveRecord(driver.functionRecords);

    switch (groupBy) {
      case "employer":
        keys = [
          (emp?.employerId &&
            lookups.employers.find((e) => e.id === emp.employerId)
              ?.description) ||
            "Onbekend",
        ];
        break;
      case "department":
        keys = [
          (pos?.departmentId &&
            lookups.departments.find((d) => d.id === pos.departmentId)
              ?.description) ||
            "Onbekend",
        ];
        break;
      case "location":
        keys = [
          (pos?.locationId &&
            lookups.locations.find((l) => l.id === pos.locationId)
              ?.description) ||
            "Onbekend",
        ];
        break;
      case "licenseType":
        keys = driver.licenseTypes?.length ? driver.licenseTypes : ["Onbekend"];
        break;
      case "employmentType":
        keys = [
          emp?.employmentType
            ? EMPLOYMENT_TYPE_LABELS[
                emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
              ]
            : "Onbekend",
        ];
        break;
      default:
        keys = ["Onbekend"];
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

// Get computed fields from driver sub-records (client-side, using pre-fetched lookups)
export function getComputedFields(
  driver: any,
  lookups: {
    employers: StamtabelRecord[];
    departments: StamtabelRecord[];
    locations: StamtabelRecord[];
    rosterProfiles: { id: string; name: string }[];
  }
): DriverComputedFields {
  const emp: any = getActiveRecord(driver.employmentRecords);
  const pos: any = getActiveRecord(driver.functionRecords);
  const ros: any = getActiveRecord(driver.rosterAssignments);

  return {
    currentEmployer:
      (emp?.employerId &&
        lookups.employers.find((e) => e.id === emp.employerId)?.description) ||
      "",
    currentEmploymentType: emp?.employmentType
      ? EMPLOYMENT_TYPE_LABELS[
          emp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
        ] || ""
      : "",
    currentPosition: pos?.position || "",
    currentDepartment:
      (pos?.departmentId &&
        lookups.departments.find((d) => d.id === pos.departmentId)
          ?.description) ||
      "",
    currentLocation:
      (pos?.locationId &&
        lookups.locations.find((l) => l.id === pos.locationId)?.description) ||
      "",
    currentManager: pos?.manager || "",
    currentRosterProfile:
      (ros?.rosterProfileId &&
        lookups.rosterProfiles.find((p) => p.id === ros.rosterProfileId)
          ?.name) ||
      "",
    currentWeeklyHours: ros?.weeklyHours,
  };
}

// Get the active (open-ended) record from a list of sub-records
export function getActiveRecord<T extends { endDate?: string }>(records: T[] | undefined): T | undefined {
  return (records || []).find((r) => !r.endDate);
}
