import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || undefined;
    const status = searchParams.get("status") || undefined;

    let eventId: string | undefined;
    if (slug) {
      const ev = await db
        .select({ id: schema.events.id })
        .from(schema.events)
        .where(eq(schema.events.slug, slug))
        .limit(1);
      eventId = ev?.[0]?.id;
      if (!eventId)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const conditions: any[] = [];
    if (eventId) conditions.push(sql`rs.event_id = ${eventId}`);
    if (status) conditions.push(sql`rs.status = ${status}`);

    const whereClause = conditions.length
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
      : sql``;

    const query = sql`
      SELECT
        rs.id,
        rs.event_id,
        rs.name,
        rs.email,
        rs.affiliation,
        rs.status,
        rs.created_at,
        rs.notified_at,
        rs.ticket_number,
        rs.qr_code,
        e.slug AS event_slug,
        e.title AS event_title,
        e.date AS event_date
      FROM rsvp_search rs
      INNER JOIN events e ON e.id = rs.event_id
      ${whereClause}
      ORDER BY rs.created_at DESC
    `;

    const { rows } = await db.execute(query);

    const mapped = rows.map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      name: row.name,
      email: row.email,
      affiliation: row.affiliation,
      status: row.status,
      createdAt: row.created_at,
      notifiedAt: row.notified_at,
      ticketNumber: row.ticket_number,
      qrCode: row.qr_code,
      eventSlug: row.event_slug,
      eventTitle: row.event_title,
      eventDate: row.event_date,
    }));

    return NextResponse.json({ items: mapped });
  } catch (e: any) {
    return handleApiError(e);
  }
}
