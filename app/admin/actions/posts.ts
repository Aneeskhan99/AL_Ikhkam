"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { can, requireAction, type SessionUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, q } from "@/lib/server/db";
import { refreshPublic } from "@/lib/server/revalidate";
import { cleanArticleHtml } from "@/lib/server/sanitize";
import { fail, int, slugify, ValidationError, type ActionResult } from "@/lib/server/validate";
import { fromLocalInput } from "../format";

type L = { en: string; ur: string };
export type PostPayload = {
  title: L;
  excerpt: L;
  topic: L;
  body: L;
  imageAlt: L;
  slug: string;
  image: string;
  tags: string;
  publishAt: string; // datetime-local in Pakistan time
  seo: { title: L; description: L; ogImage: string; noindex: boolean; canonical: string };
};

type PostRow = { id: string; slug: string; status: string; author_id: string | null; data: unknown; publish_at: Date | null };

async function loadForEdit(user: SessionUser, id: number) {
  const post = await one<PostRow>(`SELECT id, slug, status, author_id, data, publish_at FROM posts WHERE id = $1`, [id]);
  if (!post) throw new ValidationError("That article no longer exists.");
  if (!can(user, "posts.all") && Number(post.author_id) !== user.id) throw new ValidationError("You can only edit your own articles.");
  return post;
}

function text(v: unknown, max: number, label: string) {
  if (typeof v !== "string") return "";
  const s = v.replace(/\r\n/g, "\n").trim();
  if (s.length > max) throw new ValidationError(`${label} is too long (${max} characters at most).`);
  return s;
}

function pair(v: unknown, max: number, label: string): L {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { en: text(o.en, max, `${label} (English)`), ur: text(o.ur, max, `${label} (Urdu)`) };
}

function cleanPayload(raw: unknown) {
  const p = (raw && typeof raw === "object" ? raw : {}) as Partial<PostPayload>;
  const body = pair(p.body, 200_000, "Body");
  const seoRaw = (p.seo || {}) as Partial<PostPayload["seo"]>;
  const image = text(p.image, 500, "Featured image");
  if (image && !/^(\/(?!\/)|https:\/\/)/.test(image)) throw new ValidationError("The featured image must be a /media/ path or an https link.");
  const og = text(seoRaw.ogImage, 500, "Share image");
  if (og && !/^(\/(?!\/)|https:\/\/)/.test(og)) throw new ValidationError("The share image must be a /media/ path or an https link.");
  const canonical = text(seoRaw.canonical, 500, "Canonical link");
  if (canonical && !/^(\/(?!\/)|https?:\/\/)/.test(canonical)) throw new ValidationError("The canonical link must start with / or https://");
  return {
    data: {
      title: pair(p.title, 200, "Title"),
      excerpt: pair(p.excerpt, 400, "Summary"),
      topic: pair(p.topic, 60, "Topic"),
      imageAlt: pair(p.imageAlt, 200, "Image description"),
      body: { en: cleanArticleHtml(body.en), ur: cleanArticleHtml(body.ur) },
    },
    slug: slugify(text(p.slug, 120, "Slug")),
    image,
    tags: text(p.tags, 400, "Tags")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 15),
    publishAt: fromLocalInput(text(p.publishAt, 20, "Publish date")),
    seo: {
      title: pair(seoRaw.title, 120, "SEO title"),
      description: pair(seoRaw.description, 300, "SEO description"),
      ogImage: og,
      noindex: Boolean(seoRaw.noindex),
      canonical,
    },
  };
}

export async function createPost(fd: FormData) {
  const user = await requireAction("posts.own", fd.get("csrf"));
  const slug = `untitled-${randomBytes(3).toString("hex")}`;
  const empty = { en: "", ur: "" };
  const row = await one<{ id: string }>(
    `INSERT INTO posts (slug, status, author_id, data) VALUES ($1, 'draft', $2, $3) RETURNING id`,
    [slug, user.id, JSON.stringify({ title: empty, excerpt: empty, topic: { en: "Islamic finance", ur: "اسلامی مالیات" }, imageAlt: empty, body: empty })],
  );
  await audit(user.id, "create", "post", row?.id, "started a new article");
  redirect(`/admin/insights/${row?.id}`);
}

/** Saves the editor contents without touching what is live. */
export async function autosavePost(id: number, csrf: string, payload: unknown): Promise<{ ok: boolean; at?: string; error?: string }> {
  try {
    const user = await requireAction("posts.own", csrf);
    await loadForEdit(user, id);
    const c = cleanPayload(payload);
    await q(`UPDATE posts SET autosave = $1, autosaved_at = now() WHERE id = $2`, [JSON.stringify(c.data), id]);
    return { ok: true, at: new Date().toISOString() };
  } catch (err) {
    const r = fail(err);
    return { ok: false, error: r.ok ? undefined : r.error };
  }
}

const intents = ["draft", "review", "publish", "unpublish"] as const;

export async function savePost(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("posts.own", fd.get("csrf"));
    const id = int(fd, "id");
    const intent = String(fd.get("intent") || "draft") as (typeof intents)[number];
    if (!intents.includes(intent)) throw new ValidationError("Unknown action.");
    const post = await loadForEdit(user, id);
    const canPublish = can(user, "posts.publish");
    if (!canPublish && (intent === "publish" || intent === "unpublish")) throw new ValidationError("Your role cannot publish. Send the article for review instead.");
    if (!canPublish && (post.status === "published" || post.status === "scheduled")) throw new ValidationError("This article is live. Ask an editor to change it.");

    const c = cleanPayload(JSON.parse(String(fd.get("payload") || "{}")));
    if (!c.data.title.en && !c.data.title.ur) throw new ValidationError("Give the article a title.");
    const slug = c.slug || slugify(c.data.title.en) || post.slug;
    if (!slug) throw new ValidationError("The slug needs letters or numbers.");
    const clash = await one(`SELECT 1 FROM posts WHERE slug = $1 AND id <> $2`, [slug, id]);
    if (clash) throw new ValidationError(`Another article already uses the address /insights/${slug}. Change the slug.`);

    let status = post.status;
    let publishAt: Date | null = c.publishAt ?? post.publish_at;
    if (intent === "publish") {
      if (!c.data.title.en || !c.data.body.en) throw new ValidationError("Add at least an English title and body before publishing.");
      publishAt = publishAt ?? new Date();
      status = publishAt.getTime() > Date.now() + 60_000 ? "scheduled" : "published";
    } else if (intent === "unpublish") {
      status = "draft";
    } else if (intent === "review") {
      status = "review";
    } else if (post.status !== "published" && post.status !== "scheduled") {
      status = "draft";
    }

    await q(
      `UPDATE posts SET slug = $1, status = $2, publish_at = $3, image = $4, tags = $5, data = $6, seo = $7,
              autosave = NULL, autosaved_at = NULL, updated_at = now() WHERE id = $8`,
      [slug, status, publishAt, c.image || null, c.tags, JSON.stringify(c.data), JSON.stringify(c.seo), id],
    );

    const wasLive = post.status === "published" || post.status === "scheduled";
    const isLive = status === "published" || status === "scheduled";
    if (wasLive || isLive) {
      refreshPublic(["/", "/insights", "/insights/*"]);
      revalidatePath("/sitemap.xml");
    }
    const title = c.data.title.en || c.data.title.ur;
    const messages: Record<string, string> = {
      draft: isLive ? "Changes are live." : "Draft saved.",
      review: "Sent for review. An editor can now publish it.",
      publish: status === "scheduled" ? "Scheduled. It will appear on the site at the publish time." : "Published. The article is live.",
      unpublish: "Unpublished. The article is no longer on the site.",
    };
    await audit(user.id, intent === "draft" ? "update" : intent, "post", id, `${intent === "draft" ? "saved" : intent === "review" ? "sent for review" : intent + "ed"} "${title}"`);
    revalidatePath(`/admin/insights/${id}`);
    revalidatePath("/admin/insights");
    return { ok: true, message: messages[intent], id: slug };
  } catch (err) {
    return fail(err);
  }
}

export async function discardAutosave(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("posts.own", fd.get("csrf"));
    const id = int(fd, "id");
    await loadForEdit(user, id);
    await q(`UPDATE posts SET autosave = NULL, autosaved_at = NULL WHERE id = $1`, [id]);
    revalidatePath(`/admin/insights/${id}`);
    return { ok: true, message: "Autosaved changes discarded." };
  } catch (err) {
    return fail(err);
  }
}

export async function deletePost(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("posts.own", fd.get("csrf"));
    const id = int(fd, "id");
    const post = await loadForEdit(user, id);
    if (!can(user, "posts.publish") && post.status !== "draft" && post.status !== "review") throw new ValidationError("Ask an editor to delete a live article.");
    await q(`DELETE FROM posts WHERE id = $1`, [id]);
    if (post.status === "published" || post.status === "scheduled") refreshPublic(["/", "/insights", "/insights/*"]);
    const d = post.data as { title?: { en?: string } };
    await audit(user.id, "delete", "post", id, `deleted "${d.title?.en || post.slug}"`);
    revalidatePath("/admin/insights");
    redirect("/admin/insights?deleted=1");
  } catch (err) {
    return fail(err);
  }
}
