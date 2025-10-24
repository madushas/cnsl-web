/**
 * Checkpoint History API Endpoint
 * GET /api/admin/events/[slug]/checkpoints/history
 * 
 * Returns paginated checkpoint scan history for audit trail
 * Supports filtering by checkpoint type
 */

import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { eq, and, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiError, paginationMeta } from '@/lib/api-response'
import { checkpointHistoryQuerySchema } from '@/lib/validation'
import { getCheckpointHistory } from '@/lib/checkpoint-helpers'
import type { CheckpointType } from '@/lib/types/checkpoint'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    // Admin authentication
    await requireAdmin()
    
    const { slug } = await props.params
    const { searchParams } = new URL(req.url)
    
    // Get event
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1)
    
    if (!event) {
      return apiError('NOT_FOUND', 'Event not found', 404)
    }
    
    // Parse and validate query parameters
    const validation = checkpointHistoryQuerySchema.safeParse({
      eventId: event.id,
      checkpointType: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || 50,
      offset: searchParams.get('offset') || 0,
    })
    
    if (!validation.success) {
      return apiError(
        'VALIDATION_ERROR',
        validation.error.issues[0]?.message || 'Invalid query parameters',
        400
      )
    }
    
    const { checkpointType, limit, offset } = validation.data
    
    // Get checkpoint history page
    const history = await getCheckpointHistory(event.id, {
      checkpointType: checkpointType as CheckpointType | undefined,
      limit,
      offset,
    })
    
    // Accurate total count for pagination
    const conditions = [eq(schema.checkpointScans.eventId, event.id)]
    if (checkpointType) {
      conditions.push(eq(schema.checkpointScans.checkpointType, checkpointType as any))
    }
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.checkpointScans)
      .where(and(...conditions))
    const total = Number(countRow?.count || 0)
    
    return apiSuccess(
      {
        eventId: event.id,
        eventTitle: event.title,
        filter: checkpointType || 'all',
        history,
      },
      200,
      {
        pagination: {
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    )
    
  } catch (error: any) {
    console.error('[Checkpoint History API] Error:', error)
    return apiError(
      'INTERNAL_ERROR',
      error?.message || 'Internal server error',
      500
    )
  }
}
