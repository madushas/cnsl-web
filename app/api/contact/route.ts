import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { escapeHtml } from "@/lib/utils";
import { handleApiError } from "@/lib/errors";

// Helper to detect and reject HTML/script content
const noHtmlRegex = /<[^>]*>/;
const rejectHtml = (val: string, ctx: z.RefinementCtx, field: string) => {
  if (noHtmlRegex.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${field} cannot contain HTML tags`,
    });
  }
};

// Contact form validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .refine((val) => !noHtmlRegex.test(val), {
      message: "Name cannot contain HTML tags",
    }),
  email: z.email("Invalid email address"),
  affiliation: z
    .string()
    .max(200)
    .optional()
    .refine((val) => !val || !noHtmlRegex.test(val), {
      message: "Affiliation cannot contain HTML tags",
    }),
  topic: z
    .string()
    .max(200)
    .optional()
    .refine((val) => !val || !noHtmlRegex.test(val), {
      message: "Topic cannot contain HTML tags",
    }),
  message: z
    .string()
    .min(10, "Message too short")
    .max(5000, "Message too long")
    .refine((val) => !noHtmlRegex.test(val), {
      message: "Message cannot contain HTML tags",
    }),
  method: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  referrer: z.string().max(500).optional(),
  talk: z
    .object({
      title: z
        .string()
        .max(200)
        .optional()
        .refine((val) => !val || !noHtmlRegex.test(val), {
          message: "Talk title cannot contain HTML tags",
        }),
      link: z.string().max(500).optional(),
      abstract: z
        .string()
        .max(10000)
        .optional()
        .refine((val) => !val || !noHtmlRegex.test(val), {
          message: "Talk abstract cannot contain HTML tags",
        }),
    })
    .optional(),
  source: z.string().max(200).optional(),
  hp: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (error) {
      logger.warn("Invalid JSON in contact form request", {
        error: error instanceof Error ? error.message : String(error),
        ip:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
      });
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // Honeypot check first (before validation to save resources)
    if (typeof body.hp === "string" && body.hp.trim() !== "") {
      logger.warn("Honeypot triggered", {
        ip:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent")?.substring(0, 100),
      });
      // Honeypot filled -> treat as success silently
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Validate input
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      logger.warn("Contact form validation failed", {
        errors: validation.error.issues.length,
        fields: validation.error.issues.map((e) => e.path.join(".")),
      });
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      affiliation,
      topic,
      message,
      method,
      phone,
      referrer,
      talk,
      source,
    } = validation.data;

    const RESEND_API = process.env.RESEND_API; // provided as RESEND_API
    const FROM_EMAIL = process.env.FROM_EMAIL;
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const ua = req.headers.get("user-agent") || "";
    const subject = `[CNSL Website] ${escapeHtml(topic || "General")} — ${escapeHtml(name)}`;
    // SEC-03 fix: Escape all user input in email template to prevent XSS
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue','Noto Sans',sans-serif;">
        <h2 style="margin:0 0 8px 0;">New website message</h2>
        <p style="margin:0 0 12px 0;color:#6b7280;">Topic: <strong>${escapeHtml((topic || "General").toString())}</strong></p>
        <p style="white-space:pre-wrap;margin:0 0 12px 0;">${escapeHtml((message || "").toString())}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <p style="margin:0;color:#6b7280;">From: ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        ${affiliation ? `<p style="margin:0;color:#6b7280;">Affiliation: ${escapeHtml(String(affiliation))}</p>` : ""}
        ${method ? `<p style="margin:0;color:#6b7280;">Preferred: ${escapeHtml(String(method))}</p>` : ""}
        ${phone ? `<p style="margin:0;color:#6b7280;">Phone: ${escapeHtml(String(phone))}</p>` : ""}
        ${referrer ? `<p style="margin:0;color:#6b7280;">Referrer: ${escapeHtml(String(referrer))}</p>` : ""}
        ${talk && talk.title ? `<p style="margin:12px 0 4px 0;"><strong>Talk Proposal</strong></p>` : ""}
        ${talk && talk.title ? `<p style="margin:0;color:#6b7280;">Title: ${escapeHtml(String(talk.title))}</p>` : ""}
        ${talk && talk.link ? `<p style="margin:0;color:#6b7280;">Link: ${escapeHtml(String(talk.link))}</p>` : ""}
        ${talk && talk.abstract ? `<p style="white-space:pre-wrap;margin:8px 0;color:#6b7280;">${escapeHtml(String(talk.abstract))}</p>` : ""}
        ${source ? `<p style="margin:8px 0 0 0;color:#9ca3af;">Source: ${escapeHtml(String(source))}</p>` : ""}
        ${ua ? `<p style="margin:0;color:#9ca3af;">UA: ${escapeHtml(String(ua).slice(0, 300))}</p>` : ""}
      </div>
    `;

    // Fire-and-forget notifications
    const tasks: Promise<any>[] = [];

    // Email via Resend (direct HTTP)
    if (RESEND_API && FROM_EMAIL && NOTIFY_EMAIL) {
      tasks.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [NOTIFY_EMAIL],
            subject,
            html,
          }),
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(`Resend error ${r.status}: ${t}`);
          }
        }),
      );
    }

    // Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tgParts: string[] = [];
      tgParts.push(`New website message`);
      tgParts.push(`Topic: ${(topic || "General").toString().slice(0, 100)}`);
      tgParts.push(`From: ${name} <${email}>`);
      if (affiliation)
        tgParts.push(`Affiliation: ${String(affiliation).slice(0, 160)}`);
      if (method) tgParts.push(`Preferred: ${String(method)}`);
      if (phone) tgParts.push(`Phone: ${String(phone).slice(0, 48)}`);
      if (referrer) tgParts.push(`Referrer: ${String(referrer)}`);
      tgParts.push("");
      tgParts.push((message || "").toString().slice(0, 2500));
      if (talk && talk.title) {
        tgParts.push("");
        tgParts.push(`Talk: ${String(talk.title).slice(0, 160)}`);
        if (talk.link) tgParts.push(`Link: ${String(talk.link).slice(0, 300)}`);
        if (talk.abstract) tgParts.push(String(talk.abstract).slice(0, 1200));
      }
      if (source) tgParts.push(`\nSource: ${String(source)}`);
      const tgText = tgParts.join("\n");

      tasks.push(
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: tgText }),
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(`Telegram error ${r.status}: ${t}`);
          }
        }),
      );
    }

    // Run in parallel; don't fail whole request if one fails
    const results = await Promise.allSettled(tasks);
    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      logger.error("Contact notification partially failed", {
        totalTasks: tasks.length,
        failedCount: failed.length,
        failures: failed.map((r) =>
          r.status === "rejected" ? r.reason?.message : "unknown",
        ),
      });
    }

    const allFailed =
      results.length > 0 && results.every((r) => r.status === "rejected");
    if (allFailed) {
      logger.error("All contact notifications failed", {
        topic: topic || "General",
        email: email,
      });
      return NextResponse.json(
        { error: "Notification failed" },
        { status: 500 },
      );
    }

    logger.info("Contact form submitted", {
      topic: topic || "General",
      hasTalkProposal: Boolean(talk?.title),
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // API-01 fix: Use standardized error handler
    return handleApiError(err);
  }
}
