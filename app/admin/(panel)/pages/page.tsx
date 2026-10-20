import Link from "next/link";
import { requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { fieldsFor, pageGroups } from "@/lib/content-schema";
import { fmtDateTime } from "../../format";

export const metadata = { title: "Pages" };

export default async function PagesIndex() {
  await requirePage("pages.edit");
  const rows = await q<{ key: string; published: boolean; pending: boolean; updated_at: Date }>(
    `SELECT key, published IS NOT NULL AS published, (draft IS NOT NULL OR draft_reset) AS pending, updated_at FROM content_fields`,
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Pages</h1>
          <p>
            Edit the text, lists and images on every page in English and Urdu. Changes are saved as a draft first; Preview shows them on the real page, and Publish puts them
            live.
          </p>
        </div>
      </div>
      <div className="pe-list">
        {pageGroups.map((g) => {
          const keys = new Set(fieldsFor(g).map((f) => f.key));
          const mine = rows.filter((r) => keys.has(r.key));
          const pending = mine.filter((r) => r.pending).length;
          const edited = mine.filter((r) => r.published).length;
          const last = mine.reduce<Date | null>((acc, r) => (!acc || r.updated_at > acc ? r.updated_at : acc), null);
          return (
            <Link key={g.id} href={`/admin/pages/${g.id}`} className="a-panel pe-group-link">
              <div>
                <h2>{g.label}</h2>
                <p>{g.description}</p>
              </div>
              <div style={{ textAlign: "end", display: "grid", gap: "0.3rem", justifyItems: "end" }}>
                {pending ? <span className="a-badge draft-changes">{pending} unpublished</span> : null}
                {edited ? <span className="a-badge published">{edited} edited</span> : <span className="a-badge">Original text</span>}
                {last && <span className="a-small a-muted">{fmtDateTime(last)}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
