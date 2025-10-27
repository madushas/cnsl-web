import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { EventInput } from "@/lib/validation";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import DOMPurify from "isomorphic-dompurify";
import { handleApiError } from "@/lib/errors";

// Cache public events list for 60 seconds
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const admin = await isAdmin();
    const all = req.nextUrl.searchParams.get("all") === "1";

    // Admin requests bypass cache
    const buildResponse = (rows: any[]) => {
      return rows.map((row) => ({
        ...row,
        // Topics are now returned as simple string array from view
        topics: Array.isArray(row.topics) ? row.topics.filter(Boolean) : [],
        speakers: Array.isArray(row.speakers)
          ? row.speakers.map((s: any) => ({
              name: s?.name ?? null,
              title: s?.title ?? null,
              topic: s?.topic ?? null,
            }))
          : [],
        registered: Number(row.rsvp_total ?? 0),
      }));
    };

    if (admin && all) {
      const queryStart = Date.now();
      const { rows } = await db.execute(
        sql`select * from event_summary order by date asc`,
      );
      const queryDuration = Date.now() - queryStart;
      logger.slowQuery("GET /api/events?all=1", queryDuration, {
        eventCount: rows.length,
      });

      const grouped = buildResponse(rows);
      logger.api("GET", "/api/events", 200, Date.now() - startTime, {
        admin: true,
        count: grouped.length,
      });
      return NextResponse.json(grouped);
    }

    // Public requests (cacheable)
    const queryStart = Date.now();
    const { rows } = await db.execute(sql`
      select * from event_summary
      where published = true
      order by date asc
    `);
    const queryDuration = Date.now() - queryStart;
    logger.slowQuery("GET /api/events (public)", queryDuration, {
      eventCount: rows.length,
    });

    const grouped = buildResponse(rows);
    logger.api("GET", "/api/events", 200, Date.now() - startTime, {
      count: grouped.length,
    });
    return NextResponse.json(grouped);
  } catch (e) {
    logger.error("Failed to list events", {
      error: e as Error,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: "Failed to list events" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = EventInput.parse(body);
    const now = new Date();

    // Create event (removed transaction as neon-http doesn't support it)
    const [inserted] = await db
      .insert(schema.events)
      .values({
        slug: String(parsed.slug),
        title: DOMPurify.sanitize(parsed.title) as any,
        description: parsed.description
          ? (DOMPurify.sanitize(parsed.description) as any)
          : null,
        date: new Date(parsed.date),
        city: parsed.city ? (DOMPurify.sanitize(parsed.city) as any) : null,
        venue: parsed.venue
          ? (DOMPurify.sanitize(parsed.venue) as any)
          : null,
        image: parsed.image
          ? (DOMPurify.sanitize(parsed.image) as any)
          : null,
        capacity: parsed.capacity ?? 0,
        published: Boolean(parsed.published),
        createdBy: admin?.id ? String(admin.id) : "admin",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.events.id });
    const id = inserted.id;

    if (parsed.topics?.length) {
      await db
        .insert(schema.eventTopics)
        .values(parsed.topics.map((t) => ({ eventId: id, topic: t })));
    }
    if (parsed.speakers?.length) {
      await db
        .insert(schema.eventSpeakers)
        .values(
          parsed.speakers.map((s) => ({
            eventId: id,
            name: s.name,
            title: s.title ?? null,
            topic: s.topic ?? null,
          })),
        );
    }
    // Audit log
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "event.create",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "event",
      entityId: id,
      oldValues: null,
      newValues: { id, slug: parsed.slug, title: parsed.title },
      ipAddress: ip,
    });

    // Revalidate cached pages
    revalidatePath("/api/events");
    revalidatePath("/events");

    logger.info("Event created", {
      eventId: id,
      slug: parsed.slug,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    logger.error("Failed to create event", {
      error: e as Error,
      duration: Date.now() - startTime,
    });
    return handleApiError(e);
  }
}
