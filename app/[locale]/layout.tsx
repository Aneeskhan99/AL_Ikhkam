import "@fontsource/libre-caslon-display/400.css";
import "@fontsource/libre-caslon-text/400.css";
import "@fontsource/libre-caslon-text/400-italic.css";
import "@fontsource/libre-caslon-text/700.css";
import "@fontsource-variable/hanken-grotesk/index.css";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource-variable/noto-nastaliq-urdu/index.css";
import "../globals.css";

import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SourceTracker from "@/components/SourceTracker";
import WhatsAppButton from "@/components/WhatsAppButton";
import { dirOf, isLocale, locales, type Locale } from "@/lib/i18n";
import { getContent, getSettings, waLink } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#13261f",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  const page = await pageMetadata("home", locale, { title: d.meta.title, description: d.meta.description, path: "", image: "/images/og.jpg" });
  return {
    ...page,
    metadataBase: new URL(site.url),
    title: { default: String(page.title), template: `%s | ${site.name[locale]}` },
    openGraph: {
      ...page.openGraph,
      siteName: site.name[locale],
      locale: locale === "ur" ? "ur_PK" : "en_PK",
      images: page.openGraph?.images || [{ url: "/images/og.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: String(page.title),
      description: String(page.description || d.meta.description),
      images: [((page.openGraph?.images as { url: string }[] | undefined)?.[0]?.url) || "/images/og.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  // Unknown first segments fall back to English so the 404 page renders inside the site chrome.
  const locale: Locale = isLocale(raw) ? raw : "en";
  const d = await getContent(locale);
  const s = await getSettings();
  const preview = (await draftMode()).isEnabled;
  const p = (path: string) => `/${locale}${path}`;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Al-Ihkam",
    alternateName: "الاحکام",
    description: (await getContent("en")).meta.description,
    url: site.url,
    email: s.email,
    telephone: s.phone,
    areaServed: "PK",
    address: { "@type": "PostalAddress", addressLocality: "Islamabad", addressCountry: "PK" },
    sameAs: Object.values(s.social).filter(Boolean),
  };

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions such as Grammarly add attributes to <body> before React loads */}
      <body suppressHydrationWarning>
        {preview && (
          <div className="preview-bar" lang="en" dir="ltr">
            <span>Preview: you are seeing unpublished drafts. Visitors still see the published site.</span>
            <a href="/api/preview/exit" data-prefetch="false">Exit preview</a>
          </div>
        )}
        <a href="#main" className="skip-link">
          {d.nav.skip}
        </a>
        <Header
          locale={locale}
          brandName={site.name[locale]}
          brandSub={d.brand.tagline}
          items={[
            { href: p("/advisory"), label: d.nav.advisory },
            { href: p("/academy"), label: d.nav.academy },
            { href: p("/faculty"), label: d.nav.faculty },
            { href: p("/zakat"), label: d.nav.zakat },
            { href: p("/insights"), label: d.nav.insights },
            { href: p("/contact"), label: d.nav.contact },
          ]}
          bookLabel={d.nav.book}
          menuLabel={d.nav.menu}
          closeLabel={d.nav.close}
          switchTo={d.nav.switchTo}
          switchLabel={d.nav.switchLabel}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <WhatsAppButton label={d.whatsapp.label} href={waLink(s.whatsapp, d.whatsapp.greeting)} />
        <SourceTracker />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {s.gtmId && /^GTM-[A-Z0-9]+$/.test(s.gtmId) && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtmId}');`}
          </Script>
        )}
        {s.gaId && /^G-[A-Z0-9]+$/.test(s.gaId) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
