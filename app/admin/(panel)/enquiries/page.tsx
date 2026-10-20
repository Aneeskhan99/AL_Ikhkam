import Link from "next/link";
import { requirePage } from "@/lib/server/auth";
import { one, q } from "@/lib/server/db";
import { enquiryFilterOptions, enquiryWhere, type EnquiryFilters } from "@/lib/server/enquiries";
import { fmtDateTime, statusLabels } from "../../format";
import { Pager } from "../../pager";

export const metadata = { title: "Enquiries" };

const PER = 25;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<EnquiryFilters & { page?: string }> }) {
  await requirePage("enquiries.manage");
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const filters: EnquiryFilters = { status: sp.status, interest: sp.interest, programme: sp.programme, assigned: sp.assigned, from: sp.from, to: sp.to, q: sp.q };
  const { sql, params } = enquiryWhere(filters);
  const total = Number((await one<{ n: string }>(`SELECT count(*) AS n FROM enquiries e ${sql}`, params))?.n || 0);
  const rows = await q<{ id: string; name: string; email: string; organisation: string | null; interest: string | null; programme: string | null; status: string; created_at: Date; assignee: string | null; notes: string }>(
    `SELECT e.id, e.name, e.email, e.organisation, e.interest, e.programme, e.status, e.created_at, u.name AS assignee,
            (SELECT count(*) FROM enquiry_notes n WHERE n.enquiry_id = e.id) AS notes
       FROM enquiries e LEFT JOIN users u ON u.id = e.assigned_to
       ${sql} ORDER BY e.created_at DESC LIMIT ${PER} OFFSET ${(page - 1) * PER}`,
    params,
  );
  const opts = await enquiryFilterOptions();
  const qs = (extra: Record<string, string | number>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, ...extra })) if (v) u.set(k, String(v));
    return u.toString();
  };

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Enquiries</h1>
          <p>Every consultation request sent through the website. Open one to change its status, assign it, or add notes.</p>
        </div>
        <div className="actions">
          <a className="a-btn secondary" href={`/admin/enquiries/export?${qs({})}`}>
            Export CSV
          </a>
        </div>
      </div>
      <section className="a-panel">
        <form className="a-filters" method="get">
          <div className="a-field grow">
            <label htmlFor="q">Search</label>
            <input id="q" name="q" type="search" defaultValue={sp.q || ""} placeholder="Name, email, organisation or message" />
          </div>
          <div className="a-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={sp.status || ""}>
              <option value="">Any status</option>
              <option value="open">In progress (contacted or booked)</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="interest">Service</label>
            <select id="interest" name="interest" defaultValue={sp.interest || ""}>
              <option value="">Any service</option>
              {opts.interests.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="programme">Programme</label>
            <select id="programme" name="programme" defaultValue={sp.programme || ""}>
              <option value="">Any programme</option>
              {opts.programmes.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="assigned">Assigned to</label>
            <select id="assigned" name="assigned" defaultValue={sp.assigned || ""}>
              <option value="">Anyone</option>
              <option value="none">Nobody yet</option>
              {opts.staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="from">From</label>
            <input id="from" name="from" type="date" defaultValue={sp.from || ""} />
          </div>
          <div className="a-field">
            <label htmlFor="to">To</label>
            <input id="to" name="to" type="date" defaultValue={sp.to || ""} />
          </div>
          <div className="a-row">
            <button className="a-btn" type="submit">
              Filter
            </button>
            <Link className="a-btn ghost" href="/admin/enquiries">
              Clear
            </Link>
          </div>
        </form>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Needs help with</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className="title-cell">
                    <Link href={`/admin/enquiries/${e.id}`}>{e.name}</Link>
                    <span className="sub">
                      {e.email}
                      {e.organisation ? `, ${e.organisation}` : ""}
                    </span>
                  </td>
                  <td>
                    {e.interest || "General"}
                    {e.programme && <span className="sub">{e.programme}</span>}
                  </td>
                  <td>
                    <span className={`a-badge ${e.status}`}>{statusLabels[e.status]}</span>
                    {Number(e.notes) > 0 && <span className="sub">{e.notes} notes</span>}
                  </td>
                  <td>{e.assignee || <span className="a-muted">Nobody</span>}</td>
                  <td className="a-small a-muted" style={{ whiteSpace: "nowrap" }}>
                    {fmtDateTime(e.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="a-empty">{Object.values(filters).some(Boolean) ? "No enquiries match these filters." : "No enquiries yet. Requests from the Contact page will appear here."}</p>}
        </div>
        <Pager page={page} pages={Math.ceil(total / PER)} total={total} makeHref={(p) => `/admin/enquiries?${qs({ page: p })}`} />
      </section>
    </>
  );
}
