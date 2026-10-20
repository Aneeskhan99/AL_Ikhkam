"use server";

import { redirect } from "next/navigation";
import { attemptLogin, currentUser, endSessionsForUser, logout, requireAction } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { dbConfigured, one, q } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { fail, str, ValidationError, type ActionResult } from "@/lib/server/validate";

export async function loginAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!dbConfigured()) return { ok: false, error: "The database is not configured on this server. Set DATABASE_URL in .env.local and run npm run setup." };
  const username = str(fd, "username").slice(0, 120);
  const password = String(fd.get("password") || "");
  if (!username || !password) return { ok: false, error: "Enter your username and password." };
  let result;
  try {
    result = await attemptLogin(username, password);
  } catch (err) {
    console.error("[login]", (err as Error).message);
    return { ok: false, error: "Could not reach the database. Try again in a moment." };
  }
  if (!result.ok) return { ok: false, error: result.error };
  await audit(result.userId, "login", "user", result.userId);
  const next = String(fd.get("next") || "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  const user = await currentUser();
  if (user) await audit(user.id, "logout", "user", user.id);
  await logout();
  redirect("/admin/login");
}

export async function changeOwnPassword(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("dashboard.view", fd.get("csrf"));
    const current = String(fd.get("current") || "");
    const next = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (next.length < 8) throw new ValidationError("The new password must be at least 8 characters.");
    if (next !== confirm) throw new ValidationError("The two new passwords do not match.");
    const row = await one<{ password_hash: string }>(`SELECT password_hash FROM users WHERE id = $1`, [user.id]);
    if (!row || !(await verifyPassword(current, row.password_hash))) throw new ValidationError("Your current password is not right.");
    await q(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [await hashPassword(next), user.id]);
    await endSessionsForUser(user.id, true);
    await audit(user.id, "change_password", "user", user.id);
    return { ok: true, message: "Password changed. Other devices have been signed out." };
  } catch (err) {
    return fail(err);
  }
}

export async function updateOwnProfile(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const user = await requireAction("dashboard.view", fd.get("csrf"));
    const name = str(fd, "name", { required: true, max: 120, label: "Name" });
    const email = str(fd, "email", { max: 200 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("Email is not a valid address.");
    await q(`UPDATE users SET name = $1, email = $2, updated_at = now() WHERE id = $3`, [name, email || null, user.id]);
    return { ok: true, message: "Profile saved." };
  } catch (err) {
    return fail(err);
  }
}
