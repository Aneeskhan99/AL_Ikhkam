import "server-only";
import type { Metadata } from "next";
import type { Locale } from "../i18n";
import { getSeo } from "./content";

type Base = { title: string; description: string; path: string; image?: string; type?: "website" | "article" };

/** Page metadata with the SEO overrides from Admin › SEO applied. `key` is e.g. "advisory" or "programme:<slug>". */
export async function pageMetadata(key: string, locale: Locale, base: Base, extra: Partial<{ noindex: boolean; canonical: string; ogImage: string; title: string; description: string }> = {}): Promise<Metadata> {
  const o = await getSeo(key, locale);
  const title = extra.title || o?.title || base.title;
  const description = extra.description || o?.description || base.description;
  const image = extra.ogImage || o?.og_image || base.image;
  const noindex = extra.noindex ?? o?.noindex ?? false;
  const canonical = extra.canonical || o?.canonical || `/${locale}${base.path}`;
  const other = locale === "en" ? "ur" : "en";
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { [locale]: `/${locale}${base.path}`, [other]: `/${other}${base.path}` },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: base.type || "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
