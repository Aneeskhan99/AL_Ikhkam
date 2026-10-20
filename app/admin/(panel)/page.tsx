import Link from "next/link";
import { can, requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { groupForKey } from "@/lib/content-schema";
import { createPost } from "../actions/posts";
import { fmtDateTime, statusLabels } from "../format";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requirePage("dashboard.view");
  const { denied } = await searchParams;
  const seeEnquiries = can(user, "enquiries.manage");
  const seePages = can(user, "pages.edit");

  const [counts] = await q<{
    new_enq: string;
    open_enq: string;
    week_enq: string;
    published: string;
    drafts: string;
    pending_pages: string;
  }>(
    `SELECT
       (SELECT count(*) FROM enquiries WHERE status = 'new') AS new_enq,
       (SELECT count(*) FROM enquiries WHERE status IN ('contacted','booked')) AS open_enq,
       (SELECT count(*) FROM enquiries WHERE created_at > now() - interval '7 days') AS week_enq,
       (SELECT count(*) FROM posts WHERE status IN ('published','scheduled')) AS published,
       (SELECT count(*) FROM posts WHERE status IN ('draft','review') ${can(user, "posts.all") ? "" : "AND author_id = $1"}) AS drafts,
       (SELECT count(DISTINCT split_part(key, '.', 1)) FROM content_fields WHERE draft IS NOT NULL OR draft_reset) AS pending_pages`,
    can(user, "posts.all") ? [] : [user.id],
  );

  const enquiries = seeEnquiries
    ? await q<{ id: string; name: string; interest: string | null; status: string; created_at: Date }>(
        `SELECT id, name, interest, status, created_at FROM enquiries ORDER BY created_at DESC LIMIT 6`,
      )
    : [];
  const posts = await q<{ id: string; slug: string; status: string; data: { title: { en: string } }; updated_at: Date }>(
    `SELECT id, slug, status, data, updated_at FROM posts ${can(user, "posts.all") ? "" : "WHERE author_id = $1"} ORDER BY updated_at DESC LIMIT 5`,
    can(user, "posts.all") ? [] : [user.id],
  );
  const edits = seePages
    ? await q<{ key: string; updated_at: Date; name: string | null; draft: boolean }>(
        `SELECT DISTINCT ON (split_part(c.key, '.', 1)) c.key, c.updated_at, u.name, (c.draft IS NOT NULL OR c.draft_reset) AS draft
           FROM content_fields c LEFT JOIN users u ON u.id = c.updated_by
          ORDER BY split_part(c.key, '.', 1), c.updated_at DESC`,
      )
    : [];
  edits.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  const activity = can(user, "activity.view")
    ? await q<{ action: string; entity: string; summary: string | null; created_at: Date; name: string | null }>(
        `SELECT a.action, a.entity, a.summary, a.created_at, u.name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
          WHERE a.action NOT IN ('login','logout') ORDER BY a.created_at DESC LIMIT 8`,
      )
    : [];

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Assalam o Alaikum, {user.name.split(" ")[0]}</h1>
          <p>Here is what needs attention on the website.</p>
        </div>
        <div className="actions">
          {can(user, "posts.own") && (
            <form action={createPost}>
              <input type="hidden" name="csrf" value={user.csrf} />
              <button className="a-btn" type="submit">
                Write an article
              </button>
            </form>
          )}
          <a className="a-btn secondary" href="/en" target="_blank" rel="noopener">
            View website
          </a>
        </div>
      </div>

      {denied && <p className="a-note warn" style={{ marginBottom: "1rem" }}>Your role does not include that section.</p>}

      <div className="a-stats">
        {seeEnquiries && (
          <>
            <Link href="/admin/enquiries?status=new" className={`a-stat${Number(counts.new_enq) ? " hot" : ""}`}>
              <span className="n">{counts.new_enq}</span>
              <span className="l">New enquiries</span>
            </Link>
            <Link href="/admin/enquiries?status=open" className="a-stat">
              <span className="n">{counts.open_enq}</span>
              <span className="l">In progress</span>
            </Link>
            <Link href="/admin/enquiries" className="a-stat">
              <span className="n">{counts.week_enq}</span>
              <span className="l">Enquiries in the last 7 days</span>
            </Link>
          </>
        )}
        <Link href="/admin/insights?status=published" className="a-stat">
          <span className="n">{counts.published}</span>
          <span className="l">Published articles</span>
        </Link>
        <Link href="/admin/insights?status=draft" className="a-stat">
          <span className="n">{counts.drafts}</span>
          <span className="l">{can(user, "posts.all") ? "Drafts and in review" : "Your drafts"}</span>
        </Link>
        {seePages && (
          <Link href="/admin/pages" className={`a-stat${Number(counts.pending_pages) ? " hot" : ""}`}>
            <span className="n">{counts.pending_pages}</span>
            <span className="l">Pages with unpublished changes</span>
          </Link>
        )}
      </div>

      <div className="a-grid-2">
        {seeEnquiries && (
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>Latest enquiries</h2>
              <Link href="/admin/enquiries" className="a-small">
                All enquiries
              </Link>
            </div>
            {enquiries.length ? (
              <table className="a-table">
                <tbody>
                  {enquiries.map((e) => (
                    <tr key={e.id}>
                      <td className="title-cell">
                        <Link href={`/admin/enquiries/${e.id}`}>{e.name}</Link>
                        <span className="sub">{e.interest || "General"}</span>
                      </td>
                      <td>
                        <span className={`a-badge ${e.status}`}>{statusLabels[e.status] || e.status}</span>
                      </td>
                      <td className="a-muted a-small">{fmtDateTime(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="a-empty">No enquiries yet. Requests from the Contact form will appear here.</p>
            )}
          </section>
        )}

        <section className="a-panel">
          <div className="a-panel-head">
            <h2>Recently edited articles</h2>
            <Link href="/admin/insights" className="a-small">
              All articles
            </Link>
          </div>
          {posts.length ? (
            <table className="a-table">
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="title-cell">
                      <Link href={`/admin/insights/${p.id}`}>{p.data.title.en || p.slug}</Link>
                    </td>
                    <td>
                      <span className={`a-badge ${p.status}`}>{p.status}</span>
                    </td>
                    <td className="a-muted a-small">{fmtDateTime(p.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="a-empty">No articles yet.</p>
          )}
        </section>

        {seePages && (
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>Recently edited pages</h2>
              <Link href="/admin/pages" className="a-small">
                All pages
              </Link>
            </div>
            {edits.length ? (
              <table className="a-table">
                <tbody>
                  {edits.slice(0, 6).map((e) => {
                    const g = groupForKey(e.key);
                    return (
                      <tr key={e.key}>
                        <td className="title-cell">
                          <Link href={`/admin/pages/${g?.id || "global"}`}>{g?.label || e.key}</Link>
                          <span className="sub">{e.name ? `by ${e.name}` : ""}</span>
                        </td>
                        <td>{e.draft ? <span className="a-badge draft-changes">Unpublished</span> : <span className="a-badge published">Live</span>}</td>
                        <td className="a-muted a-small">{fmtDateTime(e.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="a-empty">No page has been edited yet. Every page still shows its original text.</p>
            )}
          </section>
        )}

        {activity.length > 0 && (
          <section className="a-panel">
            <div className="a-panel-head">
              <h2>Recent activity</h2>
              <Link href="/admin/activity" className="a-small">
                Full log
              </Link>
            </div>
            <div className="a-panel-pad">
              <ul className="a-timeline">
                {activity.map((a, i) => (
                  <li key={i}>
                    <div>
                      <b>{a.name || "System"}</b> {a.summary || `${a.action} ${a.entity}`}
                    </div>
                    <div className="when">{fmtDateTime(a.created_at)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
