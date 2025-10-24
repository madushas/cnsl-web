import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { sendEmail, sendTelegram } from '@/lib/notify'
import { escapeHtml } from '@/lib/utils'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json().catch(() => ({} as any))
    const statusRaw = body.status
    const status = typeof statusRaw === 'string' && statusRaw ? String(statusRaw).toLowerCase() : undefined
    const notify = Boolean(body.notify)
    const ticketNumberRaw = body.ticketNumber
    const ticketNumber = typeof ticketNumberRaw === 'string' && ticketNumberRaw.trim()
      ? String(ticketNumberRaw).trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 64)
      : undefined
    const allowed = new Set(['pending','approved','declined','waitlist','invited','cancelled'])
    if (status !== undefined && !allowed.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    if (status === undefined && ticketNumber === undefined) return NextResponse.json({ error: 'No changes provided' }, { status: 400 })

    // Load RSVP and event
    const rows = await db
      .select({
        id: schema.rsvps.id,
        email: schema.rsvps.email,
        name: schema.rsvps.name,
        status: schema.rsvps.status,
        ticketNumberPrev: schema.rsvps.ticketNumber,
        eventId: schema.rsvps.eventId,
        eventTitle: schema.events.title,
        eventSlug: schema.events.slug,
      })
      .from(schema.rsvps)
      .innerJoin(schema.events, eq(schema.events.id, schema.rsvps.eventId))
      .where(eq(schema.rsvps.id, id))
      .limit(1)
    const r = rows[0]
    if (!r) return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })

    const setUpdate: any = {}
    if (status !== undefined) setUpdate.status = status
    if (ticketNumber !== undefined) setUpdate.ticketNumber = ticketNumber
    if (notify) setUpdate.notifiedAt = new Date()
    await db.update(schema.rsvps)
      .set(setUpdate)
      .where(eq(schema.rsvps.id, id))

    // Audit log
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'rsvp.updateStatus',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'rsvp',
      entityId: id,
      oldValues: { previousStatus: r.status, previousTicketNumber: r.ticketNumberPrev },
      newValues: { status, ticketNumber },
      ipAddress: ip,
    })

    if (notify && r.email && status) {
      const subject = `RSVP Update: ${r.eventTitle}`
      const html = `<p>Hi ${escapeHtml(r.name || '')},</p><p>Your RSVP status for <b>${escapeHtml(r.eventTitle)}</b> is now <b>${escapeHtml(status.toUpperCase())}</b>.</p>`
      await sendEmail({ to: r.email, subject, html })
      await sendTelegram(`RSVP ${status}: ${r.name || r.email} -> ${r.eventTitle}`)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    logger.error('Admin RSVP update failed', {
      error: e instanceof Error ? e : String(e),
      endpoint: req.nextUrl?.pathname,
      method: 'PATCH',
    })
    return NextResponse.json({ error: 'Unable to update RSVP. Please try again.' }, { status: 500 })
  }
}
