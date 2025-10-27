import "server-only";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getJob, getJobAsync, subscribe } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  await requireAdmin();
  const { jobId } = await params;
  let job = getJob(jobId);
  if (!job) job = await getJobAsync(jobId);
  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(new TextEncoder().encode(`event: ${event}\n`));
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`),
        );
      };
      // send initial state
      send("status", { job });

      const unsub = subscribe(jobId, (evt) => {
        const e = evt as { type?: string };
        if (e?.type === "status") send("status", e);
        else send("message", e);
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
      }, 15000);

      const close = () => {
        clearInterval(heartbeat);
        unsub();
        controller.close();
      };

      // Abort on client disconnect
      const signal = req.signal as AbortSignal;
      signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
