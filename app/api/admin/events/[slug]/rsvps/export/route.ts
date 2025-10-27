import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

function csvEscape(val: any): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  // Prevent formula injection in spreadsheet tools
  const dangerous = /^[=+\-@]/;
  const safe = dangerous.test(s) ? `'${s}` : s;
  if (/[",\n]/.test(safe)) return '"' + safe.replace(/"/g, '""') + '"';
  return safe;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const checkpoint = (searchParams.get("checkpoint") || "").trim();
    const idsRaw = (searchParams.get("ids") || "").trim();
    const ids = idsRaw
      ? idsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const conditions: any[] = [sql`rs.event_id = ${event.id}`];
    if (status) conditions.push(sql`rs.status = ${status}`);
    if (ids.length) {
      const idList = sql.join(
        ids.map((id) => sql`${id}`),
        sql`, `,
      );
      conditions.push(sql`rs.id = ANY(ARRAY[${idList}]::uuid[])`);
    }
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(sql`(
        rs.name ILIKE ${pattern} OR
        rs.email ILIKE ${pattern} OR
        rs.affiliation ILIKE ${pattern} OR
        COALESCE(rs.linkedin, '') ILIKE ${pattern} OR
        COALESCE(rs.twitter, '') ILIKE ${pattern} OR
        COALESCE(rs.github, '') ILIKE ${pattern} OR
        COALESCE(rs.website, '') ILIKE ${pattern} OR
        COALESCE(rs.company, '') ILIKE ${pattern} OR
        COALESCE(rs.title, '') ILIKE ${pattern}
      )`);
    }
    if (checkpoint) {
      const types = ["entry", "refreshment", "swag"] as const;
      const isMissing = checkpoint.startsWith("missing-");
      const cp = (
        isMissing ? checkpoint.replace("missing-", "") : checkpoint
      ) as (typeof types)[number];
      if ((types as readonly string[]).includes(cp)) {
        if (isMissing) {
          conditions.push(sql`${sql.identifier(cp + "_scanned_at")} IS NULL`);
        } else {
          conditions.push(
            sql`${sql.identifier(cp + "_scanned_at")} IS NOT NULL`,
          );
        }
      }
    }

    const whereClause = conditions.length
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
      : sql``;

    const query = sql`
      SELECT
        rs.id,
        rs.name,
        rs.email,
        rs.affiliation,
        rs.status,
        rs.created_at,
        rs.notified_at,
        rs.ticket_number,
        rs.qr_code,
        rs.checked_in_at,
        rs.account_id,
        rs.linkedin,
        rs.twitter,
        rs.github,
        rs.website,
        rs.company,
        rs.title,
        rs.entry_scanned_at,
        rs.refreshment_scanned_at,
        rs.swag_scanned_at
      FROM rsvp_search rs
      ${whereClause}
      ORDER BY rs.created_at DESC
    `;

    const { rows: items } = await db.execute(query);

    const headers = [
      "id",
      "name",
      "email",
      "affiliation",
      "status",
      "ticketNumber",
      "qrCode",
      "checkedInAt",
      "createdAt",
      "entryAt",
      "refreshmentAt",
      "swagAt",
      "accountId",
      "linkedin",
      "twitter",
      "github",
      "website",
      "company",
      "title",
    ];
    const lines: string[] = [];
    lines.push(headers.join(","));
    for (const it of items) {
      const row = [
        it.id,
        it.name,
        it.email,
        it.affiliation,
        it.status,
        it.ticket_number,
        it.qr_code,
        it.checked_in_at ? new Date(it.checked_in_at as any).toISOString() : "",
        it.created_at ? new Date(it.created_at as any).toISOString() : "",
        it.entry_scanned_at
          ? new Date(it.entry_scanned_at as any).toISOString()
          : "",
        it.refreshment_scanned_at
          ? new Date(it.refreshment_scanned_at as any).toISOString()
          : "",
        it.swag_scanned_at
          ? new Date(it.swag_scanned_at as any).toISOString()
          : "",
        it.account_id,
        it.linkedin,
        it.twitter,
        it.github,
        it.website,
        it.company,
        it.title,
      ].map(csvEscape);
      lines.push(row.join(","));
    }
    const csv = lines.join("\n");

    const filename = `rsvps-${slug}-${Date.now()}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return handleApiError(e);
  }
}
