/**
 * Checkpoint Scan API Endpoint
 * POST /api/admin/events/[slug]/checkpoints
 *
 * Scans a checkpoint (entry, refreshment, or swag) for an attendee
 * Supports multiple identifier types: QR code, ticket number, email, RSVP ID
 */

import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin, getSessionUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkpointScanSchema } from "@/lib/validation";
import {
  createCheckpointScan,
  findRsvpByIdentifier,
  syncEntryToLegacyCheckIn,
} from "@/lib/checkpoint-helpers";
import type { CheckpointType, ScanMethod } from "@/lib/types/checkpoint";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  try {
    // Admin authentication
    await requireAdmin();
    const admin = await getSessionUser();

    const { slug } = await props.params;

    // Get event
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);

    if (!event) {
      return apiError("NOT_FOUND", "Event not found", 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = checkpointScanSchema.safeParse({
      eventId: event.id,
      ...body,
    });

    if (!validation.success) {
      return apiError(
        "VALIDATION_ERROR",
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      );
    }

    const { checkpointType, identifier, scanMethod, notes } = validation.data;

    // Find RSVP by identifier
    const rsvp = await findRsvpByIdentifier(event.id, identifier || {});

    if (!rsvp) {
      return apiSuccess({
        success: false,
        found: false,
        message: "No matching RSVP found for this event",
      });
    }

    // Create checkpoint scan
    const scanResult = await createCheckpointScan({
      rsvpId: rsvp.id,
      eventId: event.id,
      checkpointType: checkpointType as CheckpointType,
      scannedBy: admin?.id || undefined,
      scanMethod: (scanMethod || "manual") as ScanMethod,
      notes: notes || undefined,
    });

    if (!scanResult) {
      return apiError(
        "INTERNAL_ERROR",
        "Failed to create checkpoint scan",
        500,
      );
    }

    // Backward compatibility: sync entry checkpoint to rsvps.checkedInAt
    if (checkpointType === "entry" && !scanResult.alreadyScanned) {
      await syncEntryToLegacyCheckIn(rsvp.id);
    }

    // Return success response
    return apiSuccess({
      success: true,
      found: true,
      alreadyScanned: scanResult.alreadyScanned,
      checkpoint: checkpointType,
      scanId: scanResult.id,
      attendee: {
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email,
      },
      message: scanResult.alreadyScanned
        ? `Already scanned at ${checkpointType} checkpoint`
        : `Successfully scanned at ${checkpointType} checkpoint`,
    });
  } catch (error: any) {
    console.error("[Checkpoint Scan API] Error:", error);
    return apiError(
      "INTERNAL_ERROR",
      error?.message || "Internal server error",
      500,
    );
  }
}
