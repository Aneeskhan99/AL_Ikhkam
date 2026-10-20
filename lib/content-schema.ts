// The editable-content model behind Admin › Pages.
// Every string, list and card in the dictionaries (lib/dict/*) and the advisory content becomes a field.
// Code values are the defaults; the database stores only what an editor has changed.

import en from "./dict/en";
import ur from "./dict/ur";
import { deliverables, processSteps, services } from "./content/advisory";
import type { Locale } from "./i18n";

export type ItemFieldType = "text" | "textarea" | "list";
export type FieldType = ItemFieldType | "items" | "image";

export type FieldDef = {
  key: string; // dotted path, e.g. "home.title"
  label: string;
  type: FieldType;
  shared?: boolean; // one value for both languages (images)
  itemFields?: { name: string; label: string; type: ItemFieldType }[];
};

export type PageGroup = {
  id: string;
  label: string;
  description: string;
  /** Public paths (without locale) to refresh after publishing. "*" = every page. */
  paths: string[];
  /** Path (without locale) to open for preview. */
  previewPath: string;
  prefixes: string[];
  images?: { key: string; label: string }[];
};

export const sharedImages: Record<string, string> = {
  "images.hero": "/images/hero.jpg",
  "images.advisory": "/images/advisory.jpg",
  "images.academy": "/images/academy.jpg",
  "images.zakat": "/images/zakat.jpg",
};

export const pageGroups: PageGroup[] = [
  {
    id: "home",
    label: "Home",
    description: "Hero, credentials, the two practices, the name band, faculty, Zakat and closing sections.",
    paths: ["/"],
    previewPath: "",
    prefixes: ["home."],
    images: [
      { key: "images.hero", label: "Hero image" },
      { key: "images.zakat", label: "Zakat section image" },
    ],
  },
  {
    id: "advisory",
    label: "Advisory",
    description: "The advisory page, its service cards, deliverables and the four review steps (also shown on Home).",
    paths: ["/advisory", "/"],
    previewPath: "/advisory",
    prefixes: ["advisory.", "advisoryContent."],
    images: [{ key: "images.advisory", label: "Advisory image (also on Home)" }],
  },
  {
    id: "academy",
    label: "Academy",
    description: "Academy page and the shared labels on every programme page.",
    paths: ["/academy", "/academy/*"],
    previewPath: "/academy",
    prefixes: ["academy."],
    images: [{ key: "images.academy", label: "Academy image (also on Home)" }],
  },
  { id: "faculty", label: "Faculty", description: "Faculty page heading and labels. Profiles are under Faculty.", paths: ["/faculty"], previewPath: "/faculty", prefixes: ["faculty."] },
  { id: "zakat", label: "Zakat calculator", description: "Every label and note on the calculator. Rates are under Settings.", paths: ["/zakat"], previewPath: "/zakat", prefixes: ["zakat."] },
  { id: "insights", label: "Insights", description: "Insights page heading and article labels. Articles are under Insights.", paths: ["/insights", "/insights/*"], previewPath: "/insights", prefixes: ["insights."] },
  { id: "contact", label: "Contact and FAQ", description: "Contact page, form labels and messages, and the FAQ.", paths: ["/contact"], previewPath: "/contact", prefixes: ["contact.", "faq."] },
  {
    id: "global",
    label: "Header, footer and site-wide",
    description: "Site title and description, menu, footer, WhatsApp button and the 404 page.",
    paths: ["*"],
    previewPath: "",
    prefixes: ["meta.", "brand.", "nav.", "footer.", "whatsapp.", "notFound."],
  },
];

/** The default content tree for one language: dictionary plus advisory content. */
export function defaultTree(locale: Locale) {
  const dict = locale === "ur" ? ur : en;
  return {
    ...dict,
    advisoryContent: {
      services: services.map((s) => ({ title: s.title[locale], summary: s.summary[locale], points: s.points[locale] })),
      deliverables: deliverables[locale],
      processSteps: processSteps.map((s) => ({ title: s.title[locale], text: s.text[locale] })),
    },
    images: { hero: sharedImages["images.hero"], advisory: sharedImages["images.advisory"], academy: sharedImages["images.academy"], zakat: sharedImages["images.zakat"] },
  };
}

export type ContentTree = ReturnType<typeof defaultTree>;

const labelOverrides: Record<string, string> = {
  "home.lede": "Intro paragraph",
  "home.ctaPrimary": "Main button",
  "home.ctaSecondary": "Second link",
  "home.nameNote": "Hero image caption",
  "home.nameVerse": "Arabic verse",
  "home.nameRef": "Verse reference",
  "meta.title": "Browser tab and search title",
  "meta.description": "Search and share description",
  "advisoryContent.services": "Service cards",
  "advisoryContent.deliverables": "What you receive (list)",
  "advisoryContent.processSteps": "Review steps",
  "faq.items": "Questions and answers",
};

export function humanize(key: string) {
  if (labelOverrides[key]) return labelOverrides[key];
  const last = key.split(".").pop() || key;
  const words = last
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Walk the English default tree and produce field definitions for a group. */
export function fieldsFor(group: PageGroup): FieldDef[] {
  const tree = defaultTree("en") as unknown as Record<string, unknown>;
  const out: FieldDef[] = [];

  const walk = (value: unknown, path: string) => {
    if (typeof value === "function") return; // formatting helpers stay in code
    if (typeof value === "string") {
      out.push({ key: path, label: humanize(path), type: value.length > 90 ? "textarea" : "text" });
    } else if (Array.isArray(value)) {
      if (value.every((v) => typeof v === "string")) {
        out.push({ key: path, label: humanize(path), type: "list" });
      } else if (value.every(isPlainObject)) {
        const sample = value[0] as Record<string, unknown>;
        out.push({
          key: path,
          label: humanize(path),
          type: "items",
          itemFields: Object.entries(sample).map(([name, v]) => ({
            name,
            label: humanize(name),
            type: Array.isArray(v) ? "list" : typeof v === "string" && v.length > 90 ? "textarea" : "text",
          })),
        });
      }
    } else if (isPlainObject(value)) {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    }
  };

  for (const prefix of group.prefixes) {
    const root = prefix.replace(/\.$/, "");
    walk(tree[root], root);
  }
  for (const img of group.images || []) out.push({ key: img.key, label: img.label, type: "image", shared: true });
  return out;
}

export function groupForKey(key: string) {
  return pageGroups.find((g) => g.prefixes.some((p) => key.startsWith(p)) || g.images?.some((i) => i.key === key));
}

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc == null ? undefined : (acc as Record<string, unknown>)[k]), obj);
}

export function defaultValue(key: string, locale: Locale | "*") {
  if (key.startsWith("images.")) return sharedImages[key];
  return getPath(defaultTree(locale === "*" ? "en" : locale), key);
}

/** Copy plain data deeply while keeping functions by reference. */
export function cloneTree<T>(v: T): T {
  if (Array.isArray(v)) return v.map(cloneTree) as T;
  if (isPlainObject(v)) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = cloneTree(val);
    return out as T;
  }
  return v;
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isPlainObject(cur[parts[i]])) return; // unknown path: ignore stale rows
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (!(last in cur)) return;
  // Keep the shape: only accept values of the same kind as the default.
  const def = cur[last];
  if (typeof def === "function") return;
  if (Array.isArray(def) !== Array.isArray(value)) return;
  if (typeof def === "string" && typeof value !== "string") return;
  cur[last] = value;
}

/** Turn "/advisory" into ["/en/advisory", "/ur/advisory"]. */
export function localisedPaths(path: string) {
  return (["en", "ur"] as const).map((l) => `/${l}${path === "/" ? "" : path}`);
}
