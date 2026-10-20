import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { PostView } from "@/lib/server/content";

export default function ArticleCard({ article, locale, minutesLabel }: { article: PostView; locale: Locale; minutesLabel: string }) {
  return (
    <Link href={`/${locale}/insights/${article.slug}`} className="article-card">
      <div className="thumb">
        <Image src={article.image} alt={article.imageAlt[locale] || ""} fill sizes="(max-width: 960px) 100vw, 33vw" />
      </div>
      <span className="meta">
        {article.topic[locale]}, {minutesLabel}
      </span>
      <h3 className="h4">{article.title[locale] || article.title.en}</h3>
      <p>{article.excerpt[locale] || article.excerpt.en}</p>
    </Link>
  );
}
