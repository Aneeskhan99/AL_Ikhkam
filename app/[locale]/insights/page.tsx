import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import PageHead from "@/components/PageHead";
import { isLocale } from "@/lib/i18n";
import { getContent, getPosts } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

// Scheduled articles appear within five minutes of their publish time.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("insights", locale, { title: d.insights.title, description: d.insights.lede, path: "/insights" });
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = await getContent(locale);
  const posts = await getPosts();

  return (
    <>
      <PageHead title={d.insights.title} lede={d.insights.lede} />
      <section className="section">
        <div className="wrap article-grid">
          {posts.map((a) => (
            <ArticleCard key={a.slug} article={a} locale={locale} minutesLabel={d.insights.minutes(a.minutes)} />
          ))}
        </div>
      </section>
    </>
  );
}
