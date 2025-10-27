import "server-only";
import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  apiSuccess,
  apiError,
  parsePaginationParams,
  paginationMeta,
} from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user?.id && !user?.email)
    return apiError("UNAUTHORIZED", "Not authenticated", 401);

  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePaginationParams(searchParams);

  const ownershipConditions: any[] = [];
  if (user.id)
    ownershipConditions.push(sql`rs.account_id = ${String(user.id)}`);
  if (user.email) {
    ownershipConditions.push(sql`rs.account_email = ${String(user.email)}`);
    ownershipConditions.push(sql`rs.email = ${String(user.email)}`);
  }

  const whereClause = ownershipConditions.length
    ? sql`WHERE ${sql.join(ownershipConditions, sql` OR `)}`
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
      rs.ticket_number,
      rs.qr_code,
      e.slug,
      e.title,
      e.date,
      e.city,
      e.venue,
      COUNT(*) OVER() AS total_count
    FROM rsvp_search rs
    INNER JOIN events e ON e.id = rs.event_id
    ${whereClause}
    ORDER BY rs.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const { rows } = await db.execute(query);
  const total = Number(rows?.[0]?.total_count ?? 0);

  const mapped = rows.map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    name: row.name,
    email: row.email,
    affiliation: row.affiliation,
    status: row.status,
    created_at: row.created_at,
    ticket_number: row.ticket_number,
    qr_code: row.qr_code,
    slug: row.slug,
    title: row.title,
    date: row.date,
    city: row.city,
    venue: row.venue,
  }));

  return apiSuccess(
    {
      user: { id: user.id, email: user.email, name: user.name },
      rsvps: mapped,
    },
    200,
    paginationMeta(page, limit, total),
  );
}
