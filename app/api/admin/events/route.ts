import 'server-only'
import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { and, asc, desc, eq, inArray, or, sql, ilike } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, parsePaginationParams, paginationMeta } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)

    const { page, limit: pageSize, offset } = parsePaginationParams(searchParams)
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim() // 'published' | 'draft' | ''
    const timeframe = (searchParams.get('timeframe') || '').trim() // 'upcoming' | 'past' | ''

    const whereClauses: any[] = [sql`${schema.events.deletedAt} IS NULL`]
    if (q) {
      const pattern = `%${q}%`
      whereClauses.push(or(
        ilike(schema.events.title, pattern),
        ilike(schema.events.slug, pattern),
        ilike(schema.events.city, pattern),
        ilike(schema.events.venue, pattern),
      ))
    }
    if (status === 'published') whereClauses.push(eq(schema.events.published, true))
    if (status === 'draft') whereClauses.push(eq(schema.events.published, false))
    if (timeframe === 'upcoming') whereClauses.push(sql`${schema.events.date} >= now()`)
    if (timeframe === 'past') whereClauses.push(sql`${schema.events.date} < now()`)

    const whereExpr = whereClauses.length ? and(...whereClauses) : undefined as any

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.events)
      .where(whereExpr)

    // Smart sorting: upcoming events by date asc, past events by date desc
    const orderExpr = timeframe === 'past' ? desc(schema.events.date) : asc(schema.events.date)

    const items = await db
      .select()
      .from(schema.events)
      .where(whereExpr)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset)

    // augment with RSVP counts
    const ids = items.map(i => i.id).filter(Boolean) as string[]
    let counts: Array<{ eventId: string | null; c: number }> = []
    if (ids.length) {
      counts = await db
        .select({ eventId: schema.rsvps.eventId, c: sql<number>`count(*)` })
        .from(schema.rsvps)
        .where(inArray(schema.rsvps.eventId, ids))
        .groupBy(schema.rsvps.eventId)
    }

    const enriched = items.map(i => ({
      ...i,
      registered: Number((counts.find(x => x.eventId === i.id)?.c) ?? 0),
    }))

    return apiSuccess(
      { items: enriched, total: Number(count) || 0, page, pageSize },
      200,
      paginationMeta(page, pageSize, Number(count) || 0)
    )
  } catch (e: any) {
    return handleApiError(e)
  }
}
