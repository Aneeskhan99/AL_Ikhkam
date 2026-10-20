import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { one, q } from "@/lib/server/db";
import { fmtDateTime } from "../../../format";
import UserForm from "../UserForm";

export const metadata = { title: "Edit user" };

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("users.manage");
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const u = await one<{ id: string; username: string; name: string; email: string | null; role: string; disabled: boolean; created_at: Date; last_login_at: Date | null }>(
    `SELECT id, username, name, email, role, disabled, created_at, last_login_at FROM users WHERE id = $1`,
    [id],
  );
  if (!u) notFound();
  const log = await q<{ action: string; summary: string | null; created_at: Date }>(
    `SELECT action, summary, created_at FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 12`,
    [id],
  );
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/users" className="a-crumb">
            Users
          </Link>
          <h1>{u.name}</h1>
          <p>
            Added {fmtDateTime(u.created_at)}. Last sign-in {u.last_login_at ? fmtDateTime(u.last_login_at) : "never"}.
          </p>
        </div>
      </div>
      <div className="a-grid-main">
        <UserForm user={{ id: Number(u.id), username: u.username, name: u.name, email: u.email || "", role: u.role, disabled: u.disabled }} />
        <section className="a-panel a-panel-pad">
          <h2 style={{ marginBottom: "0.8rem" }}>Recent activity</h2>
          {log.length ? (
            <ul className="a-timeline">
              {log.map((l, i) => (
                <li key={i}>
                  <div>{l.summary || l.action}</div>
                  <div className="when">{fmtDateTime(l.created_at)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="a-muted">Nothing yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
