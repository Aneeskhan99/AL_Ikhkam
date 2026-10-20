import Link from "next/link";
import { requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { fmtDateTime } from "../../format";
import { fixedSeoPages } from "../../seo-pages";

export const metadata = { title: "SEO" };

type Row = { key: string; locale: string; title: string | null; description: string | null; noindex: boolean; updated_at: Date };

export default async function SeoAdmin() {
  await requirePage("seo.edit");
  const [rows, programmes, posts] = await Promise.all([
    q<Row>(`SELECT key, locale, title, description, noindex, updated_at FROM seo`),
    q<{ slug: string; visible: boolean; data: { title: { en: string } } }>(`SELECT slug, visible, data FROM programmes ORDER BY kind, sort, id`),
    q<{ n: string }>(`SELECT count(*) AS n FROM posts WHERE seo <> '{}'::jsonb`),
  ]);
  const byKey = new Map<string, Row[]>();
  for (const r of rows) byKey.set(r.key, [...(byKey.get(r.key) || []), r]);

  const pages = [
    ...fixedSeoPages.map((p) => ({ key: p.key, label: p.label, path: p.path, hidden: false })),
    ...programmes.map((p) => ({ key: `programme:${p.slug}`, label: p.data.title.en, path: `/academy/${p.slug}`, hidden: !p.visible })),
  ];

  return (
    <>
      <div className="a-top">
        <div>
          <h1>SEO</h1>
          <p>The title and description Google shows for each page, and the image used when a link is shared on WhatsApp, LinkedIn or Facebook. Empty fields use the page’s own heading and introduction.</p>
        </div>
      </div>
      <section className="a-panel">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Search title</th>
                <th>Status</th>
                <th>Last changed</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => {
                const r = byKey.get(p.key) || [];
                const en = r.find((x) => x.locale === "en");
                const custom = r.some((x) => x.title || x.description);
                const noindex = r.some((x) => x.noindex);
                const last = r.reduce<Date | null>((a, x) => (!a || x.updated_at > a ? x.updated_at : a), null);
                return (
                  <tr key={p.key}>
                    <td className="title-cell">
                      <Link href={`/admin/seo/${encodeURIComponent(p.key)}`}>{p.label}</Link>
                      <span className="sub">{p.path}</span>
                    </td>
                    <td className="a-small">{en?.title || <span className="a-muted">Uses the page heading</span>}</td>
                    <td>
                      {noindex ? <span className="a-badge danger">Hidden from Google</span> : custom ? <span className="a-badge on">Customised</span> : <span className="a-badge draft">Automatic</span>}
                      {p.hidden && (
                        <>
                          {" "}
                          <span className="a-badge off">Programme hidden</span>
                        </>
                      )}
                    </td>
                    <td className="a-small a-muted">{last ? fmtDateTime(last) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="a-note a-mt">
        Articles have their own search title, description and share image in the article editor, in the SEO panel beside the text.{" "}
        {Number(posts[0]?.n || 0) > 0 && `${posts[0].n} article${posts[0].n === "1" ? " has" : "s have"} custom settings. `}
        <Link href="/admin/insights">Open Insights</Link>
      </p>
    </>
  );
}
