import "server-only";
import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { validateRequest, adminSelectSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { slug } = await params;
    const body = await req.json().catch(() => null);
    const parsed = validateRequest(adminSelectSchema, body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Validation failed", 400);
    }
    const { status: statusRaw, rsvpIds } = parsed.data;

    const [event] = await db
      .select({ id: schema.events.id, capacity: schema.events.capacity })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event) return apiError("NOT_FOUND", "Event not found", 404);

    // Ensure all RSVPs belong to event
    const rows = await db
      .select({ id: schema.rsvps.id })
      .from(schema.rsvps)
      .where(
        and(
          eq(schema.rsvps.eventId, event.id),
          inArray(schema.rsvps.id, rsvpIds),
        ),
      );
    const validIds = rows.map((r) => r.id);
    if (!validIds.length)
      return apiError("BAD_REQUEST", "No valid RSVPs for this event", 400);

    // Capacity enforcement for "approved"
    let toUpdate = validIds;
    let skipped: string[] = [];
    if (
      statusRaw === "approved" &&
      typeof event.capacity === "number" &&
      event.capacity > 0
    ) {
      const [{ c: approvedCount }] = await db
        .select({ c: sql<number>`count(*)` })
        .from(schema.rsvps)
        .where(
          and(
            eq(schema.rsvps.eventId, event.id),
            eq(schema.rsvps.status, "approved"),
          ),
        );
      const remaining = Math.max(
        0,
        Number(event.capacity) - Number(approvedCount || 0),
      );
      if (remaining <= 0) {
        return apiSuccess({
          ok: true,
          updated: 0,
          skipped: validIds,
          reason: "capacity_full",
        });
      }
      if (validIds.length > remaining) {
        toUpdate = validIds.slice(0, remaining);
        skipped = validIds.slice(remaining);
      }
    }

    if (toUpdate.length) {
      await db
        .update(schema.rsvps)
        .set({ status: statusRaw as any })
        .where(inArray(schema.rsvps.id, toUpdate));
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "admin.rsvps.bulkUpdate",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "event",
      entityId: event.id as any,
      oldValues: { ids: toUpdate.length },
      newValues: { status: statusRaw, updated: toUpdate.length },
      ipAddress: ip,
    });

    return apiSuccess({ ok: true, updated: toUpdate.length, skipped });
  } catch (e: any) {
    return handleApiError(e);
  }
}
