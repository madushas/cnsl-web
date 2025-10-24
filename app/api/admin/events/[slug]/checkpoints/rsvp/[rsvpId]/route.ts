/**
 * RSVP Checkpoint Status API Endpoint
 * GET /api/admin/events/[slug]/checkpoints/rsvp/[rsvpId]
 * 
 * Returns checkpoint status for a specific RSVP
 * Shows which checkpoints have been scanned and when
 */

import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { eq, and } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api-response'
import { getCheckpointStatus } from '@/lib/checkpoint-helpers'
import { CheckpointLabels, CheckpointIcons } from '@/lib/types/checkpoint'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string; rsvpId: string }> }
) {
  try {
    // Admin authentication
    await requireAdmin()
    
    const { slug, rsvpId } = await props.params
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(rsvpId)) {
      return apiError('VALIDATION_ERROR', 'Invalid RSVP ID format', 400)
    }
    
    // Get event
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1)
    
    if (!event) {
      return apiError('NOT_FOUND', 'Event not found', 404)
    }
    
    // Get RSVP info
    const [rsvp] = await db
      .select({
        id: schema.rsvps.id,
        name: schema.rsvps.name,
        email: schema.rsvps.email,
        status: schema.rsvps.status,
        ticketNumber: schema.rsvps.ticketNumber,
      })
      .from(schema.rsvps)
      .where(
        and(
          eq(schema.rsvps.id, rsvpId),
          eq(schema.rsvps.eventId, event.id)
        )
      )
      .limit(1)
    
    if (!rsvp) {
      return apiError('NOT_FOUND', 'RSVP not found for this event', 404)
    }
    
    // Get checkpoint status
    const checkpointStatus = await getCheckpointStatus(rsvpId, event.id)
    
    // Format response with user-friendly data
    return apiSuccess({
      eventId: event.id,
      eventTitle: event.title,
      attendee: {
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email,
        status: rsvp.status,
        ticketNumber: rsvp.ticketNumber,
      },
      checkpoints: {
        entry: {
          scanned: checkpointStatus.hasEntry,
          scannedAt: checkpointStatus.entryScannedAt,
          scannedBy: checkpointStatus.entryScannedBy,
          label: CheckpointLabels.entry,
          icon: CheckpointIcons.entry,
        },
        refreshment: {
          scanned: checkpointStatus.hasRefreshment,
          scannedAt: checkpointStatus.refreshmentScannedAt,
          scannedBy: checkpointStatus.refreshmentScannedBy,
          label: CheckpointLabels.refreshment,
          icon: CheckpointIcons.refreshment,
        },
        swag: {
          scanned: checkpointStatus.hasSwag,
          scannedAt: checkpointStatus.swagScannedAt,
          scannedBy: checkpointStatus.swagScannedBy,
          label: CheckpointLabels.swag,
          icon: CheckpointIcons.swag,
        },
      },
      summary: {
        totalCheckpoints: 3,
        completedCheckpoints: 
          (checkpointStatus.hasEntry ? 1 : 0) +
          (checkpointStatus.hasRefreshment ? 1 : 0) +
          (checkpointStatus.hasSwag ? 1 : 0),
      },
    })
    
  } catch (error: any) {
    console.error('[RSVP Checkpoint Status API] Error:', error)
    return apiError(
      'INTERNAL_ERROR',
      error?.message || 'Internal server error',
      500
    )
  }
}
