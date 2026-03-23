import type { Driver, BaseRoster } from "@prisma/client";

export type DriverWithRosters = Driver & {
  baseRosters: BaseRoster[];
};
