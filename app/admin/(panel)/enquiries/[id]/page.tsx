import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { one, q } from "@/lib/server/db";
import { enquiryFilterOptions } from "@/lib/server/enquiries";
import { fmtDateTime, statusLabels } from "../../../format";
import { DeleteEnquiry, NoteForm, StatusForm } from "./EnquiryActions";

export const metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("enquiries.manage");
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const e = await one<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    organisation: string | null;
    interest: string | null;
    programme: string | null;
    message: string | null;
    locale: string | null;
    status: string;
    assigned_to: string | null;
    source_page: string | null;
    landing_page: string | null;
    referrer: string | null;
    utm: Record<string, string>;
    created_at: Date;
    updated_at: Date;
  }>(`SELECT * FROM enquiries WHERE id = $1`, [id]);
  if (!e) notFound();
  const notes = await q<{ note: string; created_at: Date; name: string | null }>(
    `SELECT n.note, n.created_at, u.name FROM enquiry_notes n LEFT JOIN users u ON u.id = n.user_id WHERE n.enquiry_id = $1 ORDER BY n.created_at DESC`,
    [id],
  );
  const { staff } = await enquiryFilterOptions();
  const wa = e.phone ? e.phone.replace(/\D/g, "").replace(/^0/, "92") : "";
  const utm = Object.entries(e.utm || {});

  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/enquiries" className="a-crumb">
            Enquiries
          </Link>
          <h1>{e.name}</h1>
          <p>
            {e.interest || "General enquiry"}
            {e.programme ? `, ${e.programme}` : ""}. Received {fmtDateTime(e.created_at)}.
          </p>
        </div>
        <div className="actions">
          <span className={`a-badge ${e.status}`} style={{ fontSize: "0.85rem", padding: "4px 12px" }}>
            {statusLabels[e.status]}
          </span>
        </div>
      </div>

      <div className="a-grid-main">
        <div className="a-stack">
          <section className="a-panel a-panel-pad a-stack">
            <h2>Contact</h2>
            <dl className="a-kv">
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${e.email}?subject=${encodeURIComponent("Your enquiry to Al-Ihkam")}`}>{e.email}</a>
              </dd>
              {e.phone && (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}>{e.phone}</a>
                    {wa && (
                      <>
                        {" · "}
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">
                          WhatsApp
                        </a>
                      </>
                    )}
                  </dd>
                </>
              )}
              {e.organisation && (
                <>
                  <dt>Organisation</dt>
                  <dd>{e.organisation}</dd>
                </>
              )}
              <dt>Language</dt>
              <dd>{e.locale === "ur" ? "Urdu" : "English"}</dd>
            </dl>
            {e.message ? (
              <div>
                <h3 className="a-label" style={{ marginBottom: "0.4rem" }}>
                  Message
                </h3>
                <p style={{ whiteSpace: "pre-wrap", background: "#fafbf9", border: "1px solid var(--a-line-2)", borderRadius: 6, padding: "0.8rem 1rem" }}>{e.message}</p>
              </div>
            ) : (
              <p className="a-muted">No message was written.</p>
            )}
          </section>

          <section className="a-panel a-panel-pad a-stack">
            <h2>Source</h2>
            <dl className="a-kv">
              <dt>Sent from page</dt>
              <dd>{e.source_page || "Unknown"}</dd>
              <dt>First page visited</dt>
              <dd>{e.landing_page || "Unknown"}</dd>
              <dt>Referrer</dt>
              <dd>{e.referrer || "Direct or unknown"}</dd>
              {utm.length > 0 && (
                <>
                  <dt>Campaign tags</dt>
                  <dd>{utm.map(([k, v]) => `${k}=${v}`).join(", ")}</dd>
                </>
              )}
            </dl>
          </section>

          <section className="a-panel a-panel-pad a-stack">
            <h2>Notes and history</h2>
            <NoteForm id={Number(e.id)} />
            {notes.length ? (
              <ul className="a-timeline">
                {notes.map((n, i) => (
                  <li key={i}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{n.note}</div>
                    <div className="when">
                      {n.name || "Someone"}, {fmtDateTime(n.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="a-small a-muted">No notes yet.</p>
            )}
          </section>
        </div>

        <aside className="a-stack">
          <section className="a-panel a-panel-pad">
            <h2 style={{ marginBottom: "0.9rem" }}>Follow-up</h2>
            <StatusForm id={Number(e.id)} status={e.status} assigned={e.assigned_to ? Number(e.assigned_to) : null} staff={staff} />
          </section>
          <section className="a-panel a-panel-pad">
            <DeleteEnquiry id={Number(e.id)} />
          </section>
        </aside>
      </div>
    </>
  );
}
