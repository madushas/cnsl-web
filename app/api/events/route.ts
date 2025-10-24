import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { EventInput } from '@/lib/validation'
import { isAdmin, requireAdmin } from '@/lib/auth'
import { db, schema } from '@/db'
import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { logAudit } from '@/lib/audit'
import DOMPurify from 'isomorphic-dompurify'
import { handleApiError } from '@/lib/errors'

// Cache public events list for 60 seconds
export const revalidate = 60

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const admin = await isAdmin()
    const all = req.nextUrl.searchParams.get('all') === '1'
    
    // Admin requests bypass cache
    if (admin && all) {
      const queryStart = Date.now()
      const rows = await db
        .select()
        .from(schema.events)
        .where(sql`${schema.events.deletedAt} IS NULL`)
        .orderBy(asc(schema.events.date))
      const ids = rows.map(r => r.id).filter(Boolean) as string[]
      const topics = ids.length ? await db.select().from(schema.eventTopics).where(inArray(schema.eventTopics.eventId, ids)) : []
      const speakers = ids.length ? await db.select().from(schema.eventSpeakers).where(inArray(schema.eventSpeakers.eventId, ids)) : []
      const counts = ids.length
        ? await db.select({ eventId: schema.rsvps.eventId, c: sql<number>`count(*)` })
            .from(schema.rsvps)
            .where(inArray(schema.rsvps.eventId, ids))
            .groupBy(schema.rsvps.eventId)
        : []
      
      const queryDuration = Date.now() - queryStart
      logger.slowQuery('GET /api/events?all=1', queryDuration, { eventCount: rows.length })
      
      const grouped = rows.map((e) => ({
        ...e,
        topics: topics.filter(t => t.eventId === e.id).map(t => t.topic),
        speakers: speakers.filter(s => s.eventId === e.id).map(s => ({ name: s.name, title: s.title, topic: s.topic })),
        registered: Number((counts.find((x: any) => x.eventId === e.id)?.c) ?? 0),
      }))
      
      logger.api('GET', '/api/events', 200, Date.now() - startTime, { admin: true, count: grouped.length })
      return NextResponse.json(grouped)
    }
    
    // Public requests (cacheable)
    const queryStart = Date.now()
    const rows = await db
      .select()
      .from(schema.events)
      .where(and(eq(schema.events.published, true), sql`${schema.events.deletedAt} IS NULL`))
      .orderBy(asc(schema.events.date))
    const ids = rows.map(r => r.id).filter(Boolean) as string[]
    const topics = ids.length ? await db.select().from(schema.eventTopics).where(inArray(schema.eventTopics.eventId, ids)) : []
    const speakers = ids.length ? await db.select().from(schema.eventSpeakers).where(inArray(schema.eventSpeakers.eventId, ids)) : []
    const counts = ids.length
      ? await db.select({ eventId: schema.rsvps.eventId, c: sql<number>`count(*)` })
          .from(schema.rsvps)
          .where(inArray(schema.rsvps.eventId, ids))
          .groupBy(schema.rsvps.eventId)
      : []
    
    const queryDuration = Date.now() - queryStart
    logger.slowQuery('GET /api/events (public)', queryDuration, { eventCount: rows.length })
    
    const grouped = rows.map((e) => ({
      ...e,
      topics: topics.filter(t => t.eventId === e.id).map(t => t.topic),
      speakers: speakers.filter(s => s.eventId === e.id).map(s => ({ name: s.name, title: s.title, topic: s.topic })),
      registered: Number((counts.find((x: any) => x.eventId === e.id)?.c) ?? 0),
    }))
    
    logger.api('GET', '/api/events', 200, Date.now() - startTime, { count: grouped.length })
    return NextResponse.json(grouped)
  } catch (e) {
    logger.error('Failed to list events', { error: e as Error, duration: Date.now() - startTime })
    return NextResponse.json({ error: 'Failed to list events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const parsed = EventInput.parse(body)
    const now = new Date()
    
    // Wrap in transaction to ensure atomicity (DB-04 fix)
    const id = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(schema.events).values({
        slug: String(parsed.slug),
        title: DOMPurify.sanitize(parsed.title) as any,
        description: parsed.description ? (DOMPurify.sanitize(parsed.description) as any) : null,
        date: new Date(parsed.date),
        city: parsed.city ? (DOMPurify.sanitize(parsed.city) as any) : null,
        venue: parsed.venue ? (DOMPurify.sanitize(parsed.venue) as any) : null,
        image: parsed.image ? (DOMPurify.sanitize(parsed.image) as any) : null,
        capacity: parsed.capacity ?? 0,
        published: Boolean(parsed.published),
        createdBy: (admin?.id ? String(admin.id) : 'admin'),
        createdAt: now,
        updatedAt: now,
      }).returning({ id: schema.events.id })
      const eventId = inserted.id
      
      if (parsed.topics?.length) {
        await tx.insert(schema.eventTopics).values(parsed.topics.map(t => ({ eventId, topic: t })))
      }
      if (parsed.speakers?.length) {
        await tx.insert(schema.eventSpeakers).values(parsed.speakers.map(s => ({ eventId, name: s.name, title: s.title ?? null, topic: s.topic ?? null })))
      }
      
      return eventId
    })
    // Audit log
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'event.create',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'event',
      entityId: id,
      oldValues: null,
      newValues: { id, slug: parsed.slug, title: parsed.title },
      ipAddress: ip,
    })
    
    // Revalidate cached pages
    revalidatePath('/api/events')
    revalidatePath('/events')
    
    logger.info('Event created', { 
      eventId: id, 
      slug: parsed.slug, 
      duration: Date.now() - startTime 
    })
    
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    logger.error('Failed to create event', { 
      error: e as Error, 
      duration: Date.now() - startTime 
    })
    return handleApiError(e)
  }
}
