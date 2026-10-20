import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import PageHead from "@/components/PageHead";
import { isLocale } from "@/lib/i18n";
import { getContent, getProgrammes, getSettings, phoneHref, waLink } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("contact", locale, { title: d.contact.title, description: d.contact.lede, path: "/contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = await getContent(locale);
  const s = await getSettings();
  const c = d.contact;
  const programmes = Object.fromEntries((await getProgrammes()).map((p) => [p.slug, p.title[locale]]));
  const waDigits = s.whatsapp.replace(/\D/g, "");
  const waDisplay = s.phone.replace(/\D/g, "") === waDigits ? s.phone : `+${waDigits}`;

  const form = (
    <ContactForm
      locale={locale}
      programmes={programmes}
      whatsappNumber={waDigits}
      email={s.email}
      strings={{
        name: c.name,
        email: c.email,
        phone: c.phone,
        org: c.org,
        interest: c.interest,
        interests: c.interests,
        programme: c.programme,
        message: c.message,
        messagePlaceholder: c.messagePlaceholder,
        send: c.send,
        sending: c.sending,
        sent: c.sent,
        fallbackTitle: c.fallbackTitle,
        fallbackText: c.fallbackText,
        viaWhatsApp: c.viaWhatsApp,
        viaEmail: c.viaEmail,
        error: c.error,
      }}
    />
  );

  return (
    <>
      <PageHead title={c.title} lede={c.lede} />
      <section className="section">
        <div className="wrap contact-grid">
          {/* The form reads ?programme= and ?interest= in the browser, so this page stays static. */}
          {form}
          <aside style={{ display: "grid", gap: "1.25rem" }}>
            <h2 className="h4">{c.direct}</h2>
            <ul className="direct-list">
              <li>
                <span>{c.emailLabel}</span>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
              <li>
                <span>{c.phoneLabel}</span>
                <a href={phoneHref(s.phone)}>{s.phone}</a>
              </li>
              <li>
                <span>{c.whatsappLabel}</span>
                <a href={waLink(s.whatsapp, d.whatsapp.greeting)} target="_blank" rel="noopener">
                  {waDisplay}
                </a>
              </li>
              <li>
                <span>{c.locationLabel}</span>
                <strong style={{ fontWeight: 500 }}>{s.city[locale]}</strong>
              </li>
              {s.hours[locale] && (
                <li>
                  <span>{locale === "ur" ? "اوقاتِ کار" : "Office hours"}</span>
                  <strong style={{ fontWeight: 500 }}>{s.hours[locale]}</strong>
                </li>
              )}
            </ul>
            <p className="muted" style={{ fontSize: "0.92rem" }}>
              {c.hours}
            </p>
          </aside>
        </div>
      </section>

      <section className="section rule-top">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">{d.faq.title}</h2>
          </div>
          <div className="faq">
            {d.faq.items.map((item, i) => (
              <details key={i} open={i === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
