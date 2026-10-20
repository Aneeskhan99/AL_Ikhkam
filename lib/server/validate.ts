// Small server-side validation helpers for FormData.

export class ValidationError extends Error {
  override name = "ValidationError";
}

export function str(fd: FormData, name: string, opts: { required?: boolean; max?: number; label?: string } = {}) {
  const raw = fd.get(name);
  const v = typeof raw === "string" ? raw.trim() : "";
  const label = opts.label || name;
  if (opts.required && !v) throw new ValidationError(`${label} is required.`);
  if (opts.max && v.length > opts.max) throw new ValidationError(`${label} must be ${opts.max} characters or fewer.`);
  return v;
}

export function int(fd: FormData, name: string, fallback = 0) {
  const n = parseInt(String(fd.get(name) ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function num(fd: FormData, name: string, fallback = 0) {
  const n = parseFloat(String(fd.get(name) ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function bool(fd: FormData, name: string) {
  const v = fd.get(name);
  return v === "on" || v === "true" || v === "1";
}

export function lines(fd: FormData, name: string) {
  return str(fd, name)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function oneOf<T extends string>(value: string, allowed: readonly T[], label = "Value"): T {
  if (!(allowed as readonly string[]).includes(value)) throw new ValidationError(`${label} is not valid.`);
  return value as T;
}

export function email(v: string, label = "Email") {
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new ValidationError(`${label} is not a valid email address.`);
  return v;
}

export function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function slug(v: string, label = "Slug") {
  const s = slugify(v);
  if (!s) throw new ValidationError(`${label} must contain letters or numbers.`);
  return s;
}

/** Accept only site-relative paths or http(s) URLs for images and links. */
export function urlOrPath(v: string, label = "Link") {
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  throw new ValidationError(`${label} must start with / or https://`);
}

export type ActionResult = { ok: true; message?: string; id?: number | string } | { ok: false; error: string };

export function fail(err: unknown): ActionResult {
  const e = err as Error;
  if (e?.name === "ValidationError" || e?.name === "AuthError") {
    return { ok: false, error: e.message };
  }
  // Let Next.js redirects/notFound bubble up.
  const digest = (err as { digest?: unknown } | null)?.digest;
  if (typeof digest === "string" && digest.startsWith("NEXT_")) throw err;
  console.error("[admin action]", e);
  return { ok: false, error: "Something went wrong while saving. Nothing was changed." };
}
