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
