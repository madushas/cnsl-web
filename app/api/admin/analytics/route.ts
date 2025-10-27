import "server-only";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    await requireAdmin();

    // Optimize: Run all queries in parallel instead of sequentially
    const [
      [{ count: eventsTotal }],
      [{ count: upcomingEvents }],
      [{ count: rsvpsTotal }],
      [{ count: pendingRsvps }],
      [{ count: approvedRsvps }],
      series,
      topEvents,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.events),

      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.events)
        .where(sql`${schema.events.date} >= now()`),

      db.select({ count: sql<number>`count(*)` }).from(schema.rsvps),

      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.rsvps)
        .where(sql`${schema.rsvps.status} = 'pending'`),

      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.rsvps)
        .where(sql`${schema.rsvps.status} IN ('approved','invited')`),

      db
        .select({
          date: sql<string>`(date_trunc('day', ${schema.rsvps.createdAt})::date)::text`,
          count: sql<number>`count(*)`,
        })
        .from(schema.rsvps)
        .where(sql`${schema.rsvps.createdAt} >= now() - interval '30 days'`)
        .groupBy(sql`date_trunc('day', ${schema.rsvps.createdAt})`)
        .orderBy(sql`date_trunc('day', ${schema.rsvps.createdAt})`),

      db
        .select({
          slug: schema.events.slug,
          title: schema.events.title,
          count: sql<number>`count(*)`,
        })
        .from(schema.rsvps)
        .innerJoin(
          schema.events,
          sql`${schema.events.id} = ${schema.rsvps.eventId}`,
        )
        .where(sql`${schema.rsvps.createdAt} >= now() - interval '30 days'`)
        .groupBy(schema.events.slug, schema.events.title)
        .orderBy(sql`count(*) desc`)
        .limit(5),
    ]);

    return NextResponse.json({
      summary: {
        eventsTotal: Number(eventsTotal) || 0,
        upcomingEvents: Number(upcomingEvents) || 0,
        rsvpsTotal: Number(rsvpsTotal) || 0,
        pendingRsvps: Number(pendingRsvps) || 0,
        approvedRsvps: Number(approvedRsvps) || 0,
      },
      series,
      topEvents,
    });
  } catch (e: any) {
    return handleApiError(e);
  }
}
