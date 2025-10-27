import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { validateRequest, bulkCheckinsSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";

function norm(s: any) {
  return typeof s === "string" ? s.trim() : "";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { slug } = await params;
    const body = await req.json().catch(() => null);
    const parsed = validateRequest(bulkCheckinsSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error },
        { status: 400 },
      );
    }
    const action = parsed.data.action;
    const items: any[] = parsed.data.items as any[];

    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const results: Array<{ key: string; updated: boolean; reason?: string }> =
      [];
    let updated = 0;

    for (const it of items) {
      const id = norm(it.id);
      const email = norm(it.email).toLowerCase();
      const ticketNumber = norm(
        it.ticketNumber || it.ticket_number || it.ticket,
      )?.toUpperCase();
      const qr = norm(it.qr || it.qrCode || it.qr_code);
      const whenStr = norm(it.when);
      const when = whenStr ? new Date(whenStr) : new Date();

      let matchId: string | null = null;
      if (id) {
        const row = await db
          .select({ id: schema.rsvps.id })
          .from(schema.rsvps)
          .where(
            and(eq(schema.rsvps.id, id), eq(schema.rsvps.eventId, event.id)),
          )
          .limit(1);
        matchId = row[0]?.id || null;
      } else if (ticketNumber) {
        const row = await db
          .select({ id: schema.rsvps.id })
          .from(schema.rsvps)
          .where(
            and(
              eq(schema.rsvps.eventId, event.id),
              eq(schema.rsvps.ticketNumber, ticketNumber),
            ),
          )
          .limit(1);
        matchId = row[0]?.id || null;
      } else if (qr) {
        const row = await db
          .select({ id: schema.rsvps.id })
          .from(schema.rsvps)
          .where(
            and(
              eq(schema.rsvps.eventId, event.id),
              eq(schema.rsvps.qrCode, qr),
            ),
          )
          .limit(1);
        matchId = row[0]?.id || null;
      } else if (email) {
        const row = await db
          .select({ id: schema.rsvps.id })
          .from(schema.rsvps)
          .where(
            and(
              eq(schema.rsvps.eventId, event.id),
              eq(schema.rsvps.email, email),
            ),
          )
          .limit(1);
        matchId = row[0]?.id || null;
      }

      const key = id || ticketNumber || qr || email || "unknown";
      if (!matchId) {
        results.push({ key, updated: false, reason: "not_found" });
        continue;
      }

      try {
        if (action === "checkin") {
          await db
            .update(schema.rsvps)
            .set({ checkedInAt: when })
            .where(eq(schema.rsvps.id, matchId));
        } else {
          await db
            .update(schema.rsvps)
            .set({ checkedInAt: null })
            .where(eq(schema.rsvps.id, matchId));
        }
        updated++;
        results.push({ key, updated: true });
      } catch (err: any) {
        results.push({ key, updated: false, reason: "db_error" });
      }
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "admin.rsvps.checkins.bulk",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "event",
      entityId: event.id as any,
      oldValues: {},
      newValues: { action, rows: items.length, updated },
      ipAddress: ip,
    });

    return NextResponse.json({
      ok: true,
      action,
      total: items.length,
      updated,
      results,
    });
  } catch (e: any) {
    return handleApiError(e);
  }
}
