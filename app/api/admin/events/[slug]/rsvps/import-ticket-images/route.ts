import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'
import { nanoid } from 'nanoid'

// Generate unique ticket number
function generateTicketNumber(eventId: string): string {
  const prefix = eventId.slice(0, 6).toUpperCase()
  const random = nanoid(8).toUpperCase()
  return `${prefix}-${random}`
}

function parseCSV(input: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []
  const headers: string[] = []
  let i = 0, field = '', row: string[] = [], inQuotes = false
  const pushField = () => { row.push(field); field = '' }
  const pushRow = () => { if (row.length) rows.push(row); row = [] }
  while (i < input.length) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') { field += '"'; i += 2; continue } // escaped quote
        inQuotes = false; i++; continue
      } else { field += ch; i++; continue }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue }
      if (ch === ',') { pushField(); i++; continue }
      if (ch === '\n') { pushField(); pushRow(); i++; continue }
      if (ch === '\r') { i++; continue }
      field += ch; i++
    }
  }
  // last field/row
  if (field.length || row.length) { pushField(); pushRow() }
  if (!rows.length) return { headers: [], rows: [] }
  const hdr = rows.shift()!
  hdr.forEach(h => headers.push(h.trim()))
  return { headers, rows }
}

function norm(s: any) { return typeof s === 'string' ? s.trim() : '' }

function normalizeHeaderKey(raw: string | null | undefined): string {
  if (!raw) return ''
  const noBom = raw.replace(/^\ufeff/, '')
  const trimmed = noBom.trim()
  if (!trimmed) return ''
  // Convert camelCase to snake_case before lowercasing
  const withSeparators = trimmed.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  return withSeparators
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function sanitizeTicketNumber(val: any): string | undefined {
  const raw = norm(val)
  if (!raw) return undefined
  return raw.toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 64)
}

function sanitizeQr(val: any): string | undefined {
  const raw = norm(val)
  if (!raw) return undefined
  return raw.slice(0, 2000)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const t0 = Date.now()
  const endpoint = (() => { try { return new URL(req.url).pathname } catch { return '/api/admin/events/[slug]/rsvps/import-ticket-images' } })()
  let slugForLog: string | undefined
  try {
    const admin = await requireAdmin()
    const { slug } = await params
    slugForLog = slug
    const ct = req.headers.get('content-type') || ''

    const [event] = await db.select({ id: schema.events.id, title: schema.events.title }).from(schema.events).where(eq(schema.events.slug, slug)).limit(1)
    if (!event) return apiError('NOT_FOUND', 'Event not found', 404)

    let records: Array<Record<string, any>> = []
    if (ct.includes('text/csv')) {
      const text = await req.text()
      const { headers, rows } = parseCSV(text)
      if (!headers.length) return apiError('BAD_REQUEST', 'CSV has no header', 400)
      const normalized = headers.map((h, idx) => {
        const key = normalizeHeaderKey(h)
        return key || `col_${idx}`
      })
      records = rows.map(r => Object.fromEntries(r.map((v, idx) => [normalized[idx] || `col_${idx}`, v])))
    } else {
      const body = await req.json().catch(() => null)
      if (!Array.isArray(body)) return apiError('BAD_REQUEST', 'Expected CSV or JSON array of mappings', 400)
      records = body
    }

    logger.info('admin.rsvps.importTickets.start', { slug, endpoint, totalRows: records.length, contentType: ct })

    // Limit
    if (records.length > 1000) return apiError('BAD_REQUEST', 'Too many rows (max 1000)', 413)

    const results: Array<{ key: string; updated: boolean; reason?: string }> = []
    let updated = 0

    for (const rec of records) {
      const id = norm(rec.id)
      const email = norm(rec.email)
      const ticketIn = sanitizeTicketNumber(rec.ticketnumber ?? rec.ticket_number ?? rec.ticket)
      const qrIn = sanitizeQr(rec.qrcode ?? rec.qr ?? rec.qr_code)

      // Locate RSVP within event and get current values
      let match: { id: string; ticketNumber: string | null; qrCode: string | null } | null = null
      if (id) {
        const row = await db.select({ 
          id: schema.rsvps.id, 
          ticketNumber: schema.rsvps.ticketNumber, 
          qrCode: schema.rsvps.qrCode 
        }).from(schema.rsvps).where(and(eq(schema.rsvps.id, id), eq(schema.rsvps.eventId, event.id))).limit(1)
        match = row[0] || null
      } else if (ticketIn) {
        const row = await db.select({ 
          id: schema.rsvps.id, 
          ticketNumber: schema.rsvps.ticketNumber, 
          qrCode: schema.rsvps.qrCode 
        }).from(schema.rsvps).where(and(eq(schema.rsvps.eventId, event.id), eq(schema.rsvps.ticketNumber, ticketIn))).limit(1)
        match = row[0] || null
      } else if (email) {
        const row = await db.select({ 
          id: schema.rsvps.id, 
          ticketNumber: schema.rsvps.ticketNumber, 
          qrCode: schema.rsvps.qrCode 
        }).from(schema.rsvps).where(and(eq(schema.rsvps.eventId, event.id), eq(schema.rsvps.email, email))).limit(1)
        match = row[0] || null
      }

      const key = id || ticketIn || email || 'unknown'
      if (!match) { results.push({ key, updated: false, reason: 'not_found' }); continue }

      // Generate ticket and QR if missing
      const finalTicket = ticketIn || match.ticketNumber || generateTicketNumber(event.id)
      const finalQr = qrIn || match.qrCode || `${event.id}|${finalTicket}|${match.id}`

      // Only update if something changed
      const set: any = {}
      if (finalTicket !== match.ticketNumber) set.ticketNumber = finalTicket
      if (finalQr !== match.qrCode) set.qrCode = finalQr
      if (!Object.keys(set).length) { results.push({ key, updated: false, reason: 'nothing_to_update' }); continue }

      try {
        await db.update(schema.rsvps).set(set).where(eq(schema.rsvps.id, match.id))
        updated++
        results.push({ key, updated: true })
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase()
        const reason = msg.includes('unique') && msg.includes('ticket') ? 'ticket_conflict' : 'db_error'
        results.push({ key, updated: false, reason })
      }
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'admin.rsvps.importTickets',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'event',
      entityId: event.id as any,
      oldValues: {},
      newValues: { rows: records.length, updated },
      ipAddress: ip,
    })

    const duration = Date.now() - t0
    logger.info('admin.rsvps.importTickets.ok', { slug, updated, total: records.length, duration })
    logger.api('POST', endpoint, 200, duration, { slug, updated, total: records.length })
    return apiSuccess({ ok: true, updated, total: records.length, results })
  } catch (e: any) {
    const duration = Date.now() - t0
    logger.error('admin.rsvps.importTickets.error', { endpoint, slug: slugForLog, error: e?.message })
    logger.api('POST', endpoint, 400, duration, { slug: slugForLog, error: e?.message })
    return handleApiError(e)
  }
}
