/**
 * Delete Checkpoint Scan API Endpoint
 * DELETE /api/admin/events/[slug]/checkpoints/[scanId]
 *
 * Deletes/undoes a checkpoint scan (admin correction feature)
 * Useful for fixing mistakes or handling special cases
 */

import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin, getSessionUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { logError } from "@/lib/request-logger";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ slug: string; scanId: string }> },
) {
  try {
    // Admin authentication
    await requireAdmin();
    const admin = await getSessionUser();

    const { slug, scanId } = await props.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(scanId)) {
      return apiError("VALIDATION_ERROR", "Invalid scan ID format", 400);
    }

    // Get event
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);

    if (!event) {
      return apiError("NOT_FOUND", "Event not found", 404);
    }

    // Get the scan to verify it exists and belongs to this event
    const [scan] = await db
      .select({
        id: schema.checkpointScans.id,
        rsvpId: schema.checkpointScans.rsvpId,
        checkpointType: schema.checkpointScans.checkpointType,
        scannedBy: schema.checkpointScans.scannedBy,
      })
      .from(schema.checkpointScans)
      .where(
        and(
          eq(schema.checkpointScans.id, scanId),
          eq(schema.checkpointScans.eventId, event.id),
        ),
      )
      .limit(1);

    if (!scan) {
      return apiError(
        "NOT_FOUND",
        "Checkpoint scan not found for this event",
        404,
      );
    }

    // Get attendee info for the response
    const [rsvp] = await db
      .select({
        name: schema.rsvps.name,
        email: schema.rsvps.email,
      })
      .from(schema.rsvps)
      .where(eq(schema.rsvps.id, scan.rsvpId))
      .limit(1);

    // Delete the checkpoint scan
    await db
      .delete(schema.checkpointScans)
      .where(eq(schema.checkpointScans.id, scanId));

    // If this was an entry checkpoint, also clear the legacy checkedInAt field
    // (for backward compatibility)
    if (scan.checkpointType === "entry") {
      // Check if there are other entry scans for this RSVP
      const [otherEntryScan] = await db
        .select({ id: schema.checkpointScans.id })
        .from(schema.checkpointScans)
        .where(
          and(
            eq(schema.checkpointScans.rsvpId, scan.rsvpId),
            eq(schema.checkpointScans.checkpointType, "entry"),
          ),
        )
        .limit(1);

      // Only clear checkedInAt if no other entry scans exist
      if (!otherEntryScan) {
        await db
          .update(schema.rsvps)
          .set({ checkedInAt: null })
          .where(eq(schema.rsvps.id, scan.rsvpId));
      }
    }

    // Log the deletion for audit trail (sanitized)
    try {
      logger.info("checkpoint.delete", {
        scanId,
        eventId: event.id,
        rsvpId: scan.rsvpId,
        checkpointType: scan.checkpointType,
        deletedBy: admin?.id,
        originalScannedBy: scan.scannedBy,
      });
    } catch (e) {
      // Fallback: record the error using the request-logger (sanitized)
      try {
        logError("checkpoint.delete", e, {
          scanId,
          eventId: event?.id,
        });
      } catch {}
    }

    // Return success response
    return apiSuccess({
      success: true,
      deleted: true,
      scanId,
      checkpointType: scan.checkpointType,
      attendee: {
        name: rsvp?.name || "Unknown",
        email: rsvp?.email || "Unknown",
      },
      deletedBy: admin?.id || "Unknown",
      message: `Successfully removed ${scan.checkpointType} checkpoint scan`,
    });
  } catch (error: any) {
    // Log sanitized error and record via request-logger
    logger.error("[Delete Checkpoint Scan API] Error", {
      error: error?.message,
    });
    try {
      logError("admin.checkpoint.delete", error);
    } catch {}
    return apiError(
      "INTERNAL_ERROR",
      error?.message || "Internal server error",
      500,
    );
  }
}
