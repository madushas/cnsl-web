import 'server-only'
import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { and, desc, eq, or, sql, ilike } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, apiError, paginationMeta } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
    const { slug } = await params
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')))
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const checkpoint = (searchParams.get('checkpoint') || '').trim()

    const [event] = await db.select({ id: schema.events.id }).from(schema.events).where(eq(schema.events.slug, slug)).limit(1)
    if (!event) return apiError('NOT_FOUND', 'Event not found', 404)

    const whereClauses: any[] = [eq(schema.rsvps.eventId, event.id)]
    if (status) whereClauses.push(eq(schema.rsvps.status, status))
    if (q) {
      const pattern = `%${q}%`
      whereClauses.push(or(
        ilike(schema.rsvps.name, pattern),
        ilike(schema.rsvps.email, pattern),
        ilike(schema.rsvps.affiliation, pattern),
        // profile fields
        ilike(schema.users.linkedin, pattern),
        ilike(schema.users.twitter, pattern),
        ilike(schema.users.github, pattern),
        ilike(schema.users.website, pattern),
        ilike(schema.users.company, pattern),
        ilike(schema.users.title, pattern),
      ))
    }

    // Checkpoint filter (supports: 'entry' | 'refreshment' | 'swag' | 'missing-entry' | 'missing-refreshment' | 'missing-swag')
    if (checkpoint) {
      const types = ['entry', 'refreshment', 'swag'] as const
      const isMissing = checkpoint.startsWith('missing-')
      const cp = (isMissing ? checkpoint.replace('missing-', '') : checkpoint) as typeof types[number]
      if ((types as readonly string[]).includes(cp)) {
        if (isMissing) {
          whereClauses.push(sql`NOT EXISTS (
            SELECT 1 FROM checkpoint_scans sc
            WHERE sc.rsvp_id = ${schema.rsvps.id}
              AND sc.event_id = ${event.id}
              AND sc.checkpoint_type = ${cp}
          )`)
        } else {
          whereClauses.push(sql`EXISTS (
            SELECT 1 FROM checkpoint_scans sc
            WHERE sc.rsvp_id = ${schema.rsvps.id}
              AND sc.event_id = ${event.id}
              AND sc.checkpoint_type = ${cp}
          )`)
        }
      }
    }

    const whereExpr = and(...whereClauses)

    // Count total with same where
    const [{ c: total }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(schema.rsvps)
      .leftJoin(schema.users, eq(schema.users.authUserId, schema.rsvps.accountId))
      .where(whereExpr)

    // Aggregates for capacity banner
    const [{ c: approvedCount }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(and(eq(schema.rsvps.eventId, event.id), eq(schema.rsvps.status, 'approved')))

    const [{ c: pendingCount }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(and(eq(schema.rsvps.eventId, event.id), eq(schema.rsvps.status, 'pending')))

    // PERF-02 fix: Optimized query using LEFT JOIN with conditional aggregation
    // instead of 3 scalar subqueries (N×3 queries → 1 query with JOIN)
    const items = await db
      .select({
        id: schema.rsvps.id,
        name: schema.rsvps.name,
        email: schema.rsvps.email,
        affiliation: schema.rsvps.affiliation,
        status: schema.rsvps.status,
        createdAt: schema.rsvps.createdAt,
        notifiedAt: schema.rsvps.notifiedAt,
        ticketNumber: schema.rsvps.ticketNumber,
        qrCode: schema.rsvps.qrCode,
        checkedInAt: schema.rsvps.checkedInAt,
        accountId: schema.rsvps.accountId,
        profile_linkedin: schema.users.linkedin,
        profile_twitter: schema.users.twitter,
        profile_github: schema.users.github,
        profile_website: schema.users.website,
        profile_company: schema.users.company,
        profile_title: schema.users.title,
        // Optimized checkpoint timestamps using conditional aggregation
        entryAt: sql<Date | null>`MAX(CASE WHEN ${schema.checkpointScans.checkpointType} = 'entry' THEN ${schema.checkpointScans.scannedAt} END)`,
        refreshmentAt: sql<Date | null>`MAX(CASE WHEN ${schema.checkpointScans.checkpointType} = 'refreshment' THEN ${schema.checkpointScans.scannedAt} END)`,
        swagAt: sql<Date | null>`MAX(CASE WHEN ${schema.checkpointScans.checkpointType} = 'swag' THEN ${schema.checkpointScans.scannedAt} END)`,
      })
      .from(schema.rsvps)
      .leftJoin(schema.users, eq(schema.users.authUserId, schema.rsvps.accountId))
      .leftJoin(
        schema.checkpointScans,
        and(
          eq(schema.checkpointScans.rsvpId, schema.rsvps.id),
          eq(schema.checkpointScans.eventId, event.id)
        )
      )
      .where(whereExpr)
      .groupBy(
        schema.rsvps.id,
        schema.rsvps.name,
        schema.rsvps.email,
        schema.rsvps.affiliation,
        schema.rsvps.status,
        schema.rsvps.createdAt,
        schema.rsvps.notifiedAt,
        schema.rsvps.ticketNumber,
        schema.rsvps.qrCode,
        schema.rsvps.checkedInAt,
        schema.rsvps.accountId,
        schema.users.linkedin,
        schema.users.twitter,
        schema.users.github,
        schema.users.website,
        schema.users.company,
        schema.users.title
      )
      .orderBy(desc(schema.rsvps.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const mapped = items.map(it => ({
      id: it.id,
      accountId: it.accountId,
      name: it.name,
      email: it.email,
      affiliation: it.affiliation,
      status: it.status,
      createdAt: it.createdAt,
      notifiedAt: it.notifiedAt,
      ticketNumber: it.ticketNumber,
      qrCode: it.qrCode,
      checkedInAt: it.checkedInAt,
      checkpoints: {
        hasEntry: !!it.entryAt,
        hasRefreshment: !!it.refreshmentAt,
        hasSwag: !!it.swagAt,
        entryScannedAt: it.entryAt,
        refreshmentScannedAt: it.refreshmentAt,
        swagScannedAt: it.swagAt,
      },
      profile: {
        linkedin: it.profile_linkedin,
        twitter: it.profile_twitter,
        github: it.profile_github,
        website: it.profile_website,
        company: it.profile_company,
        title: it.profile_title,
      },
    }))

    return apiSuccess(
      { items: mapped, total: Number(total) || 0, page, pageSize, approvedCount: Number(approvedCount) || 0, pendingCount: Number(pendingCount) || 0 },
      200,
      paginationMeta(page, pageSize, Number(total) || 0)
    )
  } catch (e: any) {
    return handleApiError(e)
  }
}
