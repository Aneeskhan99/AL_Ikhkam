import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getContent, getSettings, phoneHref, waLink } from "@/lib/server/content";
import { site } from "@/lib/site";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
};

export default async function Footer({ locale }: { locale: Locale }) {
  const d = await getContent(locale);
  const s = await getSettings();
  const p = (path: string) => `/${locale}${path}`;
  const year = new Date().getFullYear();
  const socials = Object.entries(s.social).filter(([, url]) => url);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Image src="/brand/al-ihkam-logo.png" alt={site.arabicName} width={581} height={568} className="footer-logo" sizes="96px" />
            <span className="brand-name">{site.name[locale]}</span>
            <p>{d.footer.about}</p>
          </div>
          <div>
            <h2>{d.footer.explore}</h2>
            <ul>
              <li><Link href={p("/advisory")}>{d.nav.advisory}</Link></li>
              <li><Link href={p("/academy")}>{d.nav.academy}</Link></li>
              <li><Link href={p("/faculty")}>{d.nav.faculty}</Link></li>
              <li><Link href={p("/zakat")}>{d.nav.zakat}</Link></li>
              <li><Link href={p("/insights")}>{d.nav.insights}</Link></li>
            </ul>
          </div>
          <div>
            <h2>{d.footer.reach}</h2>
            <ul>
              <li><a href={`mailto:${s.email}`} className="latin">{s.email}</a></li>
              <li><a href={phoneHref(s.phone)} dir="ltr" className="latin">{s.phone}</a></li>
              <li><a href={waLink(s.whatsapp, d.whatsapp.greeting)} target="_blank" rel="noopener">{d.contact.whatsappLabel}</a></li>
              <li>{s.city[locale]}</li>
              {s.hours[locale] && <li>{s.hours[locale]}</li>}
              {socials.map(([k, url]) => (
                <li key={k}>
                  <a href={url} target="_blank" rel="noopener" className="latin">{socialLabels[k] || k}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {year} {site.name[locale]}. {d.footer.rights}
          </span>
          <span>{d.footer.standards}</span>
        </div>
      </div>
    </footer>
  );
}
