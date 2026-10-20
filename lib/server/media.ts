import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { q } from "./db";

/** Uploads live outside the code folder so a redeploy never deletes them. */
export function mediaDir() {
  return path.resolve(process.env.MEDIA_DIR || path.join(process.cwd(), "..", "al-ihkam-media"));
}

export function mediaUrl(file: string) {
  return `/media/${file}`;
}

/** Resolve a request path inside MEDIA_DIR, refusing anything that escapes it. */
export function resolveMediaPath(parts: string[]) {
  const root = mediaDir();
  const full = path.resolve(root, ...parts);
  if (!full.startsWith(root + path.sep)) return null;
  return full;
}

export const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export const MAX_UPLOAD = 15 * 1024 * 1024;

function baseName(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "file"
  );
}

export async function storeUpload(file: File) {
  if (!allowedTypes[file.type]) throw new Error(`"${file.name}" is not a supported type. Use JPG, PNG, WebP, AVIF, GIF or PDF.`);
  if (file.size > MAX_UPLOAD) throw new Error(`"${file.name}" is larger than 15 MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const stem = `${baseName(file.name)}-${randomBytes(3).toString("hex")}`;

  let output = input;
  let ext = allowedTypes[file.type];
  let mime = file.type;
  let width: number | null = null;
  let height: number | null = null;

  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    // Resize to a sensible maximum, apply camera rotation, strip metadata, re-encode efficiently.
    const img = sharp(input, { failOn: "error" }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
    const meta = await sharp(input).metadata();
    if (file.type === "image/png" && meta.hasAlpha) {
      output = await img.png({ compressionLevel: 9, palette: true }).toBuffer();
      ext = "png";
      mime = "image/png";
    } else {
      output = await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      ext = "jpg";
      mime = "image/jpeg";
    }
    const outMeta = await sharp(output).metadata();
    width = outMeta.width ?? null;
    height = outMeta.height ?? null;
  } else if (file.type === "image/gif") {
    const meta = await sharp(input).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  } else if (file.type === "application/pdf" && input.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error(`"${file.name}" is not a valid PDF.`);
  }

  const rel = `${folder}/${stem}.${ext}`;
  const full = path.join(mediaDir(), rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, output);
  return { file: rel, mime, width, height, bytes: output.length };
}

/** Places in the database that mention a media URL. */
export async function mediaUsage(url: string) {
  const like = `%${url.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await q<{ where: string; ref: string }>(
    `SELECT 'Page text' AS where, key AS ref FROM content_fields WHERE published::text LIKE $1 OR draft::text LIKE $1
     UNION ALL SELECT 'Article', slug FROM posts WHERE image = $2 OR data::text LIKE $1 OR seo::text LIKE $1 OR autosave::text LIKE $1
     UNION ALL SELECT 'Faculty', slug FROM faculty WHERE photo = $2 OR data::text LIKE $1
     UNION ALL SELECT 'Programme', slug FROM programmes WHERE data::text LIKE $1
     UNION ALL SELECT 'SEO', key FROM seo WHERE og_image = $2
     UNION ALL SELECT 'Settings', key FROM settings WHERE value::text LIKE $1`,
    [like, url],
  );
  return rows;
}

export async function deleteStored(file: string) {
  const full = resolveMediaPath(file.split("/"));
  if (full) await unlink(full).catch(() => {});
}
