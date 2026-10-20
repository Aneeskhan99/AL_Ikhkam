/*
 * npm run setup
 *
 * 1. Applies every db/NNN_*.sql migration that has not run yet (tracked in schema_migrations).
 * 2. Creates the first administrator if there are no users
 *    (ADMIN_USERNAME / ADMIN_PASSWORD from the environment, default admin / admin123).
 * 3. Imports the built-in programmes, faculty and articles the first time, so the admin starts
 *    with what the site already shows.
 *
 * Safe to run again: applied migrations and existing content are left alone.
 * Reads DATABASE_URL from .env.local (or the environment).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { articles, type Block } from "../lib/content/articles";
import { faculty } from "../lib/content/faculty";
import { programmes } from "../lib/content/programmes";
import { hashPassword } from "../lib/server/password";

function loadEnvFile() {
  const file = path.join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function blocksToHtml(blocks: Block[]) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `<h2>${esc(b.text)}</h2>`;
        case "ul":
          return `<ul>${b.items.map((i) => `<li><p>${esc(i)}</p></li>`).join("")}</ul>`;
        case "quote":
          return `<blockquote>${b.arabic ? `<p class="arabic" lang="ar">${esc(b.arabic)}</p>` : ""}<p>${esc(b.text)}</p>${b.cite ? `<p><cite>${esc(b.cite)}</cite></p>` : ""}</blockquote>`;
        default:
          return `<p>${esc(b.text)}</p>`;
      }
    })
    .join("\n");
}

async function main() {
  loadEnvFile();
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  // 1. Migrations
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const dir = path.join(process.cwd(), "db");
  const files = readdirSync(dir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
  const done = new Set((await db.query(`SELECT name FROM schema_migrations`)).rows.map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) continue;
    console.log(`Applying ${f}`);
    await db.query("BEGIN");
    try {
      await db.query(readFileSync(path.join(dir, f), "utf8"));
      await db.query(`INSERT INTO schema_migrations (name) VALUES ($1)`, [f]);
      await db.query("COMMIT");
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }
  }

  // 2. First administrator
  const { rows: users } = await db.query(`SELECT count(*)::int AS n FROM users`);
  let adminId: number | null = null;
  if (users[0].n === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const { rows } = await db.query(
      `INSERT INTO users (username, email, name, role, password_hash) VALUES ($1, $2, $3, 'admin', $4) RETURNING id`,
      [username, process.env.ADMIN_EMAIL || null, "Administrator", await hashPassword(password)],
    );
    adminId = rows[0].id;
    console.log(`Created administrator "${username}". Change the password after first sign-in.`);
  } else {
    adminId = (await db.query(`SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`)).rows[0]?.id ?? null;
    console.log("Users already exist; no administrator created.");
  }

  // 3. Built-in content, first run only
  const count = async (t: string) => (await db.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n as number;

  if ((await count("programmes")) === 0) {
    for (const [i, p] of programmes.entries()) {
      const { slug, kind, ...data } = p;
      await db.query(`INSERT INTO programmes (slug, kind, sort, data) VALUES ($1, $2, $3, $4)`, [slug, kind, (i + 1) * 10, JSON.stringify(data)]);
    }
    console.log(`Imported ${programmes.length} programmes.`);
  }

  if ((await count("faculty")) === 0) {
    for (const [i, f] of faculty.entries()) {
      const { slug, photo, ...data } = f;
      await db.query(`INSERT INTO faculty (slug, sort, photo, data) VALUES ($1, $2, $3, $4)`, [slug, (i + 1) * 10, photo || null, JSON.stringify(data)]);
    }
    console.log(`Imported ${faculty.length} faculty profiles.`);
  }

  if ((await count("posts")) === 0) {
    for (const a of articles) {
      const data = {
        title: a.title,
        excerpt: a.excerpt,
        topic: a.topic,
        imageAlt: a.imageAlt,
        body: { en: blocksToHtml(a.body.en), ur: blocksToHtml(a.body.ur) },
      };
      await db.query(
        `INSERT INTO posts (slug, status, publish_at, author_id, image, data) VALUES ($1, 'published', $2, $3, $4, $5)`,
        [a.slug, `${a.date}T09:00:00+05:00`, adminId, a.image, JSON.stringify(data)],
      );
    }
    console.log(`Imported ${articles.length} articles.`);
  }

  await db.end();
  console.log("Setup complete.");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
