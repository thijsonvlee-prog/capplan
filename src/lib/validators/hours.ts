import { z } from "zod";

const decimalHours = z.number().min(0).max(24).optional().nullable();

export const realizedHoursRowSchema = z.object({
  employeeNumber: z.string().optional(),
  driverId: z.string().optional(),
  weekNumber: z.number().int().min(1).max(53),
  year: z.number().int().min(2020).max(2099),
  monday: decimalHours,
  tuesday: decimalHours,
  wednesday: decimalHours,
  thursday: decimalHours,
  friday: decimalHours,
  saturday: decimalHours,
  sunday: decimalHours,
}).refine(
  (data) => data.employeeNumber || data.driverId,
  { message: "Either employeeNumber or driverId is required" }
);

export const hoursImportSchema = z.object({
  rows: z.array(realizedHoursRowSchema).min(1),
});
