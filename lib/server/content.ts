import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";
import { articles as codeArticles, type Article } from "../content/articles";
import { faculty as codeFaculty, type FacultyMember } from "../content/faculty";
import { programmes as codeProgrammes, type Programme } from "../content/programmes";
import { cloneTree, defaultTree, setPath, type ContentTree } from "../content-schema";
import type { L, Locale } from "../i18n";
import { site as codeSite, zakatReference as codeZakat } from "../site";
import { safeQ } from "./db";

async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false; // outside a request (e.g. sitemap generation)
  }
}

// ---------- Page text, lists and images ----------

export const getContent = cache(async (locale: Locale): Promise<ContentTree> => {
  const tree = cloneTree(defaultTree(locale)) as unknown as Record<string, unknown>;
  const preview = await isPreview();
  const rows = await safeQ<{ key: string; published: unknown; draft: unknown; draft_reset: boolean }>(
    `SELECT key, published, draft, draft_reset FROM content_fields WHERE locale = $1 OR locale = '*'`,
    [locale],
  );
  for (const row of rows || []) {
    let value: unknown = row.published;
    if (preview) {
      if (row.draft_reset) continue; // previewing a reset: keep the default
      if (row.draft != null) value = row.draft;
    }
    if (value != null) setPath(tree, row.key, value);
  }
  return tree as unknown as ContentTree;
});

// ---------- Settings ----------

export type SiteSettings = {
  email: string;
  phone: string;
  whatsapp: string; // digits only, with country code
  city: L;
  hours: L;
  social: { linkedin: string; facebook: string; instagram: string; youtube: string; x: string };
  gaId: string;
  gtmId: string;
  notifyEmails: string; // comma separated, for the consultation form
  zakat: typeof codeZakat;
};

export function defaultSettings(): SiteSettings {
  return {
    email: codeSite.email,
    phone: codeSite.phone,
    whatsapp: codeSite.whatsappNumber,
    city: { ...codeSite.city },
    hours: { en: "", ur: "" },
    social: { linkedin: "", facebook: "", instagram: "", youtube: "", x: "" },
    gaId: "",
    gtmId: "",
    notifyEmails: process.env.CONTACT_TO_EMAIL || codeSite.email,
    zakat: { ...codeZakat, pricesAsOf: { ...codeZakat.pricesAsOf }, officialNisabYear: { ...codeZakat.officialNisabYear } },
  };
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const base = defaultSettings();
  const rows = await safeQ<{ value: Partial<SiteSettings> }>(`SELECT value FROM settings WHERE key = 'site'`);
  const saved = rows?.[0]?.value;
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    city: { ...base.city, ...(saved.city || {}) },
    hours: { ...base.hours, ...(saved.hours || {}) },
    social: { ...base.social, ...(saved.social || {}) },
    zakat: {
      ...base.zakat,
      ...(saved.zakat || {}),
      pricesAsOf: { ...base.zakat.pricesAsOf, ...(saved.zakat?.pricesAsOf || {}) },
      officialNisabYear: { ...base.zakat.officialNisabYear, ...(saved.zakat?.officialNisabYear || {}) },
    },
  };
});

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

// ---------- Programmes ----------

export const getProgrammes = cache(async (): Promise<Programme[]> => {
  const rows = await safeQ<{ slug: string; kind: Programme["kind"]; data: Omit<Programme, "slug" | "kind"> }>(
    `SELECT slug, kind, data FROM programmes WHERE visible = true ORDER BY sort, id`,
  );
  if (!rows) return codeProgrammes;
  return rows.map((r) => ({ ...r.data, slug: r.slug, kind: r.kind }));
});

export async function getProgramme(slug: string) {
  return (await getProgrammes()).find((p) => p.slug === slug);
}

// ---------- Faculty ----------

export const getFaculty = cache(async (): Promise<FacultyMember[]> => {
  const rows = await safeQ<{ slug: string; photo: string | null; data: Omit<FacultyMember, "slug" | "photo"> }>(
    `SELECT slug, photo, data FROM faculty WHERE visible = true ORDER BY sort, id`,
  );
  if (!rows) return codeFaculty;
  return rows.map((r) => ({ ...r.data, slug: r.slug, photo: r.photo || undefined }));
});

// ---------- Insights ----------

export type PostView = Omit<Article, "body"> & {
  html?: L; // rich text from the admin editor
  body?: Article["body"]; // structured blocks from the built-in articles
  tags: string[];
  seo: SeoFields;
};

export type SeoFields = { title?: L; description?: L; ogImage?: string; noindex?: boolean; canonical?: string };

function wordsIn(html: string) {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

type PostRow = {
  slug: string;
  image: string | null;
  tags: string[];
  publish_at: Date | null;
  created_at: Date;
  data: { title: L; excerpt: L; topic: L; body: L; imageAlt: L };
  seo: SeoFields;
};

function toView(r: PostRow): PostView {
  const date = (r.publish_at || r.created_at).toISOString().slice(0, 10);
  return {
    slug: r.slug,
    topic: r.data.topic,
    title: r.data.title,
    excerpt: r.data.excerpt,
    image: r.image || "/images/arches.jpg",
    imageAlt: r.data.imageAlt || { en: "", ur: "" },
    minutes: Math.max(1, Math.round(wordsIn(r.data.body?.en || "") / 200)),
    date,
    html: r.data.body,
    tags: r.tags || [],
    seo: r.seo || {},
  };
}

const visibleWhere = `(status = 'published' OR status = 'scheduled') AND (publish_at IS NULL OR publish_at <= now())`;

export const getPosts = cache(async (): Promise<PostView[]> => {
  const rows = await safeQ<PostRow>(
    `SELECT slug, image, tags, publish_at, created_at, data, seo FROM posts WHERE ${visibleWhere} ORDER BY coalesce(publish_at, created_at) DESC`,
  );
  if (!rows) return codeArticles.map((a) => ({ ...a, tags: [], seo: {} }));
  return rows.map(toView);
});

export const getPost = cache(async (slug: string): Promise<PostView | undefined> => {
  const preview = await isPreview();
  const rows = await safeQ<PostRow & { autosave: PostRow["data"] | null }>(
    `SELECT slug, image, tags, publish_at, created_at, data, seo, autosave FROM posts WHERE slug = $1 ${preview ? "" : `AND ${visibleWhere}`}`,
    [slug],
  );
  if (!rows) {
    const a = codeArticles.find((x) => x.slug === slug);
    return a ? { ...a, tags: [], seo: {} } : undefined;
  }
  const r = rows[0];
  if (!r) return undefined;
  return toView(preview && r.autosave ? { ...r, data: r.autosave } : r);
});

// ---------- SEO ----------

export type SeoOverride = { title: string | null; description: string | null; og_image: string | null; noindex: boolean; canonical: string | null };

export const getSeoMap = cache(async () => {
  const rows = await safeQ<SeoOverride & { key: string; locale: string }>(`SELECT key, locale, title, description, og_image, noindex, canonical FROM seo`);
  const map = new Map<string, SeoOverride>();
  for (const r of rows || []) map.set(`${r.key}|${r.locale}`, r);
  return map;
});

export async function getSeo(key: string, locale: Locale) {
  return (await getSeoMap()).get(`${key}|${locale}`) || null;
}
