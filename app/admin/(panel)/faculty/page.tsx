import Link from "next/link";
import { requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";

export const metadata = { title: "Faculty" };

export default async function FacultyAdmin() {
  await requirePage("faculty.edit");
  const rows = await q<{ id: string; slug: string; sort: number; visible: boolean; photo: string | null; data: { name: { en: string }; role: { en: string }; initial: string } }>(
    `SELECT id, slug, sort, visible, photo, data FROM faculty ORDER BY sort, id`,
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Faculty</h1>
          <p>Profiles on the Faculty page and the Home page. Add a photo to replace the geometric monogram.</p>
        </div>
        <div className="actions">
          <Link className="a-btn" href="/admin/faculty/new">
            Add profile
          </Link>
        </div>
      </div>
      <section className="a-panel">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Photo</th>
              <th>Name</th>
              <th>Order</th>
              <th>Shown</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--a-accent-soft)", display: "grid", placeItems: "center", fontFamily: "Amiri, serif", color: "var(--a-accent)", fontSize: "1.2rem" }}>
                      {r.data.initial}
                    </span>
                  )}
                </td>
                <td className="title-cell">
                  <Link href={`/admin/faculty/${r.id}`}>{r.data.name.en}</Link>
                  <span className="sub">{r.data.role.en}</span>
                </td>
                <td>{r.sort}</td>
                <td>{r.visible ? <span className="a-badge on">Shown</span> : <span className="a-badge off">Hidden</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="a-empty">No profiles yet.</p>}
      </section>
    </>
  );
}
