import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { retryFailedEmails, getJob } from "@/lib/jobs";
import { handleApiError } from "@/lib/errors";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await requireAdmin();
    const { jobId } = await params;

    const job = getJob(jobId);
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const newJobId = await retryFailedEmails(jobId);
    if (!newJobId) {
      return NextResponse.json(
        { error: "No failed emails to retry" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, jobId: newJobId });
  } catch (e: any) {
    return handleApiError(e);
  }
}
