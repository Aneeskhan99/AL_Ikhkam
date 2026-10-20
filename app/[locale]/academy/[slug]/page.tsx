import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import { isLocale, locales } from "@/lib/i18n";
import { getContent, getProgramme, getProgrammes } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const programmes = await getProgrammes();
  return locales.flatMap((locale) => programmes.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProgramme(slug);
  if (!isLocale(locale) || !p) return {};
  return pageMetadata(`programme:${slug}`, locale, { title: p.title[locale], description: p.summary[locale], path: `/academy/${slug}` });
}

export default async function ProgrammePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const p = await getProgramme(slug);
  if (!isLocale(locale) || !p) notFound();
  const a = (await getContent(locale)).academy;
  const interest = p.kind === "course" ? 3 : 4;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.title.en,
    description: p.summary.en,
    inLanguage: ["en", "ur"],
    provider: { "@type": "Organization", name: "Al-Ihkam", url: site.url },
  };

  return (
    <>
      <PageHead title={p.title[locale]} lede={p.summary[locale]} kicker={p.level[locale]} back={{ href: `/${locale}/academy`, label: a.back }} />

      <section className="section">
        <div className="wrap prog-layout">
          <div className="prog-main">
            <section>
              <h2 className="h3">{a.whoFor}</h2>
              <p>{p.audience[locale]}</p>
            </section>
            <section>
              <h2 className="h3">{a.covers}</h2>
              <ol className="module-list">
                {p.modules[locale].map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="h3">{a.inHouse}</h2>
              <p>{a.inHouseText}</p>
            </section>
          </div>

          <aside className="panel facts-panel">
            <dl>
              <div>
                <dt>{a.level}</dt>
                <dd>{p.level[locale]}</dd>
              </div>
              <div>
                <dt>{a.duration}</dt>
                <dd>{p.duration[locale]}</dd>
              </div>
              <div>
                <dt>{a.format}</dt>
                <dd>{p.format[locale]}</dd>
              </div>
              <div>
                <dt>{a.certificate}</dt>
                <dd>{a.certificateText}</dd>
              </div>
              <div>
                <dt>{a.fees}</dt>
                <dd>{a.feesText}</dd>
              </div>
            </dl>
            <Link href={`/${locale}/contact?programme=${p.slug}&interest=${interest}`} className="btn btn-primary">
              {a.enquire}
            </Link>
          </aside>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
