import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, desc, eq, inArray, or, sql, ilike } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { BulkEmailTarget, renderBulkEmailTemplate } from '@/lib/jobs'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/errors'
import { validateRequest, previewEmailSchema } from '@/lib/validation'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const t0 = Date.now()
  const endpoint = (() => { try { return new URL(req.url).pathname } catch { return '/api/admin/events/[slug]/preview-email' } })()
  let slugForLog: string | undefined
  try {
    const admin = await requireAdmin()
    const { slug } = await params
    slugForLog = slug
    const body = await req.json().catch(() => null)
    const parsed = validateRequest(previewEmailSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 })
    }
    const { subject, preheader, html, q = '', status = '', ids = [] } = parsed.data

    logger.info('admin.email.preview.start', { slug, endpoint, filters: { q, status, ids: ids.length } })

    if (!subject || !html) return NextResponse.json({ error: 'subject and html are required' }, { status: 400 })

    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const whereClauses: any[] = [eq(schema.rsvps.eventId, event.id)]
    if (ids.length) whereClauses.push(inArray(schema.rsvps.id, ids))
    if (status) whereClauses.push(eq(schema.rsvps.status, status))
    if (q) {
      const pattern = `%${q}%`
      whereClauses.push(or(
        ilike(schema.rsvps.name, pattern),
        ilike(schema.rsvps.email, pattern),
        ilike(schema.rsvps.affiliation, pattern),
      ))
    }
    const whereExpr = and(...whereClauses)

    const [{ c: total }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(whereExpr)

    const rows = await db
      .select({
        id: schema.rsvps.id,
        email: schema.rsvps.email,
        rsvpName: schema.rsvps.name,
        ticketNumber: schema.rsvps.ticketNumber,
        qrCode: schema.rsvps.qrCode,
        userName: schema.users.name,
      })
      .from(schema.rsvps)
      .leftJoin(schema.users, eq(schema.users.authUserId, schema.rsvps.accountId))
      .where(whereExpr)
      .orderBy(desc(schema.rsvps.createdAt))
      .limit(1)

    const sampleRow = rows[0]
    const target: BulkEmailTarget | null = sampleRow
      ? {
          id: sampleRow.id,
          email: sampleRow.email,
          name: sampleRow.userName || sampleRow.rsvpName || '',
          eventTitle: event.title,
          ticketNumber: sampleRow.ticketNumber || undefined,
          qrCode: sampleRow.qrCode || undefined,
        }
      : null

    const rendered = target
      ? renderBulkEmailTemplate(subject, preheader, html, target, event.title)
      : { subject, html }

    await logAudit({
      action: 'admin.email.preview',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'event',
      entityId: event.id as any,
      oldValues: {},
      newValues: { subject, hasHtml: !!html, filters: { status, q, ids: ids.length } },
      ipAddress: req.headers.get('x-real-ip'),
    })

    const duration = Date.now() - t0
    logger.info('admin.email.preview.ok', { slug, total: Number(total) || 0, duration })
    logger.api('POST', endpoint, 200, duration, { userId: admin?.id ? String(admin.id) : undefined, slug, total: Number(total) || 0 })
    return NextResponse.json({ ok: true, total: Number(total) || 0, sampleTarget: target, subject: rendered.subject, html: rendered.html })
  } catch (e: any) {
    const duration = Date.now() - t0
    logger.error('admin.email.preview.error', { endpoint, slug: slugForLog, error: e?.message })
    logger.api('POST', endpoint, 400, duration, { error: e?.message, slug: slugForLog })
    return handleApiError(e)
  }
}
