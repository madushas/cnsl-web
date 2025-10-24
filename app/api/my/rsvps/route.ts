import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { db, schema } from '@/db'
import { desc, eq, or, sql } from 'drizzle-orm'
import { apiSuccess, apiError, parsePaginationParams, paginationMeta } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user?.id && !user?.email) return apiError('UNAUTHORIZED', 'Not authenticated', 401)
  
  const { searchParams } = new URL(req.url)
  const { page, limit, offset } = parsePaginationParams(searchParams)
  
  const whereCondition = or(
    eq(schema.rsvps.accountId, String(user.id || '')),
    eq(schema.rsvps.accountEmail, String(user.email || '')),
    eq(schema.rsvps.email, String(user.email || ''))
  )
  
  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.rsvps)
    .where(whereCondition)
  
  const rows = await db
    .select({
      id: schema.rsvps.id,
      event_id: schema.rsvps.eventId,
      name: schema.rsvps.name,
      email: schema.rsvps.email,
      affiliation: schema.rsvps.affiliation,
      status: schema.rsvps.status,
      created_at: schema.rsvps.createdAt,
      ticket_number: schema.rsvps.ticketNumber,
      qr_code: schema.rsvps.qrCode,
      slug: schema.events.slug,
      title: schema.events.title,
      date: schema.events.date,
      city: schema.events.city,
      venue: schema.events.venue,
    })
    .from(schema.rsvps)
    .innerJoin(schema.events, eq(schema.events.id, schema.rsvps.eventId))
    .where(whereCondition)
    .orderBy(desc(schema.rsvps.createdAt))
    .limit(limit)
    .offset(offset)

  return apiSuccess(
    { user: { id: user.id, email: user.email, name: user.name }, rsvps: rows },
    200,
    paginationMeta(page, limit, Number(count))
  )
}
