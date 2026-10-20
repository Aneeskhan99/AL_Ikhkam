import "server-only";
import { ValidationError } from "./validate";

type L = { en: string; ur: string };

/** Read "<name>.en" / "<name>.ur" from a form. */
export function pairFrom(fd: FormData, name: string, opts: { max?: number; label?: string; requiredEn?: boolean } = {}): L {
  const get = (l: string) => {
    const raw = fd.get(`${name}.${l}`);
    const v = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
    if (opts.max && v.length > opts.max) throw new ValidationError(`${opts.label || name} (${l === "en" ? "English" : "Urdu"}) must be ${opts.max} characters or fewer.`);
    return v;
  };
  const out = { en: get("en"), ur: get("ur") };
  if (opts.requiredEn && !out.en) throw new ValidationError(`${opts.label || name} (English) is required.`);
  return out;
}

/** Read a bilingual list (one item per line). */
export function listPairFrom(fd: FormData, name: string, opts: { maxItems?: number; label?: string } = {}) {
  const split = (l: string) => {
    const raw = fd.get(`${name}.${l}`);
    const items = (typeof raw === "string" ? raw : "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (opts.maxItems && items.length > opts.maxItems) throw new ValidationError(`${opts.label || name} has more than ${opts.maxItems} items.`);
    return items.map((s) => s.slice(0, 500));
  };
  return { en: split("en"), ur: split("ur") };
}

export function imagePath(v: string, label = "Image") {
  if (!v) return "";
  if ((v.startsWith("/") && !v.startsWith("//")) || v.startsWith("https://")) return v.slice(0, 500);
  throw new ValidationError(`${label} must be a /media/ or /images/ path or an https link.`);
}
