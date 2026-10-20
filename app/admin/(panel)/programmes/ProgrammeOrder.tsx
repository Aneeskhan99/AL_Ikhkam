"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { reorderProgrammes } from "../../actions/catalogue";
import { ActionForm, SubmitButton } from "../../ui";

type Row = { id: number; slug: string; kind: string; sort: number; visible: boolean; title: string; level: string; duration: string };

export default function ProgrammeOrder({ rows }: { rows: Row[] }) {
  const router = useRouter();
  return (
    <ActionForm action={reorderProgrammes} className="" onSuccess={() => router.refresh()}>
      {(pending) => (
        <section className="a-panel">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Order</th>
                  <th>Programme</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Shown</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input type="number" name={`sort_${r.id}`} defaultValue={r.sort} aria-label={`Order for ${r.title}`} style={{ width: 76, minHeight: 34 }} />
                    </td>
                    <td className="title-cell">
                      <Link href={`/admin/programmes/${r.id}`}>{r.title}</Link>
                      <span className="sub">/academy/{r.slug}</span>
                    </td>
                    <td>{r.kind === "course" ? "Course" : "Workshop"}</td>
                    <td>{r.level}</td>
                    <td>{r.duration}</td>
                    <td>{r.visible ? <span className="a-badge on">Shown</span> : <span className="a-badge off">Hidden</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="a-empty">No programmes yet.</p>}
          </div>
          {rows.length > 1 && (
            <div className="a-pager">
              <span>Change the numbers to reorder, then save.</span>
              <SubmitButton pending={pending} className="a-btn secondary sm">
                Save order
              </SubmitButton>
            </div>
          )}
        </section>
      )}
    </ActionForm>
  );
}
