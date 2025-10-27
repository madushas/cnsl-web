import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { EventInput } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import DOMPurify from "isomorphic-dompurify";
import { handleApiError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();

  try {
    const { slug } = await params;
    const queryStart = Date.now();
    const [event] = await db
      .select()
      .from(schema.events)
      .where(
        sql`${schema.events.slug} = ${slug} AND ${schema.events.deletedAt} IS NULL`,
      )
      .limit(1);
    if (!event) {
      logger.warn("Event not found", { slug });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Optimize: Run all related queries in parallel instead of sequentially
    const [topics, speakers, [countRow]] = await Promise.all([
      db
        .select()
        .from(schema.eventTopics)
        .where(eq(schema.eventTopics.eventId, event.id)),
      db
        .select()
        .from(schema.eventSpeakers)
        .where(eq(schema.eventSpeakers.eventId, event.id)),
      db
        .select({ c: sql<number>`count(*)` })
        .from(schema.rsvps)
        .where(eq(schema.rsvps.eventId, event.id)),
    ]);

    const queryDuration = Date.now() - queryStart;
    logger.slowQuery(`GET /api/events/${slug}`, queryDuration);

    logger.api("GET", `/api/events/${slug}`, 200, Date.now() - startTime, {
      eventId: event.id,
    });

    return NextResponse.json({
      ...event,
      topics: topics.map((t) => t.topic),
      speakers,
      registered: Number(countRow?.c || 0),
    });
  } catch (e) {
    const { slug } = await params;
    logger.error("Failed to load event", {
      error: e as Error,
      slug,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();

  try {
    const user = await requireAdmin();
    const body = await req.json();
    const parsed = EventInput.partial().parse(body);
    const { slug } = await params;

    // Load full record for auditing
    const [oldEvent] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!oldEvent) {
      logger.warn("Event not found for update", { slug });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update event (removed transaction as neon-http doesn't support it)
    await db
      .update(schema.events)
      .set({
        title: parsed.title
          ? (DOMPurify.sanitize(parsed.title) as any)
          : undefined,
        description: parsed.description
          ? DOMPurify.sanitize(parsed.description)
          : oldEvent.description,
        date: parsed.date ? new Date(parsed.date) : oldEvent.date,
        city: parsed.city
          ? (DOMPurify.sanitize(parsed.city) as any)
          : oldEvent.city,
        venue: parsed.venue
          ? (DOMPurify.sanitize(parsed.venue) as any)
          : oldEvent.venue,
        image: parsed.image
          ? (DOMPurify.sanitize(parsed.image) as any)
          : oldEvent.image,
        capacity: (parsed.capacity as any) ?? undefined,
        published: (parsed.published as any) ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.events.id, oldEvent.id));

    if (parsed.topics) {
      await db
        .delete(schema.eventTopics)
        .where(eq(schema.eventTopics.eventId, oldEvent.id));
      if (parsed.topics.length) {
        await db
          .insert(schema.eventTopics)
          .values(
            parsed.topics.map((t) => ({ eventId: oldEvent.id, topic: t })),
          );
      }
    }
    if (parsed.speakers) {
      await db
        .delete(schema.eventSpeakers)
        .where(eq(schema.eventSpeakers.eventId, oldEvent.id));
      if (parsed.speakers.length) {
        await db
          .insert(schema.eventSpeakers)
          .values(
            parsed.speakers.map((s) => ({
              eventId: oldEvent.id,
              name: s.name,
              title: s.title ?? null,
              topic: s.topic ?? null,
            })),
          );
      }
    }

    // Load updated record for auditing
    const [newEvent] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, oldEvent.id))
      .limit(1);

    await logAudit({
      action: "event.update",
      userId: user?.id,
      entityType: "event",
      entityId: String(oldEvent.id),
      oldValues: oldEvent,
      newValues: newEvent ?? null,
      ipAddress: req.headers.get("x-forwarded-for"),
    });

    // Revalidate cached pages
    revalidatePath("/api/events");
    revalidatePath("/events");
    revalidatePath(`/events/${slug}`);

    logger.info("Event updated", {
      eventId: oldEvent.id,
      slug,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const { slug } = await params;
    logger.error("Failed to update event", {
      error: e as Error,
      slug,
    });
    return handleApiError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now();
  try {
    const user = await requireAdmin();
    const { slug } = await params;
    // Load record for auditing then soft delete
    const [oldEvent] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!oldEvent) {
      logger.warn("Event not found for delete", { slug });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db
      .update(schema.events)
      .set({
        deletedAt: new Date(),
        deletedBy: user?.id ? String(user.id) : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.events.id, oldEvent.id));

    // Revalidate cached pages
    revalidatePath("/api/events");
    revalidatePath("/events");

    // Audit log
    await logAudit({
      action: "event.delete",
      userId: user?.id,
      entityType: "event",
      entityId: oldEvent ? String(oldEvent.id) : null,
      oldValues: oldEvent ?? null,
      newValues: { deletedAt: true },
      ipAddress: req.headers.get("x-forwarded-for"),
    });

    logger.info("Event deleted", { slug, duration: Date.now() - startTime });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const { slug } = await params;
    logger.error("Failed to delete event", {
      error: e as Error,
      slug,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
