import { NextResponse } from "next/server";
import { dbConfigured, one, q } from "@/lib/server/db";
import { getSettings } from "@/lib/server/content";
import { adminUrl, escapeHtml, mailConfigured, sendMail } from "@/lib/server/mail";

// Saves every consultation request to the database (Admin › Enquiries) and emails the
// notification addresses from Admin › Settings when SMTP is configured.
// If neither is possible the route answers 503 and the form offers WhatsApp or email instead.

const MAX = 4000;

function clean(v: unknown, max = 300) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function cleanUtm(v: unknown) {
  const out: Record<string, string> = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (/^(utm_[a-z]+|gclid|fbclid)$/.test(k) && typeof val === "string") out[k] = val.slice(0, 200);
    }
  }
  return out;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.company_website)) return NextResponse.json({ ok: true });

  const source = (body.source && typeof body.source === "object" ? body.source : {}) as Record<string, unknown>;
  const data = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone, 60),
    organisation: clean(body.org),
    interest: clean(body.interest),
    programme: clean(body.programme),
    message: clean(body.message, MAX),
    locale: clean(body.locale, 5),
    sourcePage: clean(source.page, 300),
    landing: clean(source.landing, 500),
    referrer: clean(source.referrer, 500),
    utm: cleanUtm(source.utm),
  };

  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });
  }

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || "").trim() || null;
  let saved: { id: string } | null = null;

  if (dbConfigured()) {
    try {
      // Basic flood protection: at most 5 requests per IP in 10 minutes.
      if (ip) {
        const [{ n }] = await q<{ n: string }>(`SELECT count(*) AS n FROM enquiries WHERE ip = $1 AND created_at > now() - interval '10 minutes'`, [ip]);
        if (Number(n) >= 5) return NextResponse.json({ ok: false, error: "too_many" }, { status: 429 });
      }
      saved = await one<{ id: string }>(
        `INSERT INTO enquiries (form, name, email, phone, organisation, interest, programme, message, locale, source_page, landing_page, referrer, utm, ip)
         VALUES ('consultation', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [data.name, data.email, data.phone || null, data.organisation || null, data.interest || null, data.programme || null, data.message || null, data.locale || null, data.sourcePage || null, data.landing || null, data.referrer || null, JSON.stringify(data.utm), ip],
      );
    } catch (err) {
      console.error("[contact] could not save enquiry:", (err as Error).message);
    }
  }

  let mailed = false;
  if (mailConfigured()) {
    const settings = await getSettings();
    const rows = [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Organisation", data.organisation],
      ["Needs help with", data.interest],
      ["Programme", data.programme],
      ["Message", data.message],
      ["Page", data.sourcePage],
      ["Referrer", data.referrer],
      ["Campaign", Object.entries(data.utm).map(([k, v]) => `${k}=${v}`).join(", ")],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#55645d;vertical-align:top">${k}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("");
    const link = saved ? `<p><a href="${adminUrl(`/admin/enquiries/${saved.id}`)}">Open in the admin</a></p>` : "";
    const res = await sendMail({
      to: settings.notifyEmails,
      replyTo: data.email,
      subject: `New consultation request: ${data.interest || "General"} (${data.name})`,
      html: `<h2 style="font-family:Georgia,serif">New request from the Al-Ihkam website</h2><table>${rows}</table>${link}`,
    });
    mailed = res.sent;
  }

  if (!saved && !mailed) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
