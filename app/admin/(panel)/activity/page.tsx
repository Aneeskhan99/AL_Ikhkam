import { requirePage } from "@/lib/server/auth";
import { one, q } from "@/lib/server/db";
import { fmtDateTime } from "../../format";
import { Pager } from "../../pager";

export const metadata = { title: "Activity" };

const PER = 50;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePage("activity.view");
  const page = Math.max(1, parseInt((await searchParams).page || "1", 10) || 1);
  const total = Number((await one<{ n: string }>(`SELECT count(*) AS n FROM audit_log`))?.n || 0);
  const rows = await q<{ action: string; entity: string; entity_id: string | null; summary: string | null; created_at: Date; name: string | null }>(
    `SELECT a.action, a.entity, a.entity_id, a.summary, a.created_at, u.name
       FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
    [PER, (page - 1) * PER],
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Activity</h1>
          <p>Every change made in the admin, newest first.</p>
        </div>
      </div>
      <section className="a-panel">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>What</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="a-small a-muted" style={{ whiteSpace: "nowrap" }}>
                    {fmtDateTime(r.created_at)}
                  </td>
                  <td>{r.name || "System"}</td>
                  <td>{r.summary || `${r.action} ${r.entity}${r.entity_id ? ` #${r.entity_id}` : ""}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="a-empty">No activity yet.</p>}
        </div>
        <Pager page={page} pages={Math.ceil(total / PER)} total={total} makeHref={(p) => `/admin/activity?page=${p}`} />
      </section>
    </>
  );
}
