import Link from "next/link";
import { can, requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { createPost } from "../../actions/posts";
import { fmtDate, fmtDateTime, postStatusLabels } from "../../format";

export const metadata = { title: "Insights" };

export default async function InsightsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const user = await requirePage("posts.own");
  const sp = await searchParams;
  const params: unknown[] = [];
  const where: string[] = [];
  if (!can(user, "posts.all")) {
    params.push(user.id);
    where.push(`p.author_id = $${params.length}`);
  }
  if (sp.status === "draft") where.push(`p.status IN ('draft','review')`);
  else if (sp.status && ["review", "scheduled", "published"].includes(sp.status)) {
    params.push(sp.status);
    where.push(`p.status = $${params.length}`);
  }
  if (sp.q) {
    params.push(`%${sp.q.slice(0, 80).replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
    where.push(`(p.data->'title'->>'en' ILIKE $${params.length} OR p.data->'title'->>'ur' ILIKE $${params.length} OR p.slug ILIKE $${params.length})`);
  }
  const rows = await q<{ id: string; slug: string; status: string; publish_at: Date | null; updated_at: Date; data: { title: { en: string; ur: string }; topic: { en: string } }; author: string | null; autosave: boolean }>(
    `SELECT p.id, p.slug, p.status, p.publish_at, p.updated_at, p.data, u.name AS author, p.autosave IS NOT NULL AS autosave
       FROM posts p LEFT JOIN users u ON u.id = p.author_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY p.updated_at DESC LIMIT 200`,
    params,
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Insights</h1>
          <p>
            Articles in English and Urdu.{" "}
            {can(user, "posts.publish") ? "Drafts and scheduled articles are not visible on the site." : "Write a draft and send it for review; an editor publishes it."}
          </p>
        </div>
        <div className="actions">
          <form action={createPost}>
            <input type="hidden" name="csrf" value={user.csrf} />
            <button className="a-btn" type="submit">
              New article
            </button>
          </form>
        </div>
      </div>
      <section className="a-panel">
        <form className="a-filters" method="get">
          <div className="a-field grow">
            <label htmlFor="q">Search</label>
            <input id="q" name="q" type="search" defaultValue={sp.q || ""} placeholder="Title or slug" />
          </div>
          <div className="a-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={sp.status || ""}>
              <option value="">Any</option>
              <option value="draft">Drafts and in review</option>
              <option value="review">In review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
          <button className="a-btn secondary" type="submit">
            Filter
          </button>
        </form>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Publish date</th>
                <th>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="title-cell">
                    <Link href={`/admin/insights/${p.id}`}>{p.data.title.en || p.data.title.ur || "Untitled article"}</Link>
                    <span className="sub">
                      /insights/{p.slug}
                      {p.autosave ? ", has unsaved autosave" : ""}
                    </span>
                  </td>
                  <td>
                    <span className={`a-badge ${p.status}`}>{postStatusLabels[p.status]}</span>
                  </td>
                  <td>{p.author || "—"}</td>
                  <td className="a-small">{p.publish_at ? fmtDate(p.publish_at) : <span className="a-muted">Not set</span>}</td>
                  <td className="a-small a-muted">{fmtDateTime(p.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="a-empty">No articles found.</p>}
        </div>
      </section>
    </>
  );
}
