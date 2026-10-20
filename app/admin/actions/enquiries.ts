"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, q } from "@/lib/server/db";
import { adminUrl, escapeHtml, sendMail } from "@/lib/server/mail";
import { fail, int, oneOf, str, ValidationError, type ActionResult } from "@/lib/server/validate";

const statuses = ["new", "contacted", "booked", "engaged", "closed"] as const;
const labels: Record<string, string> = { new: "New", contacted: "Contacted", booked: "Consultation booked", engaged: "Engaged", closed: "Closed" };

export async function updateEnquiry(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("enquiries.manage", fd.get("csrf"));
    const id = int(fd, "id");
    const status = oneOf(str(fd, "status"), statuses, "Status");
    const assignedRaw = str(fd, "assigned_to");
    const assigned = assignedRaw ? Number(assignedRaw) : null;
    const before = await one<{ status: string; assigned_to: string | null; name: string; interest: string | null; message: string | null }>(
      `SELECT status, assigned_to, name, interest, message FROM enquiries WHERE id = $1`,
      [id],
    );
    if (!before) throw new ValidationError("That enquiry no longer exists.");
    let assignee: { name: string; email: string | null } | null = null;
    if (assigned) {
      assignee = await one<{ name: string; email: string | null }>(`SELECT name, email FROM users WHERE id = $1 AND disabled = false AND role IN ('admin','editor')`, [assigned]);
      if (!assignee) throw new ValidationError("Choose an active administrator or editor to assign.");
    }
    await q(`UPDATE enquiries SET status = $1, assigned_to = $2, updated_at = now() WHERE id = $3`, [status, assigned, id]);

    const notes: string[] = [];
    if (before.status !== status) notes.push(`status ${labels[before.status]} to ${labels[status]}`);
    const assignChanged = String(before.assigned_to ?? "") !== String(assigned ?? "");
    if (assignChanged) notes.push(assignee ? `assigned to ${assignee.name}` : "unassigned");
    if (notes.length) {
      await q(`INSERT INTO enquiry_notes (enquiry_id, user_id, note) VALUES ($1, $2, $3)`, [id, user.id, `Changed ${notes.join(", ")}.`]);
      await audit(user.id, "update", "enquiry", id, `enquiry from ${before.name}: ${notes.join(", ")}`);
    }

    let mailNote = "";
    if (assignChanged && assignee?.email && assigned !== user.id) {
      const res = await sendMail({
        to: assignee.email,
        subject: `Enquiry assigned to you: ${before.name}`,
        html: `<p>${escapeHtml(user.name)} assigned you an enquiry from <b>${escapeHtml(before.name)}</b> (${escapeHtml(before.interest || "General")}).</p>
               ${before.message ? `<blockquote>${escapeHtml(before.message).replace(/\n/g, "<br>")}</blockquote>` : ""}
               <p><a href="${adminUrl(`/admin/enquiries/${id}`)}">Open the enquiry</a></p>`,
      });
      mailNote = res.sent ? ` ${assignee.name} has been emailed.` : " (Email is not set up yet, so no notification was sent.)";
    }
    revalidatePath(`/admin/enquiries/${id}`);
    revalidatePath("/admin/enquiries");
    return { ok: true, message: `Enquiry updated.${mailNote}` };
  } catch (err) {
    return fail(err);
  }
}

export async function addEnquiryNote(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("enquiries.manage", fd.get("csrf"));
    const id = int(fd, "id");
    const note = str(fd, "note", { required: true, max: 4000, label: "Note" });
    const exists = await one(`SELECT 1 FROM enquiries WHERE id = $1`, [id]);
    if (!exists) throw new ValidationError("That enquiry no longer exists.");
    await q(`INSERT INTO enquiry_notes (enquiry_id, user_id, note) VALUES ($1, $2, $3)`, [id, user.id, note]);
    await q(`UPDATE enquiries SET updated_at = now() WHERE id = $1`, [id]);
    revalidatePath(`/admin/enquiries/${id}`);
    return { ok: true, message: "Note added." };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteEnquiry(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("enquiries.manage", fd.get("csrf"));
    const id = int(fd, "id");
    const row = await one<{ name: string }>(`DELETE FROM enquiries WHERE id = $1 RETURNING name`, [id]);
    if (!row) throw new ValidationError("That enquiry was already deleted.");
    await audit(user.id, "delete", "enquiry", id, `deleted the enquiry from ${row.name}`);
    revalidatePath("/admin/enquiries");
    redirect("/admin/enquiries?deleted=1");
  } catch (err) {
    return fail(err);
  }
}
