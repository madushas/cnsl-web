import "server-only";
import { db, schema } from "@/db";
import { logger } from "./logger";

export type AuditParams = {
  action: string;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
};

export async function logAudit(params: AuditParams): Promise<void> {
  const {
    action,
    userId,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress,
  } = params;
  try {
    await db.insert(schema.auditLogs).values({
      action,
      userId: userId ?? null,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      oldValues: oldValues ?? null,
      newValues: newValues ?? null,
      ipAddress: ipAddress ?? null,
    });
  } catch (error) {
    logger.error("Audit log insert failed", { error: error as Error });
  }
}
