import "server-only";
import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError, paginationMeta } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") || "20")),
    );
    const q = searchParams.get("q")?.trim() || null;
    const status = searchParams.get("status")?.trim() || null;
    const checkpoint = searchParams.get("checkpoint")?.trim() || null;

    const [event] = await db
      .select({ id: schema.events.id })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event) return apiError("NOT_FOUND", "Event not found", 404);

    const fnResult = await db.execute(sql`
      select total, approved, pending, items
      from get_paginated_rsvps(
        ${slug},
        ${status},
        ${q},
        ${checkpoint},
        ${page},
        ${pageSize}
      )
    `);

    const dataset = fnResult.rows?.[0] ?? null;
    const itemsJson = Array.isArray(dataset?.items)
      ? dataset?.items
      : dataset?.items
        ? (dataset.items as any[])
        : [];
    const mapped = (itemsJson as any[]).map((it) => ({
      id: it.id,
      accountId: it.account_id,
      name: it.name,
      email: it.email,
      affiliation: it.affiliation,
      status: it.status,
      createdAt: it.created_at,
      notifiedAt: it.notified_at,
      ticketNumber: it.ticket_number,
      qrCode: it.qr_code,
      checkedInAt: it.checked_in_at,
      checkpoints: {
        hasEntry: !!it.entry_scanned_at,
        hasRefreshment: !!it.refreshment_scanned_at,
        hasSwag: !!it.swag_scanned_at,
        entryScannedAt: it.entry_scanned_at,
        refreshmentScannedAt: it.refreshment_scanned_at,
        swagScannedAt: it.swag_scanned_at,
      },
      profile: {
        linkedin: it.linkedin,
        twitter: it.twitter,
        github: it.github,
        website: it.website,
        company: it.company,
        title: it.title,
      },
    }));

    const total = Number(dataset?.total ?? 0);
    const approvedCount = Number(dataset?.approved ?? 0);
    const pendingCount = Number(dataset?.pending ?? 0);

    return apiSuccess(
      { items: mapped, total, page, pageSize, approvedCount, pendingCount },
      200,
      paginationMeta(page, pageSize, total),
    );
  } catch (e: any) {
    return handleApiError(e);
  }
}
