import 'server-only'
import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { and, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api-response'
import { deleteCheckpointScan } from '@/lib/checkpoint-helpers'
import type { CheckpointType } from '@/lib/types/checkpoint'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string; rsvpId: string; checkpointType: string }> }) {
  try {
    await requireAdmin()
    const { slug, rsvpId, checkpointType } = await params

    // Validate checkpoint type
    const types = ['entry','refreshment','swag'] as const
    if (!(types as readonly string[]).includes(checkpointType)) {
      return apiError('VALIDATION_ERROR', 'Invalid checkpoint type', 400)
    }

    // Get event and ensure RSVP belongs to it
    const [event] = await db
      .select({ id: schema.events.id })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1)

    if (!event) return apiError('NOT_FOUND', 'Event not found', 404)

    const [rsvpRow] = await db
      .select({ id: schema.rsvps.id })
      .from(schema.rsvps)
      .where(and(eq(schema.rsvps.id, rsvpId), eq(schema.rsvps.eventId, event.id)))
      .limit(1)

    if (!rsvpRow) {
      return apiError('NOT_FOUND', 'RSVP not found for this event', 404)
    }

    // Delete checkpoint scan
    const ok = await deleteCheckpointScan(rsvpId, event.id, checkpointType as CheckpointType)

    // If entry, clear legacy checkedInAt
    if (ok && checkpointType === 'entry') {
      await db.update(schema.rsvps).set({ checkedInAt: null }).where(eq(schema.rsvps.id, rsvpId))
    }

    return apiSuccess({ ok, rsvpId, checkpointType })
  } catch (e: any) {
    return apiError('INTERNAL_ERROR', e?.message || 'Internal server error', 500)
  }
}
