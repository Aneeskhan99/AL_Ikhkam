"use server";

import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { q, tx } from "@/lib/server/db";
import { refreshPublic } from "@/lib/server/revalidate";
import { fail, ValidationError, type ActionResult } from "@/lib/server/validate";
import { defaultValue, fieldsFor, pageGroups, type FieldDef } from "@/lib/content-schema";

type Change = { key: string; locale: string; value?: unknown; reset?: boolean };

const MAX_TEXT = 6000;

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Check a submitted value against the field definition, so the public site never receives a broken shape. */
function clean(field: FieldDef, value: unknown): unknown {
  const text = (v: unknown, label = field.label) => {
    if (typeof v !== "string") throw new ValidationError(`${label} must be text.`);
    if (v.length > MAX_TEXT) throw new ValidationError(`${label} is too long.`);
    return v.replace(/\r\n/g, "\n");
  };
  switch (field.type) {
    case "text":
    case "textarea":
      return text(value);
    case "image": {
      const v = text(value).trim();
      if (!v) throw new ValidationError(`${field.label} cannot be empty. Use "Reset to default" instead.`);
      if (!(v.startsWith("/") && !v.startsWith("//")) && !/^https:\/\//.test(v)) throw new ValidationError(`${field.label} must be a /media/ or /images/ path or an https link.`);
      return v;
    }
    case "list": {
      if (!Array.isArray(value)) throw new ValidationError(`${field.label} must be a list.`);
      const items = value.map((v) => text(v).trim()).filter(Boolean);
      if (items.length > 50) throw new ValidationError(`${field.label} has too many items.`);
      return items;
    }
    case "items": {
      if (!Array.isArray(value)) throw new ValidationError(`${field.label} must be a list of cards.`);
      if (value.length > 40) throw new ValidationError(`${field.label} has too many cards.`);
      return value.map((item, i) => {
        if (!item || typeof item !== "object") throw new ValidationError(`${field.label}: card ${i + 1} is not valid.`);
        const out: Record<string, unknown> = {};
        for (const f of field.itemFields || []) {
          const v = (item as Record<string, unknown>)[f.name];
          if (f.type === "list") {
            out[f.name] = Array.isArray(v) ? v.map((x) => text(x, f.label).trim()).filter(Boolean) : [];
          } else {
            out[f.name] = text(v ?? "", f.label);
          }
        }
        return out;
      });
    }
  }
}

function groupOr404(id: string) {
  const group = pageGroups.find((g) => g.id === id);
  if (!group) throw new ValidationError("That page does not exist.");
  return group;
}

async function applyChanges(userId: number, groupId: string, changes: Change[]) {
  const group = groupOr404(groupId);
  const fields = new Map(fieldsFor(group).map((f) => [f.key, f]));
  let count = 0;
  await tx(async (query) => {
    for (const c of changes) {
      const field = fields.get(c.key);
      if (!field) throw new ValidationError(`Unknown field ${c.key}.`);
      const locale = field.shared ? "*" : c.locale;
      if (!["en", "ur", "*"].includes(locale) || (field.shared && c.locale !== "*" && c.locale !== "en")) throw new ValidationError("Unknown language.");
      const [row] = await query<{ published: unknown }>(`SELECT published FROM content_fields WHERE key = $1 AND locale = $2`, [c.key, locale]);
      if (c.reset) {
        if (row && row.published != null) {
          await query(`UPDATE content_fields SET draft = NULL, draft_reset = true, updated_by = $3, updated_at = now() WHERE key = $1 AND locale = $2`, [c.key, locale, userId]);
        } else if (row) {
          await query(`DELETE FROM content_fields WHERE key = $1 AND locale = $2`, [c.key, locale]);
        }
        count++;
        continue;
      }
      const value = clean(field, c.value);
      const live = row?.published ?? defaultValue(c.key, locale === "*" ? "*" : (locale as "en" | "ur"));
      if (same(value, live)) {
        // Back to what is live: no draft needed.
        if (row && row.published == null) await query(`DELETE FROM content_fields WHERE key = $1 AND locale = $2`, [c.key, locale]);
        else if (row) await query(`UPDATE content_fields SET draft = NULL, draft_reset = false, updated_by = $3, updated_at = now() WHERE key = $1 AND locale = $2`, [c.key, locale, userId]);
      } else {
        await query(
          `INSERT INTO content_fields (key, locale, draft, draft_reset, updated_by, updated_at)
           VALUES ($1, $2, $3, false, $4, now())
           ON CONFLICT (key, locale) DO UPDATE SET draft = EXCLUDED.draft, draft_reset = false, updated_by = EXCLUDED.updated_by, updated_at = now()`,
          [c.key, locale, JSON.stringify(value), userId],
        );
      }
      count++;
    }
  });
  return count;
}

function keysFilter(groupId: string) {
  const group = groupOr404(groupId);
  return fieldsFor(group).map((f) => f.key);
}

export async function savePageDraft(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("pages.edit", fd.get("csrf"));
    const groupId = String(fd.get("group") || "");
    const changes = JSON.parse(String(fd.get("changes") || "[]")) as Change[];
    const publish = fd.get("intent") === "publish";
    if (!Array.isArray(changes)) throw new ValidationError("Nothing to save.");
    const n = changes.length ? await applyChanges(user.id, groupId, changes) : 0;
    if (publish) {
      const published = await publishKeys(user.id, groupId);
      return { ok: true, message: published ? `Published ${published} change${published === 1 ? "" : "s"}. The live page is updated.` : "Nothing to publish." };
    }
    if (n) await audit(user.id, "save_draft", "page", groupId, `saved ${n} draft change${n === 1 ? "" : "s"} on ${groupOr404(groupId).label}`);
    return { ok: true, message: n ? "Draft saved. Use Preview to check it, then Publish." : "No changes to save." };
  } catch (err) {
    return fail(err);
  }
}

async function publishKeys(userId: number, groupId: string) {
  const group = groupOr404(groupId);
  const keys = keysFilter(groupId);
  const rows = await q<{ key: string; locale: string; published: unknown; draft: unknown; draft_reset: boolean }>(
    `SELECT key, locale, published, draft, draft_reset FROM content_fields WHERE key = ANY($1) AND (draft IS NOT NULL OR draft_reset)`,
    [keys],
  );
  if (!rows.length) return 0;
  await tx(async (query) => {
    for (const r of rows) {
      if (r.draft_reset) {
        await query(`INSERT INTO content_history (key, locale, action, old_value, new_value, user_id) VALUES ($1, $2, 'reset', $3, NULL, $4)`, [r.key, r.locale, JSON.stringify(r.published), userId]);
        await query(`DELETE FROM content_fields WHERE key = $1 AND locale = $2`, [r.key, r.locale]);
      } else {
        await query(`INSERT INTO content_history (key, locale, action, old_value, new_value, user_id) VALUES ($1, $2, 'publish', $3, $4, $5)`, [r.key, r.locale, JSON.stringify(r.published ?? defaultValue(r.key, r.locale as "en")), JSON.stringify(r.draft), userId]);
        await query(`UPDATE content_fields SET published = draft, draft = NULL, published_by = $3, published_at = now() WHERE key = $1 AND locale = $2`, [r.key, r.locale, userId]);
      }
    }
  });
  refreshPublic(group.paths);
  await audit(userId, "publish", "page", groupId, `published ${rows.length} change${rows.length === 1 ? "" : "s"} on ${group.label}`);
  return rows.length;
}

export async function discardPageDrafts(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("pages.edit", fd.get("csrf"));
    const groupId = String(fd.get("group") || "");
    const keys = keysFilter(groupId);
    await q(`DELETE FROM content_fields WHERE key = ANY($1) AND published IS NULL`, [keys]);
    await q(`UPDATE content_fields SET draft = NULL, draft_reset = false WHERE key = ANY($1)`, [keys]);
    await audit(user.id, "discard", "page", groupId, `discarded drafts on ${groupOr404(groupId).label}`);
    return { ok: true, message: "Drafts discarded. The editor shows the live text again." };
  } catch (err) {
    return fail(err);
  }
}

export async function resetPageToDefault(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("pages.edit", fd.get("csrf"));
    const groupId = String(fd.get("group") || "");
    const keys = keysFilter(groupId);
    await q(`DELETE FROM content_fields WHERE key = ANY($1) AND published IS NULL`, [keys]);
    await q(`UPDATE content_fields SET draft = NULL, draft_reset = true, updated_by = $2, updated_at = now() WHERE key = ANY($1)`, [keys, user.id]);
    await audit(user.id, "reset", "page", groupId, `marked every field on ${groupOr404(groupId).label} to return to default`);
    return { ok: true, message: "Every field will return to its original text when you publish." };
  } catch (err) {
    return fail(err);
  }
}
