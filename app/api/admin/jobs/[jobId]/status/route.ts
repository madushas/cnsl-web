import "server-only";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getJob } from "@/lib/jobs";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await requireAdmin();
    const { jobId } = await params;
    const job = getJob(jobId);
    if (!job) return apiError("NOT_FOUND", "Job not found", 404);
    return apiSuccess({ ok: true, job });
  } catch (e: any) {
    return handleApiError(e);
  }
}
