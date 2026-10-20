import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { isLocale, locales } from "@/lib/i18n";
import { getContent, getPost, getPosts } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string; slug: string }>;

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return locales.flatMap((locale) => posts.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await getPost(slug);
  if (!isLocale(locale) || !a) return {};
  const meta = await pageMetadata(
    `post:${slug}`,
    locale,
    { title: a.title[locale] || a.title.en, description: a.excerpt[locale] || a.excerpt.en, path: `/insights/${slug}`, image: a.image, type: "article" },
    {
      title: a.seo.title?.[locale] || undefined,
      description: a.seo.description?.[locale] || undefined,
      ogImage: a.seo.ogImage || undefined,
      noindex: a.seo.noindex || undefined,
      canonical: a.seo.canonical || undefined,
    },
  );
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: a.date } };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const a = await getPost(slug);
  if (!a) notFound();
  const d = await getContent(locale);
  const date = new Date(a.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const others = (await getPosts()).filter((x) => x.slug !== a.slug).slice(0, 3);
  const html = a.html ? a.html[locale] || a.html.en : null;
  const htmlIsFallback = Boolean(a.html && !a.html[locale] && locale !== "en");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title.en,
    datePublished: a.date,
    image: a.image.startsWith("http") ? a.image : `${site.url}${a.image}`,
    author: { "@type": "Organization", name: "Al-Ihkam" },
  };

  return (
    <article>
      <header className="article-head">
        <div className="wrap">
          <Link href={`/${locale}/insights`} className="link breadcrumb" style={{ justifySelf: "start" }}>
            {d.insights.back}
          </Link>
          <span className="kicker">{a.topic[locale] || a.topic.en}</span>
          <h1 className="h2">{a.title[locale] || a.title.en}</h1>
          <p className="muted">
            {d.insights.by}, {date}, {d.insights.minutes(a.minutes)}
          </p>
        </div>
      </header>
      <div className="wrap">
        <div className="article-hero">
          <Image src={a.image} alt={a.imageAlt[locale] || ""} fill priority sizes="100vw" />
        </div>
      </div>
      <div className="wrap">
        {html != null ? (
          // Sanitised when saved in the admin (lib/server/sanitize.ts).
          <div
            className="prose"
            lang={htmlIsFallback ? "en" : undefined}
            dir={htmlIsFallback ? "ltr" : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="prose">
            {(a.body?.[locale] || []).map((b, i) => {
              switch (b.type) {
                case "h2":
                  return <h2 key={i}>{b.text}</h2>;
                case "ul":
                  return (
                    <ul key={i}>
                      {b.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  );
                case "quote":
                  return (
                    <blockquote key={i}>
                      {b.arabic && (
                        <span className="arabic" lang="ar">
                          {b.arabic}
                        </span>
                      )}
                      <span>{b.text}</span>
                      {b.cite && <cite>{b.cite}</cite>}
                    </blockquote>
                  );
                default:
                  return <p key={i}>{b.text}</p>;
              }
            })}
          </div>
        )}
        {a.tags.length > 0 && (
          <ul className="tag-list">
            {a.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
      {others.length > 0 && (
        <section className="section-tight rule-top">
          <div className="wrap">
            <div className="section-head-row">
              <h2 className="h3">{d.insights.related}</h2>
            </div>
            <div className="article-grid">
              {others.map((x) => (
                <ArticleCard key={x.slug} article={x} locale={locale} minutesLabel={d.insights.minutes(x.minutes)} />
              ))}
            </div>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
