import 'server-only'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { cancelJob, getJob } from '@/lib/jobs'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    await requireAdmin()
    const { jobId } = await params
    const job = getJob(jobId)
    if (!job) return apiError('NOT_FOUND', 'Job not found', 404)
    const ok = cancelJob(jobId)
    if (!ok) return apiError('BAD_REQUEST', 'Unable to cancel', 400)
    return apiSuccess({ ok: true })
  } catch (e: any) {
    return handleApiError(e)
  }
}
