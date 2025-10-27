/**
 * Checkpoint System Helper Functions
 *
 * Database queries and utility functions for the multi-checkpoint system
 */

import { db, schema } from "@/db";
import { eq, and, sql, or, desc } from "drizzle-orm";
import type {
  CheckpointType,
  CheckpointStats,
  CheckpointStatus,
  CheckpointScanInput,
  CheckpointHistoryEntry,
} from "@/lib/types/checkpoint";

/**
 * Get checkpoint statistics for an event
 */
export async function getCheckpointStats(
  eventId: string,
): Promise<CheckpointStats> {
  const { rows } = await db.execute(sql`
    SELECT total, approved, invited, entry_scans, refreshment_scans, swag_scans
    FROM event_rsvp_rollup
    WHERE event_id = ${eventId}
  `);

  const stats = rows?.[0] || null;
  const total = Number(stats?.invited ?? stats?.approved ?? stats?.total ?? 0);
  const entry = Number(stats?.entry_scans ?? 0);
  const refreshment = Number(stats?.refreshment_scans ?? 0);
  const swag = Number(stats?.swag_scans ?? 0);

  return {
    eventId,
    total,
    entry,
    refreshment,
    swag,
    entryPercentage: total > 0 ? Math.round((entry / total) * 100) : 0,
    refreshmentPercentage:
      total > 0 ? Math.round((refreshment / total) * 100) : 0,
    swagPercentage: total > 0 ? Math.round((swag / total) * 100) : 0,
  };
}

/**
 * Get checkpoint status for a specific RSVP
 */
export async function getCheckpointStatus(
  rsvpId: string,
  eventId: string,
): Promise<CheckpointStatus> {
  const { rows } = await db.execute(sql`
    SELECT *
    FROM get_checkpoint_status(${eventId}::uuid, ${rsvpId}::uuid)
  `);

  const result = rows?.[0];

  const toDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value as string);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  return {
    rsvpId,
    eventId,
    hasEntry: Boolean(result?.has_entry),
    hasRefreshment: Boolean(result?.has_refreshment),
    hasSwag: Boolean(result?.has_swag),
    entryScannedAt: toDate(result?.entry_scanned_at),
    refreshmentScannedAt: toDate(result?.refreshment_scanned_at),
    swagScannedAt: toDate(result?.swag_scanned_at),
    entryScannedBy: null,
    refreshmentScannedBy: null,
    swagScannedBy: null,
  };
}

/**
 * Create a checkpoint scan
 * Returns null if already scanned at this checkpoint (duplicate prevention)
 */
export async function createCheckpointScan(
  input: CheckpointScanInput,
): Promise<{ id: string; alreadyScanned: boolean } | null> {
  try {
    const values: any = {
      rsvpId: input.rsvpId,
      eventId: input.eventId,
      checkpointType: input.checkpointType as string,
    };

    if (input.scannedBy) values.scannedBy = input.scannedBy;
    if (input.scanMethod) values.scanMethod = input.scanMethod as string;
    if (input.notes) values.notes = input.notes;

    const [result] = await db
      .insert(schema.checkpointScans)
      .values(values)
      .returning({ id: schema.checkpointScans.id });

    return { id: result.id, alreadyScanned: false };
  } catch (error: any) {
    // Check if it's a unique constraint violation (duplicate scan)
    if (
      error?.code === "23505" ||
      error?.constraint === "checkpoint_scans_unique"
    ) {
      return { id: "", alreadyScanned: true };
    }
    throw error;
  }
}

/**
 * Delete a checkpoint scan (for undo operations)
 */
export async function deleteCheckpointScan(
  rsvpId: string,
  eventId: string,
  checkpointType: CheckpointType,
): Promise<boolean> {
  const [result] = await db
    .delete(schema.checkpointScans)
    .where(
      and(
        eq(schema.checkpointScans.rsvpId, rsvpId),
        eq(schema.checkpointScans.eventId, eventId),
        eq(schema.checkpointScans.checkpointType, checkpointType),
      ),
    )
    .returning({ id: schema.checkpointScans.id });

  return !!result;
}

/**
 * Find RSVP by various identifiers
 */
export async function findRsvpByIdentifier(
  eventId: string,
  identifier: {
    id?: string;
    email?: string;
    ticketNumber?: string;
    qr?: string;
  },
): Promise<{ id: string; name: string; email: string } | null> {
  const conditions = [eq(schema.rsvps.eventId, eventId)];

  if (identifier.id) {
    conditions.push(eq(schema.rsvps.id, identifier.id));
  } else if (identifier.email) {
    conditions.push(eq(schema.rsvps.email, identifier.email.toLowerCase()));
  } else if (identifier.ticketNumber) {
    conditions.push(
      eq(schema.rsvps.ticketNumber, identifier.ticketNumber.toUpperCase()),
    );
  } else if (identifier.qr) {
    conditions.push(eq(schema.rsvps.qrCode, identifier.qr));
  } else {
    return null;
  }

  const [rsvp] = await db
    .select({
      id: schema.rsvps.id,
      name: schema.rsvps.name,
      email: schema.rsvps.email,
    })
    .from(schema.rsvps)
    .where(and(...conditions))
    .limit(1);

  return rsvp || null;
}

/**
 * Get checkpoint history for an event
 */
export async function getCheckpointHistory(
  eventId: string,
  options: {
    checkpointType?: CheckpointType;
    limit?: number;
    offset?: number;
  } = {},
): Promise<CheckpointHistoryEntry[]> {
  const { checkpointType, limit = 50, offset = 0 } = options;

  const conditions = [eq(schema.checkpointScans.eventId, eventId)];
  if (checkpointType) {
    conditions.push(eq(schema.checkpointScans.checkpointType, checkpointType));
  }

  const results = await db
    .select({
      id: schema.checkpointScans.id,
      checkpointType: schema.checkpointScans.checkpointType,
      scannedAt: schema.checkpointScans.scannedAt,
      scannedBy: schema.checkpointScans.scannedBy,
      scanMethod: schema.checkpointScans.scanMethod,
      notes: schema.checkpointScans.notes,
      attendeeName: schema.rsvps.name,
      attendeeEmail: schema.rsvps.email,
    })
    .from(schema.checkpointScans)
    .innerJoin(schema.rsvps, eq(schema.rsvps.id, schema.checkpointScans.rsvpId))
    .where(and(...conditions))
    .orderBy(desc(schema.checkpointScans.scannedAt))
    .limit(limit)
    .offset(offset);

  return results.map((r) => ({
    id: r.id,
    checkpointType: r.checkpointType as CheckpointType,
    scannedAt: r.scannedAt,
    scannedBy: r.scannedBy,
    scanMethod: r.scanMethod as any,
    notes: r.notes,
    attendeeName: r.attendeeName,
    attendeeEmail: r.attendeeEmail,
  }));
}

/**
 * Sync legacy check-in data to entry checkpoint
 * This should be run once during migration
 */
export async function syncLegacyCheckIns(eventId?: string): Promise<number> {
  const conditions = [sql`${schema.rsvps.checkedInAt} IS NOT NULL`];
  if (eventId) {
    conditions.push(eq(schema.rsvps.eventId, eventId));
  }

  const rsvpsWithCheckIn = await db
    .select({
      id: schema.rsvps.id,
      eventId: schema.rsvps.eventId,
      checkedInAt: schema.rsvps.checkedInAt,
    })
    .from(schema.rsvps)
    .where(and(...conditions));

  let syncCount = 0;

  for (const rsvp of rsvpsWithCheckIn) {
    if (!rsvp.checkedInAt) continue;

    try {
      const values: any = {
        rsvpId: rsvp.id,
        eventId: rsvp.eventId,
        checkpointType: "entry",
        scannedAt: rsvp.checkedInAt,
        scanMethod: "manual",
        notes: "Migrated from legacy check-in",
      };

      await db
        .insert(schema.checkpointScans)
        .values(values)
        .onConflictDoNothing();

      syncCount++;
    } catch (error) {
      // Skip on error (likely duplicate)
      continue;
    }
  }

  return syncCount;
}

/**
 * Backward compatibility: Update rsvps.checkedInAt when entry checkpoint is scanned
 * This keeps old code working during transition period
 */
export async function syncEntryToLegacyCheckIn(rsvpId: string): Promise<void> {
  const [entryScan] = await db
    .select({ scannedAt: schema.checkpointScans.scannedAt })
    .from(schema.checkpointScans)
    .where(
      and(
        eq(schema.checkpointScans.rsvpId, rsvpId),
        eq(schema.checkpointScans.checkpointType, "entry"),
      ),
    )
    .limit(1);

  if (entryScan) {
    await db
      .update(schema.rsvps)
      .set({ checkedInAt: entryScan.scannedAt })
      .where(eq(schema.rsvps.id, rsvpId));
  }
}
