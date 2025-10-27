/**
 * Checkpoint Stats API Endpoint
 * GET /api/admin/events/[slug]/checkpoints/stats
 *
 * Returns real-time checkpoint statistics for an event
 * Used by admin dashboard and scanner UI for live updates
 */

import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getCheckpointStats } from "@/lib/checkpoint-helpers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  try {
    // Admin authentication
    await requireAdmin();

    const { slug } = await props.params;

    // Get event
    const [event] = await db
      .select({
        id: schema.events.id,
        title: schema.events.title,
        capacity: schema.events.capacity,
      })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);

    if (!event) {
      return apiError("NOT_FOUND", "Event not found", 404);
    }

    // Get checkpoint statistics
    const stats = await getCheckpointStats(event.id);

    // Calculate additional metrics
    const capacity = event.capacity || 0;
    const capacityUsed =
      capacity > 0 ? Math.round((stats.entry / capacity) * 100) : 0;

    return apiSuccess({
      eventId: event.id,
      eventTitle: event.title,
      capacity,
      capacityUsed,
      stats: {
        total: stats.total,
        entry: {
          count: stats.entry,
          percentage: stats.entryPercentage,
        },
        refreshment: {
          count: stats.refreshment,
          percentage: stats.refreshmentPercentage,
        },
        swag: {
          count: stats.swag,
          percentage: stats.swagPercentage,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Checkpoint Stats API] Error:", error);
    return apiError(
      "INTERNAL_ERROR",
      error?.message || "Internal server error",
      500,
    );
  }
}
