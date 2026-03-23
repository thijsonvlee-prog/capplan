import { z } from "zod";

export const planningStatusEnum = z.enum([
  "ROSTER_FREE",
  "BASE_ROSTER",
  "AVAILABLE_EXTRA",
  "LEAVE",
  "SICK",
  "HIRED",
]);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createPlanningEntrySchema = z.object({
  driverId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: planningStatusEnum,
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  plannedHours: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional(),
  isOverride: z.boolean().optional(),
});

export const updatePlanningEntrySchema = z.object({
  status: planningStatusEnum.optional(),
  startTime: z.string().regex(timeRegex).optional().nullable(),
  endTime: z.string().regex(timeRegex).optional().nullable(),
  plannedHours: z.number().min(0).max(24).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isOverride: z.boolean().optional(),
});

export const bulkUpdateSchema = z.object({
  entries: z.array(
    z.object({
      driverId: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: planningStatusEnum,
      startTime: z.string().regex(timeRegex).optional(),
      endTime: z.string().regex(timeRegex).optional(),
      plannedHours: z.number().min(0).max(24).optional(),
      notes: z.string().max(500).optional(),
    })
  ),
});

export const driverSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  type: z.enum(["INTERNAL", "CHARTER", "TEMPORARY"]),
  employeeNumber: z.string().max(50).optional(),
  companyName: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});
