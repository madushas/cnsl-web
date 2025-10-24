import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, desc, eq, ilike, or, inArray, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'

function csvEscape(val: any): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  // Prevent formula injection in spreadsheet tools
  const dangerous = /^[=+\-@]/
  const safe = dangerous.test(s) ? `'${s}` : s
  if (/[",\n]/.test(safe)) return '"' + safe.replace(/"/g, '""') + '"'
  return safe
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin()
    const { slug } = await params
    const { searchParams } = new URL(req.url)

    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const checkpoint = (searchParams.get('checkpoint') || '').trim()
    const idsRaw = (searchParams.get('ids') || '').trim()
    const ids = idsRaw ? idsRaw.split(',').map(s => s.trim()).filter(Boolean) : []

    const [event] = await db.select({ id: schema.events.id, title: schema.events.title }).from(schema.events).where(eq(schema.events.slug, slug)).limit(1)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const whereClauses: any[] = [eq(schema.rsvps.eventId, event.id)]
    if (status) whereClauses.push(eq(schema.rsvps.status, status))
    if (ids.length) whereClauses.push(inArray(schema.rsvps.id, ids))
    if (q) {
      const pattern = `%${q}%`
      whereClauses.push(or(
        ilike(schema.rsvps.name, pattern),
        ilike(schema.rsvps.email, pattern),
        ilike(schema.rsvps.affiliation, pattern),
        ilike(schema.users.linkedin, pattern),
        ilike(schema.users.twitter, pattern),
        ilike(schema.users.github, pattern),
        ilike(schema.users.website, pattern),
        ilike(schema.users.company, pattern),
        ilike(schema.users.title, pattern),
      ))
    }
    // Optional checkpoint filter for export
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
        entryAt: sql<Date | null>`(
          SELECT max(sc.scanned_at) FROM checkpoint_scans sc
          WHERE sc.rsvp_id = ${schema.rsvps.id}
            AND sc.event_id = ${event.id}
            AND sc.checkpoint_type = 'entry'
        )`,
        refreshmentAt: sql<Date | null>`(
          SELECT max(sc.scanned_at) FROM checkpoint_scans sc
          WHERE sc.rsvp_id = ${schema.rsvps.id}
            AND sc.event_id = ${event.id}
            AND sc.checkpoint_type = 'refreshment'
        )`,
        swagAt: sql<Date | null>`(
          SELECT max(sc.scanned_at) FROM checkpoint_scans sc
          WHERE sc.rsvp_id = ${schema.rsvps.id}
            AND sc.event_id = ${event.id}
            AND sc.checkpoint_type = 'swag'
        )`,
      })
      .from(schema.rsvps)
      .leftJoin(schema.users, eq(schema.users.authUserId, schema.rsvps.accountId))
      .where(whereExpr)
      .orderBy(desc(schema.rsvps.createdAt))

    const headers = [
      'id','name','email','affiliation','status','ticketNumber','qrCode','checkedInAt','createdAt',
      'entryAt','refreshmentAt','swagAt',
      'accountId','linkedin','twitter','github','website','company','title'
    ]
    const lines: string[] = []
    lines.push(headers.join(','))
    for (const it of items) {
      const row = [
        it.id,
        it.name,
        it.email,
        it.affiliation,
        it.status,
        it.ticketNumber,
        it.qrCode,
        it.checkedInAt ? new Date(it.checkedInAt as any).toISOString() : '',
        it.createdAt ? new Date(it.createdAt as any).toISOString() : '',
        it.entryAt ? new Date(it.entryAt as any).toISOString() : '',
        it.refreshmentAt ? new Date(it.refreshmentAt as any).toISOString() : '',
        it.swagAt ? new Date(it.swagAt as any).toISOString() : '',
        it.accountId,
        it.profile_linkedin,
        it.profile_twitter,
        it.profile_github,
        it.profile_website,
        it.profile_company,
        it.profile_title,
      ].map(csvEscape)
      lines.push(row.join(','))
    }
    const csv = lines.join('\n')

    const filename = `rsvps-${slug}-${Date.now()}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      }
    })
  } catch (e: any) {
    return handleApiError(e)
  }
}
