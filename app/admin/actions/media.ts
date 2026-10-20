"use server";

import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, q } from "@/lib/server/db";
import { deleteStored, mediaUrl, mediaUsage, storeUpload } from "@/lib/server/media";
import { fail, int, str, ValidationError, type ActionResult } from "@/lib/server/validate";

export type MediaItem = { id: number; url: string; name: string; alt: string; mime: string; width: number | null; height: number | null; bytes: number; created: string };

type Row = { id: string; file: string; original_name: string | null; alt: string; mime: string; width: number | null; height: number | null; bytes: number; created_at: Date };

function toItem(r: Row): MediaItem {
  return {
    id: Number(r.id),
    url: mediaUrl(r.file),
    name: r.original_name || r.file.split("/").pop() || r.file,
    alt: r.alt,
    mime: r.mime,
    width: r.width,
    height: r.height,
    bytes: r.bytes,
    created: r.created_at.toISOString(),
  };
}

/** Used by the media picker. */
export async function listMedia(search: string, onlyImages = true): Promise<MediaItem[]> {
  await requireAction("media.upload");
  const s = `%${(search || "").slice(0, 80).replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await q<Row>(
    `SELECT id, file, original_name, alt, mime, width, height, bytes, created_at FROM media
      WHERE ($1 = '%%' OR original_name ILIKE $1 OR alt ILIKE $1 OR file ILIKE $1)
        AND ($2 = false OR mime LIKE 'image/%')
      ORDER BY created_at DESC LIMIT 120`,
    [s, onlyImages],
  );
  return rows.map(toItem);
}

export async function uploadMedia(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("media.upload", fd.get("csrf"));
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) throw new ValidationError("Choose at least one file to upload.");
    if (files.length > 20) throw new ValidationError("Upload up to 20 files at a time.");
    const alt = str(fd, "alt", { max: 300 });
    let lastId = 0;
    for (const file of files) {
      let stored;
      try {
        stored = await storeUpload(file);
      } catch (e) {
        throw new ValidationError((e as Error).message);
      }
      const row = await one<{ id: string }>(
        `INSERT INTO media (file, original_name, mime, width, height, bytes, alt, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [stored.file, file.name.slice(0, 200), stored.mime, stored.width, stored.height, stored.bytes, alt, user.id],
      );
      lastId = Number(row?.id);
    }
    await audit(user.id, "upload", "media", lastId, `uploaded ${files.length} file${files.length === 1 ? "" : "s"}`);
    revalidatePath("/admin/media");
    return { ok: true, message: `Uploaded ${files.length} file${files.length === 1 ? "" : "s"}.`, id: lastId };
  } catch (err) {
    return fail(err);
  }
}

export async function updateMediaAlt(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await requireAction("media.upload", fd.get("csrf"));
    const id = int(fd, "id");
    const alt = str(fd, "alt", { max: 300, label: "Alt text" });
    await q(`UPDATE media SET alt = $1 WHERE id = $2`, [alt, id]);
    revalidatePath("/admin/media");
    return { ok: true, message: "Alt text saved." };
  } catch (err) {
    return fail(err);
  }
}

export async function mediaUsageFor(id: number) {
  await requireAction("media.upload");
  const row = await one<{ file: string }>(`SELECT file FROM media WHERE id = $1`, [id]);
  if (!row) return [];
  return mediaUsage(mediaUrl(row.file));
}

export async function deleteMedia(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("media.delete", fd.get("csrf"));
    const id = int(fd, "id");
    const row = await one<{ file: string; original_name: string | null }>(`SELECT file, original_name FROM media WHERE id = $1`, [id]);
    if (!row) throw new ValidationError("That file was already deleted.");
    const used = await mediaUsage(mediaUrl(row.file));
    if (used.length) {
      throw new ValidationError(`This file is still used in: ${used.slice(0, 4).map((u) => `${u.where} (${u.ref})`).join(", ")}. Replace it there first.`);
    }
    await q(`DELETE FROM media WHERE id = $1`, [id]);
    await deleteStored(row.file);
    await audit(user.id, "delete", "media", id, `deleted ${row.original_name || row.file}`);
    revalidatePath("/admin/media");
    return { ok: true, message: "File deleted." };
  } catch (err) {
    return fail(err);
  }
}
