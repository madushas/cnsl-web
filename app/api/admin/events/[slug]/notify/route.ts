import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, eq, inArray, or, ilike } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { BulkEmailTarget, BulkEmailPayload, createBulkEmailJob, runBulkEmailJob } from '@/lib/jobs'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/errors'
import { validateRequest, notifySchema } from '@/lib/validation'
import { checkExpensiveOpLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const t0 = Date.now()
  const endpoint = (() => { try { return new URL(req.url).pathname } catch { return '/api/admin/events/[slug]/notify' } })()
  let slugForLog: string | undefined
  try {
    const admin = await requireAdmin()
    
    // SEC-05 fix: Rate limit bulk email operations (1 request per minute per admin)
    const rateLimitKey = `admin:${admin.id}:bulk-email`
    const rateCheck = await checkExpensiveOpLimit(rateLimitKey, 1, 60)
    if (!rateCheck.allowed) {
      logger.warn('Bulk email rate limit exceeded', { 
        adminId: admin.id, 
        resetAt: rateCheck.resetAt.toISOString() 
      })
      // SEC-08 fix: Log failed operations for security monitoring
      await logAudit({
        action: 'bulk_email.rate_limited',
        userId: admin.id,
        entityType: 'event',
        entityId: null,
        oldValues: { reason: 'rate_limit_exceeded', resetAt: rateCheck.resetAt.toISOString() },
        newValues: null,
        ipAddress: req.headers.get('x-forwarded-for'),
      })
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before sending another bulk email.',
        resetAt: rateCheck.resetAt.toISOString()
      }, { status: 429 })
    }
    const { slug } = await params
    slugForLog = slug
    const body = await req.json().catch(() => null)
    const parsed = validateRequest(notifySchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 })
    }
    const { subject, preheader, html, q = '', status = '', ids = [], ratePerMinute } = parsed.data

    logger.info('admin.email.notify.start', { slug, endpoint, filters: { q, status, ids: ids.length }, ratePerMinute })

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
        ilike(schema.rsvps.email, pattern),
        ilike(schema.rsvps.affiliation, pattern),
      ))
    }

    // DB-05 fix: Add safety limit to prevent unbounded queries
    const rows = await db
      .select({ 
        id: schema.rsvps.id, 
        email: schema.rsvps.email, 
        name: schema.rsvps.name, 
        ticketNumber: schema.rsvps.ticketNumber, 
        qrCode: schema.rsvps.qrCode 
      })
      .from(schema.rsvps)
      .where(and(...whereClauses))
      .limit(1000) // Safety limit for bulk operations
    
    if (rows.length >= 1000) {
      logger.warn('Bulk email query hit safety limit', { 
        slug, 
        filters: { q, status, idsCount: ids.length },
        returned: rows.length 
      })
    }
    
    const targets: BulkEmailTarget[] = rows
      .map(r => ({
        id: r.id,
        email: r.email,
        name: r.name || '',
        eventTitle: event.title,
        ticketNumber: r.ticketNumber || undefined,
        qrCode: r.qrCode || undefined,
      }))
      .filter(t => !!t.email)

    if (!targets.length) return NextResponse.json({ error: 'No targets found for filters' }, { status: 400 })

    const payload: BulkEmailPayload = { subject, preheader, html, ratePerMinute, targets }
    const jobId = createBulkEmailJob(payload, { slug, count: targets.length })

    // Fire and forget runner (in-memory). In production, use a queue (e.g., Upstash Redis) + worker.
    runBulkEmailJob(jobId, payload, event.title)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'admin.email.notify',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'event',
      entityId: event.id as any,
      oldValues: {},
      newValues: { subject, count: targets.length, ratePerMinute },
      ipAddress: ip,
    })

    const duration = Date.now() - t0
    logger.info('admin.email.notify.ok', { slug, jobId, total: targets.length, duration })
    logger.api('POST', endpoint, 200, duration, { slug, jobId, total: targets.length })
    return NextResponse.json({ ok: true, jobId, total: targets.length })
  } catch (e: any) {
    const duration = Date.now() - t0
    logger.error('admin.email.notify.error', { endpoint, slug: slugForLog, error: e?.message })
    logger.api('POST', endpoint, 400, duration, { slug: slugForLog, error: e?.message })
    return handleApiError(e)
  }
}
