import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { requireAdminOrCheckin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { validateRequest, checkinSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminOrCheckin();

    let body = null;
    try {
      body = await req.json();
    } catch (error) {
      logger.warn("Invalid JSON in request body", {
        error: error instanceof Error ? error.message : String(error),
        endpoint: req.nextUrl?.pathname,
      });
      return apiError("BAD_REQUEST", "Invalid JSON in request body", 400);
    }
    const parsed = validateRequest(checkinSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error },
        { status: 400 },
      );
    }
    const { slug, id, ticketNumber, qr, email } = parsed.data;

    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    let rsvp: { id: string; checkedInAt: Date | null } | null = null;

    if (id) {
      const row = await db
        .select({ id: schema.rsvps.id, checkedInAt: schema.rsvps.checkedInAt })
        .from(schema.rsvps)
        .where(and(eq(schema.rsvps.id, id), eq(schema.rsvps.eventId, event.id)))
        .limit(1);
      rsvp = row[0] || null;
    } else if (ticketNumber) {
      const row = await db
        .select({ id: schema.rsvps.id, checkedInAt: schema.rsvps.checkedInAt })
        .from(schema.rsvps)
        .where(
          and(
            eq(schema.rsvps.eventId, event.id),
            eq(schema.rsvps.ticketNumber, ticketNumber),
          ),
        )
        .limit(1);
      rsvp = row[0] || null;
    } else if (qr) {
      const row = await db
        .select({ id: schema.rsvps.id, checkedInAt: schema.rsvps.checkedInAt })
        .from(schema.rsvps)
        .where(
          and(eq(schema.rsvps.eventId, event.id), eq(schema.rsvps.qrCode, qr)),
        )
        .limit(1);
      rsvp = row[0] || null;
    } else if (email) {
      const row = await db
        .select({ id: schema.rsvps.id, checkedInAt: schema.rsvps.checkedInAt })
        .from(schema.rsvps)
        .where(
          and(
            eq(schema.rsvps.eventId, event.id),
            eq(schema.rsvps.email, email),
          ),
        )
        .limit(1);
      rsvp = row[0] || null;
    }

    if (!rsvp)
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });

    if (rsvp.checkedInAt) {
      return NextResponse.json({ ok: true, rsvpId: rsvp.id, already: true });
    }

    await db
      .update(schema.rsvps)
      .set({ checkedInAt: new Date() })
      .where(eq(schema.rsvps.id, rsvp.id));

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "admin.rsvps.checkin",
      userId: user?.id ? String(user.id) : null,
      entityType: "event",
      entityId: event.id as any,
      oldValues: { id: rsvp.id },
      newValues: { checkedInAt: true },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, rsvpId: rsvp.id });
  } catch (e: any) {
    return handleApiError(e);
  }
}
