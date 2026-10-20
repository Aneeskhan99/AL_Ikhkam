"use server";

import { revalidatePath } from "next/cache";
import { endSessionsForUser, requireAction, type Role } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { one, q } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { bool, email, fail, int, oneOf, str, ValidationError, type ActionResult } from "@/lib/server/validate";

const roles = ["admin", "editor", "author"] as const;

function password(fd: FormData, name = "password") {
  const v = String(fd.get(name) || "");
  if (v.length < 8) throw new ValidationError("Passwords must be at least 8 characters.");
  if (v.length > 200) throw new ValidationError("That password is too long.");
  return v;
}

async function activeAdmins(excludeId?: number) {
  const row = await one<{ n: string }>(`SELECT count(*) AS n FROM users WHERE role = 'admin' AND disabled = false AND ($1::bigint IS NULL OR id <> $1)`, [excludeId ?? null]);
  return Number(row?.n || 0);
}

export async function createUser(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const me = await requireAction("users.manage", fd.get("csrf"));
    const username = str(fd, "username", { required: true, max: 60, label: "Username" }).toLowerCase();
    if (!/^[a-z0-9._-]{3,60}$/.test(username)) throw new ValidationError("Usernames use 3 to 60 letters, numbers, dots, dashes or underscores.");
    const name = str(fd, "name", { required: true, max: 120, label: "Name" });
    const mail = email(str(fd, "email", { max: 200 }));
    const role = oneOf(str(fd, "role"), roles, "Role");
    const pw = password(fd);
    const exists = await one(`SELECT 1 FROM users WHERE lower(username) = $1 OR ($2 <> '' AND lower(email) = lower($2))`, [username, mail]);
    if (exists) throw new ValidationError("A user with that username or email already exists.");
    const row = await one<{ id: string }>(
      `INSERT INTO users (username, email, name, role, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [username, mail || null, name, role, await hashPassword(pw)],
    );
    await audit(me.id, "create", "user", row?.id, `added user ${username} (${role})`);
    revalidatePath("/admin/users");
    return { ok: true, message: `${name} can now sign in as ${username}.`, id: Number(row?.id) };
  } catch (err) {
    return fail(err);
  }
}

export async function updateUser(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const me = await requireAction("users.manage", fd.get("csrf"));
    const id = int(fd, "id");
    const name = str(fd, "name", { required: true, max: 120, label: "Name" });
    const mail = email(str(fd, "email", { max: 200 }));
    const role = oneOf(str(fd, "role"), roles, "Role") as Role;
    const disabled = bool(fd, "disabled");
    const current = await one<{ role: Role; disabled: boolean; username: string }>(`SELECT role, disabled, username FROM users WHERE id = $1`, [id]);
    if (!current) throw new ValidationError("That user no longer exists.");
    if (id === me.id && (disabled || role !== "admin")) throw new ValidationError("You cannot disable yourself or remove your own administrator role.");
    if (current.role === "admin" && (role !== "admin" || disabled) && (await activeAdmins(id)) === 0) {
      throw new ValidationError("There must always be at least one active administrator.");
    }
    if (mail) {
      const clash = await one(`SELECT 1 FROM users WHERE lower(email) = lower($1) AND id <> $2`, [mail, id]);
      if (clash) throw new ValidationError("Another user already has that email.");
    }
    await q(`UPDATE users SET name = $1, email = $2, role = $3, disabled = $4, updated_at = now() WHERE id = $5`, [name, mail || null, role, disabled, id]);
    if (disabled && !current.disabled) await endSessionsForUser(id);
    await audit(me.id, "update", "user", id, `updated user ${current.username}${disabled ? " (disabled)" : ""}`);
    revalidatePath("/admin/users");
    return { ok: true, message: "User saved." };
  } catch (err) {
    return fail(err);
  }
}

export async function resetPassword(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const me = await requireAction("users.manage", fd.get("csrf"));
    const id = int(fd, "id");
    const pw = password(fd);
    const u = await one<{ username: string }>(`SELECT username FROM users WHERE id = $1`, [id]);
    if (!u) throw new ValidationError("That user no longer exists.");
    await q(`UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, [await hashPassword(pw), id]);
    if (id !== me.id) await endSessionsForUser(id);
    await audit(me.id, "reset_password", "user", id, `reset the password for ${u.username}`);
    return { ok: true, message: `Password reset for ${u.username}. Share it with them privately.` };
  } catch (err) {
    return fail(err);
  }
}
