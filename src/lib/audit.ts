import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";

/**
 * Write an audit log entry for a data mutation.
 *
 * This helper is fire-and-forget: audit failures are logged but never
 * prevent the primary mutation from succeeding.
 *
 * @param tableName  Prisma model name (e.g. "Employer", "Skill")
 * @param recordId   Primary key of the affected record
 * @param action     "CREATE" | "UPDATE" | "DELETE"
 * @param oldValues  Previous field values (UPDATE/DELETE) or null
 * @param newValues  New field values (CREATE/UPDATE) or null
 * @param userId     User ID from session, or null for dev/anonymous
 */
export async function logAudit(
  tableName: string,
  recordId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  oldValues: Prisma.InputJsonValue | null,
  newValues: Prisma.InputJsonValue | null,
  userId?: string | null
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldValues: oldValues ?? Prisma.JsonNull,
        newValues: newValues ?? Prisma.JsonNull,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    console.error(
      "Audit log write failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

const DEFAULT_RETENTION_DAYS = 90;
const CLEANUP_THROTTLE_MS = 60 * 60 * 1000; // 1 hour
let lastCleanupTime = 0;

/**
 * Delete audit log entries older than the specified retention period.
 * Throttled to run at most once per hour to avoid redundant DB work.
 *
 * @param retentionDays  Number of days to keep (default 90)
 * @returns Number of deleted entries, or 0 if skipped/failed
 */
export async function cleanupOldAuditLogs(
  retentionDays = DEFAULT_RETENTION_DAYS
): Promise<number> {
  const now = Date.now();
  if (now - lastCleanupTime < CLEANUP_THROTTLE_MS) return 0;
  lastCleanupTime = now;

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  } catch (error) {
    console.error(
      "Audit log cleanup failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return 0;
  }
}

/**
 * Get the current user ID from the session.
 * Returns null when auth is not configured or no session exists.
 */
export async function getAuditUserId(): Promise<string | null> {
  if (!process.env.NEXTAUTH_SECRET) return null;
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
