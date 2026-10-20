"use server";

import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, tx } from "@/lib/server/db";
import { imagePath } from "@/lib/server/forms";
import { refreshPublic } from "@/lib/server/revalidate";
import { bool, fail, str, urlOrPath, ValidationError, type ActionResult } from "@/lib/server/validate";
import { fixedSeoPages } from "../seo-pages";

/** Turn an SEO key into the public path it controls. */
async function pathForKey(key: string) {
  const fixed = fixedSeoPages.find((p) => p.key === key);
  if (fixed) return fixed.path;
  const m = /^programme:([a-z0-9-]+)$/.exec(key);
  if (m && (await one(`SELECT 1 FROM programmes WHERE slug = $1`, [m[1]]))) return `/academy/${m[1]}`;
  throw new ValidationError("That page is not recognised.");
}

export async function saveSeo(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("seo.edit", fd.get("csrf"));
    const key = str(fd, "key", { required: true, max: 120 });
    const path = await pathForKey(key);
    const ogImage = imagePath(str(fd, "ogImage", { max: 500 }), "Share image");
    const noindex = bool(fd, "noindex");
    const rows = (["en", "ur"] as const).map((l) => {
      const lang = l === "en" ? "English" : "Urdu";
      return {
        locale: l,
        title: str(fd, `title.${l}`, { max: 120, label: `Title (${lang})` }),
        description: str(fd, `description.${l}`, { max: 320, label: `Description (${lang})` }),
        canonical: urlOrPath(str(fd, `canonical.${l}`, { max: 500 }), `Canonical link (${lang})`),
      };
    });
    await tx(async (query) => {
      for (const r of rows) {
        const empty = !r.title && !r.description && !r.canonical && !ogImage && !noindex;
        if (empty) {
          await query(`DELETE FROM seo WHERE key = $1 AND locale = $2`, [key, r.locale]);
        } else {
          await query(
            `INSERT INTO seo (key, locale, title, description, og_image, noindex, canonical, updated_by, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
             ON CONFLICT (key, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
               og_image = EXCLUDED.og_image, noindex = EXCLUDED.noindex, canonical = EXCLUDED.canonical,
               updated_by = EXCLUDED.updated_by, updated_at = now()`,
            [key, r.locale, r.title || null, r.description || null, ogImage || null, noindex, r.canonical || null, user.id],
          );
        }
      }
    });
    // The home page's tags live in the shared layout, so refresh every page for it.
    refreshPublic(key === "home" ? ["*"] : [path]);
    revalidatePath("/sitemap.xml");
    await audit(user.id, "update", "seo", key, `updated search settings for ${path === "/" ? "the home page" : path}`);
    revalidatePath("/admin/seo");
    return { ok: true, message: "Saved. Search engines see the new tags on their next visit." };
  } catch (err) {
    return fail(err);
  }
}
