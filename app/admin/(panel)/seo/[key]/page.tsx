import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { getContent } from "@/lib/server/content";
import { one, q } from "@/lib/server/db";
import { site } from "@/lib/site";
import { fixedSeoPages } from "../../../seo-pages";
import SeoForm, { type SeoValues } from "./SeoForm";

export const metadata = { title: "Edit SEO" };

type L = { en: string; ur: string };

async function defaultsFor(key: string): Promise<{ label: string; path: string; title: L; description: L } | null> {
  const [en, ur] = await Promise.all([getContent("en"), getContent("ur")]);
  const fixed = fixedSeoPages.find((p) => p.key === key);
  if (fixed) {
    if (key === "home") return { label: fixed.label, path: fixed.path, title: { en: en.meta.title, ur: ur.meta.title }, description: { en: en.meta.description, ur: ur.meta.description } };
    const k = key as "advisory" | "academy" | "faculty" | "zakat" | "insights" | "contact";
    return { label: fixed.label, path: fixed.path, title: { en: en[k].title, ur: ur[k].title }, description: { en: en[k].lede, ur: ur[k].lede } };
  }
  const m = /^programme:([a-z0-9-]+)$/.exec(key);
  if (!m) return null;
  const p = await one<{ data: { title: L; summary: L } }>(`SELECT data FROM programmes WHERE slug = $1`, [m[1]]);
  if (!p) return null;
  return { label: p.data.title.en, path: `/academy/${m[1]}`, title: p.data.title, description: p.data.summary };
}

export default async function EditSeo({ params }: { params: Promise<{ key: string }> }) {
  await requirePage("seo.edit");
  const key = decodeURIComponent((await params).key);
  const d = await defaultsFor(key);
  if (!d) notFound();
  const rows = await q<{ locale: "en" | "ur"; title: string | null; description: string | null; og_image: string | null; noindex: boolean; canonical: string | null }>(
    `SELECT locale, title, description, og_image, noindex, canonical FROM seo WHERE key = $1`,
    [key],
  );
  const get = (l: "en" | "ur") => rows.find((r) => r.locale === l);
  const values: SeoValues = {
    key,
    title: { en: get("en")?.title || "", ur: get("ur")?.title || "" },
    description: { en: get("en")?.description || "", ur: get("ur")?.description || "" },
    canonical: { en: get("en")?.canonical || "", ur: get("ur")?.canonical || "" },
    ogImage: get("en")?.og_image || get("ur")?.og_image || "",
    noindex: rows.some((r) => r.noindex),
  };
  const host = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/seo" className="a-crumb">
            SEO
          </Link>
          <h1>{d.label}</h1>
          <p>{d.path}</p>
        </div>
        <div className="actions">
          <a className="a-btn secondary" href={`/en${d.path === "/" ? "" : d.path}`} target="_blank" rel="noopener">
            View page
          </a>
        </div>
      </div>
      <SeoForm values={values} defaults={{ title: d.title, description: d.description }} host={host} path={d.path} siteName={{ en: site.name.en, ur: site.name.ur }} isHome={key === "home"} />
    </>
  );
}
