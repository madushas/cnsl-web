"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { withCSRF } from "@/lib/csrf";
import type { BulkEmailTarget } from "@/lib/jobs";

type Props = {
  slug: string;
  eventTitle: string;
};

export default function EventEmailClient({ slug, eventTitle }: Props) {
  const { toast } = useToast();

  const [subject, setSubject] = useState<string>(
    `You're invited: {{eventTitle}}`,
  );
  const [preheader, setPreheader] = useState<string>(
    "We are excited to see you at {{eventTitle}}",
  );
  const [html, setHtml] = useState<string>(
    () => `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>{{eventTitle}}</title>
    <style>
      body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }
      .btn { background:#2563eb; color:#fff; padding:10px 16px; display:inline-block; border-radius:6px; text-decoration:none; }
      .muted { color:#6b7280; font-size:12px; }
    </style>
  </head>
  <body>
    <p>Hi {{name}},</p>
    <p>You are invited to <strong>{{eventTitle}}</strong>.</p>
    <p>Ticket: <strong>{{ticketNumber}}</strong></p>
    <p><a href="{{qrCode}}" class="btn">View Ticket QR</a></p>
    <p class="muted">If you have questions, reply to this email.</p>
  </body>
</html>`,
  );

  const [q, setQ] = useState<string>("");
  const [status, setStatus] = useState<string>("approved");
  const [rate, setRate] = useState<number>(2);

  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [previewTarget, setPreviewTarget] = useState<BulkEmailTarget | null>(
    null,
  );

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobTotal, setJobTotal] = useState<number>(0);
  const esRef = useRef<EventSource | null>(null);

  async function doPreview() {
    try {
      const statusParam = status === "all" ? "" : status;
      const res = await fetch(`/api/admin/events/${slug}/preview-email`, {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          subject,
          preheader,
          html,
          q,
          status: statusParam,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Preview failed");
      setPreviewCount(Number(data.total || 0));
      setPreviewSubject(String(data.subject || subject));
      setPreviewHtml(String(data.html || html));
      setPreviewTarget((data.sampleTarget as BulkEmailTarget) ?? null);
      toast({
        title: "Preview ready",
        description: `Sample of ${data.total} potential recipients`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to preview";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  async function startNotify() {
    try {
      const statusParam = status === "all" ? "" : status;
      const res = await fetch(`/api/admin/events/${slug}/notify`, {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          subject,
          preheader,
          html,
          q,
          status: statusParam,
          ratePerMinute: rate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to start job");
      setJobId(data.jobId);
      setJobProgress(0);
      setJobTotal(Number(data.total || 0));
      setJobStatus("running");
      toast({
        title: "Job started",
        description: `Sending to ${data.total} recipients at ${rate}/min`,
      });
      openStream(data.jobId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start job";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  function openStream(id: string) {
    closeStream();
    const es = new EventSource(`/api/admin/jobs/${id}/stream`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.job) {
          setJobStatus(msg.job.status);
          setJobProgress(Number(msg.job.progress || 0));
          setJobTotal(Number(msg.job.total || 0));
        }
        if (typeof msg?.progress === "number") {
          setJobProgress(msg.progress);
        }
      } catch {}
    };
    es.addEventListener("status", (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.job) {
          setJobStatus(msg.job.status);
          setJobProgress(Number(msg.job.progress || 0));
          setJobTotal(Number(msg.job.total || 0));
        }
      } catch {}
    });
    es.onerror = () => {
      es.close();
    };
    esRef.current = es;
  }

  function closeStream() {
    try {
      esRef.current?.close();
    } catch {}
    esRef.current = null;
  }

  async function cancelJob() {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/cancel`, {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel");
      toast({ title: "Cancelled", description: "Job cancellation requested" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to cancel job";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  useEffect(() => {
    return () => closeStream();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2">Email Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compose, preview, and send bulk emails for {eventTitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compose</CardTitle>
            <CardDescription>
              Use placeholders:
              <span className="ml-1 space-x-1">
                <code>{"{{name}}"}</code>
                <code>{"{{email}}"}</code>
                <code>{"{{eventTitle}}"}</code>
                <code>{"{{ticketNumber}}"}</code>
                <code>{"{{qrCode}}"}</code>
                <code>{"{{preheader}}"}</code>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs block mb-1">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Preheader</label>
              <Input
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">HTML</label>
              <Textarea
                className="min-h-[280px] font-mono text-sm"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs block mb-1">Filter: Search</label>
                <Input
                  placeholder="Search (name/email/affiliation)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Filter: Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={doPreview} variant="outline">
                Preview
              </Button>
              <div className="text-sm text-muted-foreground">
                {previewCount ? `${previewCount} potential recipients` : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Rendered sample with placeholders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="text-sm font-medium">
                {previewSubject || subject}
              </div>
            </div>
            <div
              className="border rounded p-3 bg-background"
              dangerouslySetInnerHTML={{ __html: previewHtml || html }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send</CardTitle>
          <CardDescription>
            Start a background job and monitor live progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs block mb-1">Rate (emails/min)</label>
              <Input
                type="number"
                min={1}
                max={60}
                value={rate}
                onChange={(e) =>
                  setRate(
                    Math.max(1, Math.min(60, Number(e.target.value || "2"))),
                  )
                }
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Button onClick={startNotify}>Start Send</Button>
              <Button
                variant="outline"
                onClick={cancelJob}
                disabled={!jobId || jobStatus !== "running"}
              >
                Cancel Job
              </Button>
            </div>
          </div>
          {jobId && (
            <div className="text-sm">
              <div>
                Job: <span className="font-mono">{jobId}</span> · Status:{" "}
                <span className="font-medium">{jobStatus}</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden mt-2">
                <div
                  className="bg-blue-600 h-full"
                  style={{
                    width: `${jobTotal ? Math.round((100 * jobProgress) / jobTotal) : 0}%`,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {jobProgress} / {jobTotal}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
