"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, q } from "@/lib/server/db";
import { imagePath, listPairFrom, pairFrom } from "@/lib/server/forms";
import { refreshPublic } from "@/lib/server/revalidate";
import { bool, email, fail, int, oneOf, slug, str, ValidationError, type ActionResult } from "@/lib/server/validate";

// ---------- Programmes ----------

export async function saveProgramme(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("programmes.edit", fd.get("csrf"));
    const id = int(fd, "id", 0);
    const title = pairFrom(fd, "title", { max: 160, label: "Title", requiredEn: true });
    const data = {
      title,
      level: pairFrom(fd, "level", { max: 40, label: "Level", requiredEn: true }),
      duration: pairFrom(fd, "duration", { max: 60, label: "Duration", requiredEn: true }),
      format: pairFrom(fd, "format", { max: 120, label: "Format", requiredEn: true }),
      summary: pairFrom(fd, "summary", { max: 600, label: "Summary", requiredEn: true }),
      audience: pairFrom(fd, "audience", { max: 800, label: "Who it is for" }),
      modules: listPairFrom(fd, "modules", { maxItems: 30, label: "Modules" }),
    };
    const kind = oneOf(str(fd, "kind"), ["course", "workshop"] as const, "Type");
    const s = slug(str(fd, "slug") || title.en, "Address");
    const sort = int(fd, "sort", 100);
    const visible = bool(fd, "visible");
    const clash = await one(`SELECT 1 FROM programmes WHERE slug = $1 AND id <> $2`, [s, id]);
    if (clash) throw new ValidationError(`Another programme already uses /academy/${s}.`);
    let newId = id;
    if (id) {
      const row = await one(`UPDATE programmes SET slug = $1, kind = $2, sort = $3, visible = $4, data = $5, updated_at = now() WHERE id = $6 RETURNING id`, [s, kind, sort, visible, JSON.stringify(data), id]);
      if (!row) throw new ValidationError("That programme no longer exists.");
    } else {
      const row = await one<{ id: string }>(`INSERT INTO programmes (slug, kind, sort, visible, data) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [s, kind, sort, visible, JSON.stringify(data)]);
      newId = Number(row?.id);
    }
    refreshPublic(["/", "/academy", "/academy/*", "/contact"]);
    revalidatePath("/sitemap.xml");
    await audit(user.id, id ? "update" : "create", "programme", newId, `${id ? "updated" : "added"} programme "${title.en}"`);
    revalidatePath("/admin/programmes");
    return { ok: true, message: id ? "Programme saved. The website is updated." : "Programme added.", id: newId };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteProgramme(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("programmes.edit", fd.get("csrf"));
    const id = int(fd, "id");
    const row = await one<{ data: { title: { en: string } } }>(`DELETE FROM programmes WHERE id = $1 RETURNING data`, [id]);
    if (!row) throw new ValidationError("That programme was already deleted.");
    refreshPublic(["/", "/academy", "/academy/*", "/contact"]);
    await audit(user.id, "delete", "programme", id, `deleted programme "${row.data.title.en}"`);
    revalidatePath("/admin/programmes");
    redirect("/admin/programmes?deleted=1");
  } catch (err) {
    return fail(err);
  }
}

export async function reorderProgrammes(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("programmes.edit", fd.get("csrf"));
    const entries = [...fd.entries()].filter(([k]) => k.startsWith("sort_"));
    for (const [k, v] of entries) {
      const id = Number(k.slice(5));
      const n = parseInt(String(v), 10);
      if (Number.isFinite(id) && Number.isFinite(n)) await q(`UPDATE programmes SET sort = $1 WHERE id = $2`, [n, id]);
    }
    refreshPublic(["/", "/academy"]);
    await audit(user.id, "reorder", "programme", null, "changed the programme order");
    revalidatePath("/admin/programmes");
    return { ok: true, message: "Order saved." };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Faculty ----------

export async function saveFaculty(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("faculty.edit", fd.get("csrf"));
    const id = int(fd, "id", 0);
    const name = pairFrom(fd, "name", { max: 120, label: "Name", requiredEn: true });
    const linkLabels = listPairFrom(fd, "linkLabel");
    const linkHrefs = str(fd, "linkHrefs")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    const links = linkHrefs.map((href, i) => {
      if (!/^https?:\/\//.test(href)) throw new ValidationError("Profile links must start with https://");
      return { href: href.slice(0, 300), label: { en: linkLabels.en[i] || "Profile", ur: linkLabels.ur[i] || linkLabels.en[i] || "پروفائل" } };
    });
    const data = {
      name,
      initial: str(fd, "initial", { max: 2 }) || name.ur.slice(0, 1) || name.en.slice(0, 1),
      role: pairFrom(fd, "role", { max: 160, label: "Role", requiredEn: true }),
      affiliation: pairFrom(fd, "affiliation", { max: 240, label: "Affiliation" }),
      bio: pairFrom(fd, "bio", { max: 4000, label: "Biography" }),
      education: listPairFrom(fd, "education", { maxItems: 15, label: "Education" }),
      focus: listPairFrom(fd, "focus", { maxItems: 15, label: "Areas of work" }),
      email: email(str(fd, "email", { max: 200 })) || undefined,
      links,
    };
    const s = slug(str(fd, "slug") || name.en, "Address");
    const photo = imagePath(str(fd, "photo"), "Photo");
    const sort = int(fd, "sort", 100);
    const visible = bool(fd, "visible");
    const clash = await one(`SELECT 1 FROM faculty WHERE slug = $1 AND id <> $2`, [s, id]);
    if (clash) throw new ValidationError("Another profile already uses that address.");
    let newId = id;
    if (id) {
      const row = await one(`UPDATE faculty SET slug = $1, sort = $2, visible = $3, photo = $4, data = $5, updated_at = now() WHERE id = $6 RETURNING id`, [s, sort, visible, photo || null, JSON.stringify(data), id]);
      if (!row) throw new ValidationError("That profile no longer exists.");
    } else {
      const row = await one<{ id: string }>(`INSERT INTO faculty (slug, sort, visible, photo, data) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [s, sort, visible, photo || null, JSON.stringify(data)]);
      newId = Number(row?.id);
    }
    refreshPublic(["/", "/faculty"]);
    await audit(user.id, id ? "update" : "create", "faculty", newId, `${id ? "updated" : "added"} faculty profile "${name.en}"`);
    revalidatePath("/admin/faculty");
    return { ok: true, message: id ? "Profile saved. The website is updated." : "Profile added.", id: newId };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteFaculty(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("faculty.edit", fd.get("csrf"));
    const id = int(fd, "id");
    const row = await one<{ data: { name: { en: string } } }>(`DELETE FROM faculty WHERE id = $1 RETURNING data`, [id]);
    if (!row) throw new ValidationError("That profile was already deleted.");
    refreshPublic(["/", "/faculty"]);
    await audit(user.id, "delete", "faculty", id, `deleted faculty profile "${row.data.name.en}"`);
    revalidatePath("/admin/faculty");
    redirect("/admin/faculty?deleted=1");
  } catch (err) {
    return fail(err);
  }
}
