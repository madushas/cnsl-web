import "server-only";

const RESEND_API = process.env.RESEND_API;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendEmail(opts: {
  to?: string;
  subject: string;
  html: string;
}) {
  if (!RESEND_API) return;
  const to = opts.to || NOTIFY_EMAIL;
  if (!to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: opts.subject,
      html: opts.html,
    }),
  }).catch(() => {});
}

export async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = new URLSearchParams({ chat_id: TELEGRAM_CHAT_ID, text });
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }).catch(() => {});
}
