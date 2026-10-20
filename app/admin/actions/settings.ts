"use server";

import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { defaultSettings, type SiteSettings } from "@/lib/server/content";
import { q } from "@/lib/server/db";
import { pairFrom } from "@/lib/server/forms";
import { escapeHtml, mailConfigured, sendMail } from "@/lib/server/mail";
import { refreshPublic } from "@/lib/server/revalidate";
import { email, fail, num, str, ValidationError, type ActionResult } from "@/lib/server/validate";

function httpsOrEmpty(v: string, label: string) {
  if (!v) return "";
  if (!/^https:\/\/[^\s]+$/i.test(v)) throw new ValidationError(`${label} must be a full link starting with https://`);
  return v;
}

function positive(fd: FormData, name: string, label: string, fallback: number) {
  const n = num(fd, name, NaN);
  if (!Number.isFinite(n)) return fallback;
  if (n <= 0) throw new ValidationError(`${label} must be more than zero.`);
  return n;
}

export async function saveSettings(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("settings.edit", fd.get("csrf"));
    const d = defaultSettings();

    const phone = str(fd, "phone", { max: 40, label: "Phone" });
    if (phone && !/^\+?[\d\s()-]{7,}$/.test(phone)) throw new ValidationError("Phone may contain only digits, spaces, brackets and a leading +.");
    const whatsapp = str(fd, "whatsapp", { max: 20, label: "WhatsApp" }).replace(/\D/g, "");
    if (whatsapp && (whatsapp.length < 10 || whatsapp.startsWith("0"))) throw new ValidationError("WhatsApp number must include the country code, for example 923335542606.");

    const notify = str(fd, "notifyEmails", { max: 500 })
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    notify.forEach((e) => email(e, `“${e}”`));

    const gaId = str(fd, "gaId", { max: 30 }).toUpperCase();
    if (gaId && !/^G-[A-Z0-9]+$/.test(gaId)) throw new ValidationError("Google Analytics ID looks like G-XXXXXXXXXX.");
    const gtmId = str(fd, "gtmId", { max: 30 }).toUpperCase();
    if (gtmId && !/^GTM-[A-Z0-9]+$/.test(gtmId)) throw new ValidationError("Tag Manager ID looks like GTM-XXXXXXX.");

    const z = d.zakat;
    const settings: SiteSettings = {
      email: email(str(fd, "email", { required: true, max: 120, label: "Public email" }), "Public email"),
      phone: phone || d.phone,
      whatsapp: whatsapp || d.whatsapp,
      city: pairFrom(fd, "city", { max: 120, label: "Location", requiredEn: true }),
      hours: pairFrom(fd, "hours", { max: 120, label: "Office hours" }),
      social: {
        linkedin: httpsOrEmpty(str(fd, "social.linkedin", { max: 300 }), "LinkedIn"),
        facebook: httpsOrEmpty(str(fd, "social.facebook", { max: 300 }), "Facebook"),
        instagram: httpsOrEmpty(str(fd, "social.instagram", { max: 300 }), "Instagram"),
        youtube: httpsOrEmpty(str(fd, "social.youtube", { max: 300 }), "YouTube"),
        x: httpsOrEmpty(str(fd, "social.x", { max: 300 }), "X"),
      },
      gaId,
      gtmId,
      notifyEmails: notify.join(", "),
      zakat: {
        ...z,
        silverPerTola: positive(fd, "zakat.silverPerTola", "Silver price", z.silverPerTola),
        goldPerTola: positive(fd, "zakat.goldPerTola", "Gold price", z.goldPerTola),
        pricesAsOf: pairFrom(fd, "zakat.pricesAsOf", { max: 60, label: "Prices date", requiredEn: true }),
        priceSource: str(fd, "zakat.priceSource", { max: 160, label: "Price source" }) || z.priceSource,
        officialNisab: positive(fd, "zakat.officialNisab", "Government Nisab", z.officialNisab),
        officialNisabYear: pairFrom(fd, "zakat.officialNisabYear", { max: 60, label: "Nisab year", requiredEn: true }),
      },
    };

    await q(
      `INSERT INTO settings (key, value, updated_by, updated_at) VALUES ('site', $1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [JSON.stringify(settings), user.id],
    );
    // Contact details appear in the header, footer and several pages, so refresh the whole public site.
    refreshPublic(["*"]);
    await audit(user.id, "update", "settings", "site", "updated site settings");
    revalidatePath("/admin/settings");
    return { ok: true, message: "Settings saved. The website is updated." };
  } catch (err) {
    return fail(err);
  }
}

export async function sendTestEmail(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("settings.edit", fd.get("csrf"));
    if (!mailConfigured()) throw new ValidationError("Email sending is not set up on the server yet.");
    const to = email(str(fd, "to", { required: true, max: 120, label: "Address" }), "Address");
    const r = await sendMail({
      to,
      subject: "Al-Ihkam admin: test email",
      html: `<p>This is a test from the Al-Ihkam admin, sent by ${escapeHtml(user.name)}.</p><p>If you can read this, consultation requests will reach you by email.</p>`,
    });
    if (!r.sent) throw new ValidationError("The mail server refused the message. Check the SMTP settings on the server.");
    await audit(user.id, "test", "settings", "email", `sent a test email to ${to}`);
    return { ok: true, message: `Test email sent to ${to}.` };
  } catch (err) {
    return fail(err);
  }
}
