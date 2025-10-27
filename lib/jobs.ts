import "server-only";

import { sendEmail } from "@/lib/notify";
import { logger } from "@/lib/logger";
import type { CheckpointType, ScanMethod } from "@/lib/types/checkpoint";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_REDIS = !!(REDIS_URL && REDIS_TOKEN);

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type BulkEmailTarget = {
  id: string;
  email: string;
  name?: string | null;
  eventTitle?: string | null;
  ticketNumber?: string | null;
  qrCode?: string | null;
};

export type BulkEmailPayload = {
  subject: string;
  preheader?: string;
  html: string;
  ratePerMinute: number;
  targets: BulkEmailTarget[];
};

export type Job = {
  id: string;
  type: "bulkEmail" | "bulkCheckpoint";
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  finishedAt?: number;
  progress: number;
  total: number;
  error?: string;
  cancelled?: boolean;
  meta?: Record<string, unknown>;
  failed?: string[];
  failureReasons?: Record<string, string>;
};

// In-memory store; can be swapped with Redis later
const jobs = new Map<string, Job>();

// SSE subscribers per job
const channels = new Map<string, Set<(evt: unknown) => void>>();

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return (
      "job_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export async function getJobAsync(jobId: string): Promise<Job | undefined> {
  const mem = jobs.get(jobId);
  if (mem) return mem;
  const fromRedis = await redisGetJSON<Job>(`job:${jobId}`);
  if (fromRedis) {
    jobs.set(jobId, fromRedis);
  }
  return fromRedis;
}

async function redisSetJSON(key: string, value: unknown) {
  if (!HAS_REDIS) return;
  try {
    const body = typeof value === "string" ? value : JSON.stringify(value);
    await fetch(
      `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(body)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        cache: "no-store",
      },
    );
  } catch {}
}

async function redisGetJSON<T = unknown>(key: string): Promise<T | undefined> {
  if (!HAS_REDIS) return undefined;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!data || data.result == null) return undefined;
    try {
      return JSON.parse(data.result) as T;
    } catch {
      return undefined;
    }
  } catch {
    return undefined;
  }
}

export async function putJob(job: Job) {
  jobs.set(job.id, job);
  broadcast(job.id, { type: "status", job });
  // persist best-effort in Redis
  await redisSetJSON(`job:${job.id}`, job);
}

export function createBulkEmailJob(
  payload: BulkEmailPayload,
  meta?: Record<string, unknown>,
) {
  const id = genId();
  const job: Job = {
    id,
    type: "bulkEmail",
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progress: 0,
    total: payload.targets.length,
    meta: {
      ...meta,
      subject: payload.subject,
      preheader: payload.preheader,
      html: payload.html,
      ratePerMinute: payload.ratePerMinute,
      targets: payload.targets,
    },
    failed: [],
    failureReasons: {},
  };
  jobs.set(id, job);
  // best-effort Redis persist
  void redisSetJSON(`job:${id}`, job);
  return id;
}

// Bulk checkpoint job payload
type BulkCheckpointPayload = {
  rsvpIds: string[];
  action: "mark" | "undo";
  checkpointType: CheckpointType;
  scanMethod?: ScanMethod;
};

export function createBulkCheckpointJob(
  payload: BulkCheckpointPayload,
  meta?: Record<string, unknown>,
) {
  const id = genId();
  const job: Job = {
    id,
    type: "bulkCheckpoint",
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progress: 0,
    total: payload.rsvpIds.length,
    meta: {
      ...meta,
      action: payload.action,
      checkpointType: payload.checkpointType,
      scanMethod: payload.scanMethod,
      rsvpIds: payload.rsvpIds,
    },
    failed: [],
    failureReasons: {},
  };
  jobs.set(id, job);
  // best-effort Redis persist
  void redisSetJSON(`job:${id}`, job);
  return id;
}

export function subscribe(jobId: string, cb: (evt: unknown) => void) {
  if (!channels.has(jobId)) channels.set(jobId, new Set());
  channels.get(jobId)!.add(cb);
  return () => channels.get(jobId)!.delete(cb);
}

function broadcast(jobId: string, data: unknown) {
  const subs = channels.get(jobId);
  if (!subs) return;
  for (const cb of subs) {
    try {
      cb(data);
    } catch {}
  }
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// HTML escape utility to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

function renderTemplate(
  html: string,
  preheader: string | undefined,
  t: BulkEmailTarget,
  eventTitle?: string | null,
) {
  let out = html;
  const map: Record<string, string> = {
    name: escapeHtml(t.name || ""),
    email: escapeHtml(t.email || ""),
    eventTitle: escapeHtml(eventTitle || t.eventTitle || ""),
    ticketNumber: escapeHtml(t.ticketNumber || ""),
    qrCode: escapeHtml(t.qrCode || ""),
    preheader: escapeHtml(preheader || ""),
  };
  out = out.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => map[key] ?? "");
  return out;
}

export function renderBulkEmailTemplate(
  subject: string,
  preheader: string | undefined,
  html: string,
  t: BulkEmailTarget,
  eventTitle?: string | null,
) {
  const renderedHtml = renderTemplate(html, preheader, t, eventTitle);
  const renderedSubject = renderTemplate(subject, preheader, t, eventTitle);
  return { subject: renderedSubject, html: renderedHtml };
}

export async function runBulkEmailJob(
  jobId: string,
  payload: BulkEmailPayload,
  eventTitle?: string | null,
) {
  const job = jobs.get(jobId);
  if (!job) return;
  if (job.status !== "queued") return;

  job.status = "running";
  job.startedAt = Date.now();
  job.updatedAt = Date.now();
  await putJob(job);

  const intervalMs = Math.max(
    1000,
    Math.floor(60000 / Math.max(1, payload.ratePerMinute || 2)),
  );

  try {
    const failures: Array<{ email: string; reason: string }> = [];
    for (let i = 0; i < payload.targets.length; i++) {
      if (job.cancelled) {
        job.status = "cancelled";
        job.finishedAt = Date.now();
        job.updatedAt = Date.now();
        putJob(job);
        return;
      }

      const target = payload.targets[i];
      const html = renderTemplate(
        payload.html,
        payload.preheader,
        target,
        eventTitle,
      );
      const subject = renderTemplate(
        payload.subject,
        payload.preheader,
        target,
        eventTitle,
      );

      // Fire and forget; do not throw on send failure; count as progressed
      try {
        await sendEmail({ to: target.email, subject, html });
      } catch (e: unknown) {
        const reason = e instanceof Error ? e.message : "Unknown error";
        failures.push({ email: target.email, reason });
        logger.error("bulkEmail.send.fail", { email: target.email, reason });
      }

      job.progress = i + 1;
      job.updatedAt = Date.now();
      // Update failure info continuously
      if (failures.length) {
        job.failed = failures.map((f) => f.email);
        job.failureReasons = Object.fromEntries(
          failures.map((f) => [f.email, f.reason]),
        );
      }
      await putJob(job);
      broadcast(job.id, {
        type: "progress",
        progress: job.progress,
        total: job.total,
      });

      if (i < payload.targets.length - 1) {
        await sleep(intervalMs);
      }
    }

    job.status = "completed";
    job.finishedAt = Date.now();
    job.updatedAt = Date.now();
    await putJob(job);
  } catch (e: unknown) {
    job.status = "failed";
    job.error = e instanceof Error ? e.message : "Job failed";
    job.finishedAt = Date.now();
    job.updatedAt = Date.now();
    await putJob(job);
  }
}

export async function retryFailedEmails(jobId: string): Promise<string | null> {
  const job = await getJobAsync(jobId);
  if (!job) return null;
  const failed = Array.isArray(job.failed) ? job.failed : [];
  if (!failed.length) return null;

  const meta = job.meta || {};
  const allTargets: BulkEmailTarget[] = Array.isArray(meta.targets)
    ? meta.targets
    : [];
  const targets = allTargets.filter((t) => failed.includes(t.email));
  if (!targets.length) return null;

  const payload: BulkEmailPayload = {
    subject: String(meta.subject || ""),
    preheader: meta.preheader ? String(meta.preheader) : undefined,
    html: String(meta.html || ""),
    ratePerMinute: Number(meta.ratePerMinute || 2),
    targets,
  };

  const newId = createBulkEmailJob(payload, { ...meta, retryOf: jobId });
  // Fire and forget
  void runBulkEmailJob(newId, payload);
  return newId;
}

export function cancelJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return false;
  job.cancelled = true;
  job.updatedAt = Date.now();
  void putJob(job);
  return true;
}
