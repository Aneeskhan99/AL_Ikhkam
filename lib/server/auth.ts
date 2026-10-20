import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { one, q } from "./db";
import { verifyPassword } from "./password";

export type Role = "admin" | "editor" | "author";
export type SessionUser = {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: Role;
  csrf: string;
};

export const SESSION_COOKIE = "aih_session";
const SESSION_DAYS = 7;

export const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  editor: "Editor",
  author: "Author",
};

/** What each role may do. Authors only touch their own posts and cannot publish. */
const permissions = {
  "dashboard.view": ["admin", "editor", "author"],
  "enquiries.manage": ["admin", "editor"],
  "pages.edit": ["admin", "editor"],
  "posts.own": ["admin", "editor", "author"],
  "posts.all": ["admin", "editor"],
  "posts.publish": ["admin", "editor"],
  "programmes.edit": ["admin", "editor"],
  "faculty.edit": ["admin", "editor"],
  "media.upload": ["admin", "editor", "author"],
  "media.delete": ["admin", "editor"],
  "seo.edit": ["admin", "editor"],
  "settings.edit": ["admin"],
  "users.manage": ["admin"],
  "activity.view": ["admin", "editor"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissions;

export function can(user: Pick<SessionUser, "role"> | null | undefined, perm: Permission) {
  return Boolean(user && (permissions[perm] as readonly Role[]).includes(user.role));
}

function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

async function isHttps() {
  const h = await headers();
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return (h.get("x-forwarded-proto") || "").split(",")[0].trim() === "https";
}

/** The signed-in user for this request, or null. Cached per request. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32) return null;
  const row = await one<{
    id: string;
    username: string;
    name: string;
    email: string | null;
    role: Role;
    csrf_token: string;
    disabled: boolean;
    last_seen_at: Date;
  }>(
    `SELECT u.id, u.username, u.name, u.email, u.role, u.disabled, s.csrf_token, s.last_seen_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  ).catch(() => null);
  if (!row || row.disabled) return null;
  // Touch at most once every 10 minutes.
  if (Date.now() - new Date(row.last_seen_at).getTime() > 10 * 60 * 1000) {
    await q(`UPDATE sessions SET last_seen_at = now(), expires_at = now() + interval '${SESSION_DAYS} days' WHERE token_hash = $1`, [sha256(token)]).catch(() => {});
  }
  return { id: Number(row.id), username: row.username, name: row.name, email: row.email, role: row.role, csrf: row.csrf_token };
});

/** Use at the top of every admin page. Redirects to login when signed out or not allowed. */
export async function requirePage(perm: Permission = "dashboard.view") {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, perm)) redirect("/admin?denied=1");
  return user;
}

export class AuthError extends Error {
  override name = "AuthError";
}

/**
 * Use at the top of every server action and admin API route.
 * Checks the session, the role and (for form posts) the CSRF token.
 */
export async function requireAction(perm: Permission, csrf?: FormDataEntryValue | string | null) {
  const user = await currentUser();
  if (!user) throw new AuthError("Your session has ended. Sign in again.");
  if (!can(user, perm)) throw new AuthError("Your role does not allow this action.");
  if (csrf !== undefined) {
    const given = typeof csrf === "string" ? csrf : "";
    const a = Buffer.from(given);
    const b = Buffer.from(user.csrf);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new AuthError("The form expired. Reload the page and try again.");
  }
  return user;
}

// ---------- Login and logout ----------

const WINDOW_MIN = 15;
const MAX_PER_USER_IP = 5;
const MAX_PER_IP = 20;

export async function loginRateLimited(username: string, ip: string) {
  const [row] = await q<{ by_user: string; by_ip: string }>(
    `SELECT count(*) FILTER (WHERE lower(username) = lower($1)) AS by_user, count(*) AS by_ip
       FROM login_attempts
      WHERE ip = $2 AND success = false AND created_at > now() - interval '${WINDOW_MIN} minutes'`,
    [username, ip],
  );
  return Number(row.by_user) >= MAX_PER_USER_IP || Number(row.by_ip) >= MAX_PER_IP;
}

export async function attemptLogin(username: string, password: string) {
  const ip = await clientIp();
  if (await loginRateLimited(username, ip)) {
    return { ok: false as const, error: `Too many failed attempts. Wait ${WINDOW_MIN} minutes and try again.` };
  }
  const user = await one<{ id: string; password_hash: string; disabled: boolean }>(
    `SELECT id, password_hash, disabled FROM users WHERE lower(username) = lower($1) OR lower(email) = lower($1) LIMIT 1`,
    [username],
  );
  // Compare against a dummy hash when the user does not exist, so timing does not reveal it.
  const valid = user
    ? await verifyPassword(password, user.password_hash)
    : await verifyPassword(password, "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==").then(() => false);
  await q(`INSERT INTO login_attempts (username, ip, success) VALUES ($1, $2, $3)`, [username, ip, Boolean(valid && user && !user.disabled)]);
  if (!user || !valid) return { ok: false as const, error: "That username or password is not right." };
  if (user.disabled) return { ok: false as const, error: "This account is disabled. Ask an administrator." };

  const token = randomBytes(32).toString("base64url");
  const csrf = randomBytes(24).toString("base64url");
  const h = await headers();
  await q(
    `INSERT INTO sessions (token_hash, user_id, csrf_token, ip, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + interval '${SESSION_DAYS} days')`,
    [sha256(token), user.id, csrf, ip, (h.get("user-agent") || "").slice(0, 300)],
  );
  await q(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);
  await q(`DELETE FROM login_attempts WHERE created_at < now() - interval '30 days'`);
  await q(`DELETE FROM sessions WHERE expires_at < now()`);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return { ok: true as const, userId: Number(user.id) };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await q(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(token)]).catch(() => {});
  jar.delete(SESSION_COOKIE);
}

export async function endSessionsForUser(userId: number, exceptCurrent = false) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (exceptCurrent && token) {
    await q(`DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2`, [userId, sha256(token)]);
  } else {
    await q(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  }
}

export { isHttps };
