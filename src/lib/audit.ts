import { prisma } from "./prisma";

export async function createAuditLog(params: {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
      newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
    },
  });
}
