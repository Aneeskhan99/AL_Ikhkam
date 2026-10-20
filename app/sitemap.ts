import type { MetadataRoute } from "next";
import { getPosts, getProgrammes, getSeoMap } from "@/lib/server/content";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, posts, seo] = await Promise.all([getProgrammes(), getPosts(), getSeoMap()]);
  const entries: { key: string; path: string; noindexFromPost?: boolean }[] = [
    { key: "home", path: "" },
    { key: "advisory", path: "/advisory" },
    { key: "academy", path: "/academy" },
    { key: "faculty", path: "/faculty" },
    { key: "zakat", path: "/zakat" },
    { key: "insights", path: "/insights" },
    { key: "contact", path: "/contact" },
    ...programmes.map((p) => ({ key: `programme:${p.slug}`, path: `/academy/${p.slug}` })),
    ...posts.map((a) => ({ key: `post:${a.slug}`, path: `/insights/${a.slug}`, noindexFromPost: Boolean(a.seo.noindex) })),
  ];
  return entries
    .filter((e) => !e.noindexFromPost && !seo.get(`${e.key}|en`)?.noindex)
    .map((e) => ({
      url: `${site.url}/en${e.path}`,
      alternates: { languages: { en: `${site.url}/en${e.path}`, ur: `${site.url}/ur${e.path}` } },
    }));
}
