"use client";

import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/server/content";
import { saveSettings, sendTestEmail } from "../../actions/settings";
import { BiField } from "../../fields";
import { ActionForm, SubmitButton } from "../../ui";

function Text({ name, label, value, hint, type = "text", placeholder, required, inputMode }: { name: string; label: string; value: string | number; hint?: string; type?: string; placeholder?: string; required?: boolean; inputMode?: "numeric" | "decimal" | "tel" | "email" | "url" }) {
  return (
    <div className="a-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={value} placeholder={placeholder} required={required} inputMode={inputMode} step={type === "number" ? "any" : undefined} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export default function SettingsForm({ values: s }: { values: SiteSettings }) {
  const router = useRouter();
  const z = s.zakat;
  return (
    <ActionForm action={saveSettings} className="a-stack" onSuccess={() => router.refresh()}>
      {(pending) => (
        <>
          <div className="a-panel a-panel-pad set-sections">
            <section>
              <header>
                <h2>Contact details</h2>
                <p>Shown in the header, footer, contact page and the WhatsApp button.</p>
              </header>
              <div className="a-stack" style={{ gap: "0.9rem" }}>
                <div className="a-grid-2">
                  <Text name="email" label="Public email" type="email" value={s.email} required />
                  <Text name="phone" label="Phone" value={s.phone} inputMode="tel" placeholder="+92 333 554 2606" />
                </div>
                <Text name="whatsapp" label="WhatsApp number" value={s.whatsapp} inputMode="numeric" hint="Digits only with the country code, for example 923335542606." />
                <BiField name="city" label="Location" value={s.city} required />
                <BiField name="hours" label="Office hours" value={s.hours} hint="Optional, for example “Monday to Friday, 9am to 5pm”. Shown in the footer." />
              </div>
            </section>

            <section>
              <header>
                <h2>Consultation requests</h2>
                <p>Who gets an email when someone sends the contact form.</p>
              </header>
              <Text name="notifyEmails" label="Notification addresses" value={s.notifyEmails} hint="Separate several addresses with commas. Requests are always saved under Enquiries as well." />
            </section>

            <section>
              <header>
                <h2>Zakat calculator</h2>
                <p>Reference figures used on the Zakat page. Visitors can still type today’s rate themselves.</p>
              </header>
              <div className="a-stack" style={{ gap: "0.9rem" }}>
                <div className="a-grid-2">
                  <Text name="zakat.silverPerTola" label="Silver price per tola (PKR)" type="number" value={z.silverPerTola} inputMode="decimal" />
                  <Text name="zakat.goldPerTola" label="Gold price per tola, 24 karat (PKR)" type="number" value={z.goldPerTola} inputMode="decimal" />
                </div>
                <BiField name="zakat.pricesAsOf" label="Prices as of" value={z.pricesAsOf} required />
                <Text name="zakat.priceSource" label="Price source" value={z.priceSource} />
                <div className="a-grid-2">
                  <Text name="zakat.officialNisab" label="Government Nisab for bank deduction (PKR)" type="number" value={z.officialNisab} inputMode="decimal" />
                </div>
                <BiField name="zakat.officialNisabYear" label="Nisab year" value={z.officialNisabYear} required />
              </div>
            </section>

            <section>
              <header>
                <h2>Social links</h2>
                <p>Shown in the footer for the links you fill in.</p>
              </header>
              <div className="a-grid-2">
                <Text name="social.linkedin" label="LinkedIn" value={s.social.linkedin} placeholder="https://www.linkedin.com/company/…" inputMode="url" />
                <Text name="social.facebook" label="Facebook" value={s.social.facebook} placeholder="https://www.facebook.com/…" inputMode="url" />
                <Text name="social.instagram" label="Instagram" value={s.social.instagram} placeholder="https://www.instagram.com/…" inputMode="url" />
                <Text name="social.youtube" label="YouTube" value={s.social.youtube} placeholder="https://www.youtube.com/@…" inputMode="url" />
                <Text name="social.x" label="X (Twitter)" value={s.social.x} placeholder="https://x.com/…" inputMode="url" />
              </div>
            </section>

            <section>
              <header>
                <h2>Analytics</h2>
                <p>Leave empty to run the site without tracking.</p>
              </header>
              <div className="a-grid-2">
                <Text name="gaId" label="Google Analytics ID" value={s.gaId} placeholder="G-XXXXXXXXXX" />
                <Text name="gtmId" label="Google Tag Manager ID" value={s.gtmId} placeholder="GTM-XXXXXXX" />
              </div>
            </section>
          </div>
          <div className="a-savebar">
            <SubmitButton pending={pending}>Save settings</SubmitButton>
            <span className="a-small a-muted">Changes go live on the website straight away.</span>
          </div>
        </>
      )}
    </ActionForm>
  );
}

export function TestEmailForm({ defaultTo }: { defaultTo: string }) {
  return (
    <ActionForm action={sendTestEmail} className="a-row">
      {(pending) => (
        <>
          <input type="email" name="to" defaultValue={defaultTo} aria-label="Send a test email to" required style={{ maxWidth: 320 }} />
          <SubmitButton pending={pending} className="a-btn secondary">
            Send a test email
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
