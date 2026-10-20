import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import ProgrammeCatalogue from "@/components/ProgrammeCatalogue";
import { isLocale } from "@/lib/i18n";
import { getContent, getProgrammes } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("academy", locale, { title: d.academy.title, description: d.academy.lede, path: "/academy" });
}

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = await getContent(locale);
  const a = d.academy;
  const programmes = await getProgrammes();

  const items = programmes.map((p) => ({
    slug: p.slug,
    kind: p.kind,
    level: p.level[locale],
    title: p.title[locale],
    facts: `${p.duration[locale]}, ${p.format[locale]}`,
    summary: p.summary[locale],
  }));

  return (
    <>
      <PageHead title={a.title} lede={a.lede} />

      <section className="section">
        <div className="wrap">
          <ProgrammeCatalogue
            locale={locale}
            items={items}
            labels={{ tabs: a.tabsLabel, courses: a.courses, workshops: a.workshops, details: a.details }}
          />
        </div>
      </section>

      <section className="section-tight rule-top">
        <div className="wrap feature">
          <div className="feature-img">
            <Image src={d.images.academy} alt="" fill sizes="(max-width: 960px) 100vw, 45vw" />
          </div>
          <div className="feature-copy">
            <h2 className="h2">{a.inHouse}</h2>
            <p className="lede">{a.inHouseText}</p>
            <Link href={`/${locale}/contact?interest=4`} className="btn btn-primary">
              {a.inHouseCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
