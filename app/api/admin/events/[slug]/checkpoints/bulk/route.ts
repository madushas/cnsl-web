import { NextRequest } from 'next/server'
import { db, schema } from '@/db'
import { eq, and, inArray } from 'drizzle-orm'
import { requireAdmin, getSessionUser } from '@/lib/auth'
import { apiSuccess, apiError, validationError } from '@/lib/api-response'
import { createBulkCheckpointJob, getJob, putJob } from '@/lib/jobs'
import { createCheckpointScan, deleteCheckpointScan, syncEntryToLegacyCheckIn } from '@/lib/checkpoint-helpers'
import type { CheckpointType, ScanMethod } from '@/lib/types/checkpoint'
import { z } from 'zod'
import { checkpointTypeSchema, scanMethodSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Bulk checkpoint job payload
const BulkCheckpointPayload = z.object({
  rsvpIds: z.array(z.string().uuid()).min(1).max(5000),
  action: z.enum(['mark','undo']),
  checkpointType: checkpointTypeSchema,
  scanMethod: scanMethodSchema.optional().default('manual'),
})

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    // Admin authentication
    await requireAdmin()
    const admin = await getSessionUser()
    
    const { slug } = await props.params
    
    // Get event
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1)
    
    if (!event) {
      return apiError('NOT_FOUND', 'Event not found', 404)
    }
    
    // Parse and validate request body
    const body = await req.json()
    const parsed = BulkCheckpointPayload.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)
    const { rsvpIds: rsvpIdsRaw, action, checkpointType, scanMethod } = parsed.data
    // Deduplicate IDs
    const rsvpIds = Array.from(new Set(rsvpIdsRaw))
    
    // Verify all RSVPs belong to the event
    const rsvps = await db
      .select({ id: schema.rsvps.id })
      .from(schema.rsvps)
      .where(
        and(
          eq(schema.rsvps.eventId, event.id),
          inArray(schema.rsvps.id, rsvpIds)
        )
      )
    
    const validRsvpIds = rsvps.map(r => r.id)
    if (validRsvpIds.length !== rsvpIds.length) {
      return apiError('VALIDATION_ERROR', 'Some RSVPs do not belong to this event', 400)
    }
    
    // Create a job for the bulk operation
    const jobId = createBulkCheckpointJob({
      rsvpIds,
      action,
      checkpointType,
      scanMethod,
    }, {
      eventId: event.id,
      eventName: event.title,
      initiatedBy: admin?.name || admin?.email || 'Admin',
    })
    
    // Start the bulk operation in the background
    void processBulkCheckpoints(jobId, event.id, rsvpIds, action, checkpointType, scanMethod, admin?.id)
    
    // Return the job ID immediately
    return apiSuccess({
      jobId,
      message: `Bulk ${action} operation started for ${checkpointType} checkpoint`
    })
  } catch (error: any) {
    console.error('[Bulk Checkpoint API] Error:', error)
    return apiError(
      'INTERNAL_ERROR',
      error?.message || 'Internal server error',
      500
    )
  }
}

// Process bulk checkpoints in the background
async function processBulkCheckpoints(
  jobId: string,
  eventId: string,
  rsvpIds: string[],
  action: 'mark' | 'undo',
  checkpointType: CheckpointType,
  scanMethod: ScanMethod,
  scannedBy?: string
) {
  const job = getJob(jobId)
  if (!job) return
  
  try {
    // Update job status to running
    job.status = 'running'
    job.startedAt = Date.now()
    job.updatedAt = Date.now()
    job.progress = 0
    job.total = rsvpIds.length
    await putJob(job)
    
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    
    // Process each RSVP
    for (let i = 0; i < rsvpIds.length; i++) {
      const rsvpId = rsvpIds[i]
      
      // Support cancellation
      if (job.cancelled) {
        job.status = 'cancelled'
        job.finishedAt = Date.now()
        job.updatedAt = Date.now()
        job.meta = { ...job.meta, successCount, errorCount, skippedCount }
        await putJob(job)
        return
      }

      try {
        if (action === 'mark') {
          // Mark checkpoint
          const res = await createCheckpointScan({
            rsvpId,
            eventId,
            checkpointType,
            scannedBy,
            scanMethod,
          })
          if (res?.alreadyScanned) skippedCount++
          else {
            successCount++
            if (checkpointType === 'entry') {
              // keep legacy checkedInAt in sync
              await syncEntryToLegacyCheckIn(rsvpId)
            }
          }
        } else {
          // Undo checkpoint
          const ok = await deleteCheckpointScan(rsvpId, eventId, checkpointType)
          
          // For entry checkpoint, also clear legacy checked_in_at field
          if (ok && checkpointType === 'entry') {
            await db
              .update(schema.rsvps)
              .set({ checkedInAt: null })
              .where(eq(schema.rsvps.id, rsvpId))
          }
          if (ok) successCount++
          else skippedCount++
        }
      } catch (error) {
        errorCount++
        console.error(`[Bulk Checkpoint] Error processing RSVP ${rsvpId}:`, error)
      }
      
      // Update job progress
      job.progress = i + 1
      job.updatedAt = Date.now()
      job.meta = {
        ...job.meta,
        successCount,
        errorCount,
        skippedCount,
      }
      await putJob(job)
    }
    
    // Update job status to completed
    job.status = 'completed'
    job.finishedAt = Date.now()
    job.updatedAt = Date.now()
    await putJob(job)
    
  } catch (error) {
    // Update job status to failed
    job.status = 'failed'
    job.finishedAt = Date.now()
    job.updatedAt = Date.now()
    job.error = error instanceof Error ? error.message : 'Bulk operation failed'
    await putJob(job)
    
    console.error('[Bulk Checkpoint] Error:', error)
  }
}
