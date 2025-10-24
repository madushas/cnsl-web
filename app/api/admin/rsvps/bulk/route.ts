// API route for bulk RSVP operations (send invites, update statuses)
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { rsvps, events } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"
import QRCode from "qrcode"
import { logger } from "@/lib/logger"
import { nanoid } from "nanoid"
import { checkExpensiveOpLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

// Validation schemas
const bulkUpdateSchema = z.object({
  rsvpIds: z.array(z.string().uuid()),
  status: z.enum(['pending', 'approved', 'invited', 'confirmed', 'rejected']),
})

const sendInvitesSchema = z.object({
  eventId: z.string().uuid(),
  rsvpIds: z.array(z.string().uuid()),
})

// Generate QR code as data URL
async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    })
  } catch (error) {
    logger.error('QR code generation failed', { error: error instanceof Error ? error : String(error) })
    throw new Error('Failed to generate QR code')
  }
}

// Generate unique ticket number
function generateTicketNumber(eventId: string): string {
  const prefix = eventId.slice(0, 6).toUpperCase()
  const random = nanoid(8).toUpperCase()
  return `${prefix}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const body = await request.json()
    const action = body.action

    // Bulk status update
    if (action === 'bulk_update') {
      const { rsvpIds, status } = bulkUpdateSchema.parse(body)
      
      await db
        .update(rsvps)
        .set({ 
          status,
        })
        .where(inArray(rsvps.id, rsvpIds))

      return NextResponse.json({ 
        success: true, 
        message: `Updated ${rsvpIds.length} RSVPs to ${status}` 
      })
    }

    // Send invites (generate QR codes and update status)
    if (action === 'send_invites') {
      const { eventId, rsvpIds } = sendInvitesSchema.parse(body)
      
      // SEC-05 fix: Rate limit QR generation (CPU-intensive, 1 request per 30 seconds per admin)
      const rateLimitKey = `admin:${admin.id}:qr-generation`
      const rateCheck = await checkExpensiveOpLimit(rateLimitKey, 1, 30)
      if (!rateCheck.allowed) {
        logger.warn('QR generation rate limit exceeded', { 
          adminId: admin.id, 
          rsvpCount: rsvpIds.length,
          resetAt: rateCheck.resetAt.toISOString() 
        })
        // SEC-08 fix: Log failed operations
        await logAudit({
          action: 'qr_generation.rate_limited',
          userId: admin.id,
          entityType: 'rsvp',
          entityId: null,
          oldValues: { reason: 'rate_limit_exceeded', count: rsvpIds.length, resetAt: rateCheck.resetAt.toISOString() },
          newValues: null,
          ipAddress: request.headers.get('x-forwarded-for'),
        })
        return NextResponse.json({ 
          error: 'Rate limit exceeded. QR generation is resource-intensive. Please wait 30 seconds.',
          resetAt: rateCheck.resetAt.toISOString()
        }, { status: 429 })
      }

      // Fetch RSVPs and event data
      const [rsvpList, eventData] = await Promise.all([
        db.select().from(rsvps).where(inArray(rsvps.id, rsvpIds)),
        db.select().from(events).where(eq(events.id, eventId)).limit(1),
      ])

      if (!eventData[0]) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      const event = eventData[0]
      const updates: Array<{ id: string; qrCode: string; ticketNumber: string }> = []
      // Precompute QR codes outside transaction to keep locks short
      for (const rsvp of rsvpList) {
        const ticketNumber = rsvp.ticketNumber || generateTicketNumber(eventId)
        // SEC-07 fix: Remove email from QR code to prevent PII exposure
        // QR code now contains: eventId|ticketNumber|rsvpId (no email)
        const qrPayload = `${eventId}|${ticketNumber}|${rsvp.id}`
        const qrCodeDataUrl = await generateQRCode(qrPayload)
        updates.push({ id: rsvp.id, qrCode: qrCodeDataUrl, ticketNumber })
      }

      // Apply DB updates atomically
      await db.transaction(async (tx) => {
        const now = new Date()
        for (const u of updates) {
          await tx
            .update(rsvps)
            .set({
              qrCode: u.qrCode,
              ticketNumber: u.ticketNumber,
              status: 'invited',
              notifiedAt: now,
            })
            .where(eq(rsvps.id, u.id))
        }
      })

      const updatedRsvps = rsvpList.map((rsvp) => {
        const u = updates.find(x => x.id === rsvp.id)!
        return {
          ...rsvp,
          qrCode: u.qrCode,
          ticketNumber: u.ticketNumber,
          eventName: event.title,
        }
      })

      // NOTE: Email sending would be implemented here using Resend API
      // Batched to avoid rate limits (10 emails/minute on free tier)
      // Each email contains: QR code (data URL), ticket number, event details
      
      return NextResponse.json({
        success: true,
        message: `Prepared ${updatedRsvps.length} invites`,
        invites: updatedRsvps.map(r => ({
          email: r.email,
          name: r.name,
          ticketNumber: r.ticketNumber,
          qrCode: r.qrCode,
          eventName: r.eventName,
        })),
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    logger.error('Bulk RSVP operation error', {
      error: error instanceof Error ? error : String(error),
      endpoint: request.nextUrl?.pathname,
      method: request.method,
    })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
