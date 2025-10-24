import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, desc, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug') || undefined
    const status = searchParams.get('status') || undefined

    let eventId: string | undefined
    if (slug) {
      const ev = await db.select({ id: schema.events.id }).from(schema.events).where(eq(schema.events.slug, slug)).limit(1)
      eventId = ev?.[0]?.id
      if (!eventId) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const rows = await db
      .select({
        id: schema.rsvps.id,
        eventId: schema.rsvps.eventId,
        name: schema.rsvps.name,
        email: schema.rsvps.email,
        affiliation: schema.rsvps.affiliation,
        status: schema.rsvps.status,
        createdAt: schema.rsvps.createdAt,
        notifiedAt: schema.rsvps.notifiedAt,
        eventSlug: schema.events.slug,
        eventTitle: schema.events.title,
        eventDate: schema.events.date,
      })
      .from(schema.rsvps)
      .innerJoin(schema.events, eq(schema.events.id, schema.rsvps.eventId))
      .where(
        status && eventId
          ? and(eq(schema.rsvps.eventId, eventId), eq(schema.rsvps.status, status))
          : eventId
          ? eq(schema.rsvps.eventId, eventId)
          : status
          ? eq(schema.rsvps.status, status)
          : undefined as any
      )
      .orderBy(desc(schema.rsvps.createdAt))

    return NextResponse.json({ items: rows })
  } catch (e: any) {
    return handleApiError(e)
  }
}
