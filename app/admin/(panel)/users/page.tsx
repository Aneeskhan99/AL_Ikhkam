import Link from "next/link";
import { requirePage, roleLabels, type Role } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { fmtDateTime } from "../../format";
import UserForm from "./UserForm";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  await requirePage("users.manage");
  const users = await q<{ id: string; username: string; name: string; email: string | null; role: Role; disabled: boolean; last_login_at: Date | null }>(
    `SELECT id, username, name, email, role, disabled, last_login_at FROM users ORDER BY disabled, role, name`,
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Users</h1>
          <p>Administrators can do everything. Editors manage all content and enquiries. Authors write their own articles and send them for review.</p>
        </div>
      </div>
      <div className="a-grid-main">
        <section className="a-panel">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="title-cell">
                      <Link href={`/admin/users/${u.id}`}>{u.name}</Link>
                      <span className="sub">
                        {u.username}
                        {u.email ? `, ${u.email}` : ""}
                      </span>
                    </td>
                    <td>{roleLabels[u.role]}</td>
                    <td>{u.disabled ? <span className="a-badge disabled">Disabled</span> : <span className="a-badge on">Active</span>}</td>
                    <td className="a-muted a-small">{u.last_login_at ? fmtDateTime(u.last_login_at) : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="a-panel a-panel-pad">
          <h2 style={{ marginBottom: "1rem" }}>Add a user</h2>
          <UserForm />
        </section>
      </div>
    </>
  );
}
