import "server-only";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import {
  apiSuccess,
  parsePaginationParams,
  paginationMeta,
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const {
      page,
      limit: pageSize,
      offset,
    } = parsePaginationParams(searchParams);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim(); // 'published' | 'draft' | ''
    const timeframe = (searchParams.get("timeframe") || "").trim(); // 'upcoming' | 'past' | ''

    const conditions: any[] = [];

    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        sql`(title ILIKE ${pattern} OR slug ILIKE ${pattern} OR city ILIKE ${pattern} OR venue ILIKE ${pattern})`,
      );
    }
    if (status === "published") conditions.push(sql`published = true`);
    if (status === "draft") conditions.push(sql`published = false`);
    if (timeframe === "upcoming") conditions.push(sql`is_upcoming = true`);
    if (timeframe === "past") conditions.push(sql`is_past = true`);

    const whereClause = conditions.length
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
      : sql``;

    // Sort events: upcoming events by date ASC (soonest first), past events by date DESC (most recent first)
    // If no timeframe filter, show upcoming first, then past events
    const orderExpr = timeframe === "past" 
      ? sql`date DESC` 
      : timeframe === "upcoming"
      ? sql`date ASC`
      : sql`CASE WHEN is_upcoming THEN 0 ELSE 1 END, date ASC`;

    const countQuery = sql`
      SELECT count(*)::int AS count
      FROM event_summary
      ${whereClause}
    `;
    const { rows: countRows } = await db.execute(countQuery);
    const total = Number(countRows?.[0]?.count ?? 0);

    const dataQuery = sql`
      SELECT *
      FROM event_summary
      ${whereClause}
      ORDER BY ${orderExpr}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;
    const { rows } = await db.execute(dataQuery);

    const items = rows.map((row: any) => ({
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

    return apiSuccess(
      { items, total, page, pageSize },
      200,
      paginationMeta(page, pageSize, total),
    );
  } catch (e: any) {
    return handleApiError(e);
  }
}
