import "server-only";
import nodemailer from "nodemailer";

// SMTP settings come only from environment variables (.env.local), never from code or the database:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE ("true" for port 465).

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transport;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Sends an email if SMTP is configured. Never throws: a mail failure must not lose an enquiry. */
export async function sendMail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  if (!mailConfigured()) return { sent: false, reason: "smtp_not_configured" as const };
  const to = (Array.isArray(opts.to) ? opts.to : opts.to.split(",")).map((s) => s.trim()).filter(Boolean);
  if (!to.length) return { sent: false, reason: "no_recipients" as const };
  try {
    await getTransport().sendMail({ from: process.env.SMTP_FROM, to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
    return { sent: true as const };
  } catch (err) {
    console.error("[mail] send failed:", (err as Error).message);
    return { sent: false, reason: "send_failed" as const };
  }
}

export function adminUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
}
