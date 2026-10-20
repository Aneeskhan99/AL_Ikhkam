import Link from "next/link";
import { requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import ProgrammeOrder from "./ProgrammeOrder";

export const metadata = { title: "Programmes" };

export default async function ProgrammesAdmin() {
  await requirePage("programmes.edit");
  const rows = await q<{ id: string; slug: string; kind: string; sort: number; visible: boolean; data: { title: { en: string }; level: { en: string }; duration: { en: string } } }>(
    `SELECT id, slug, kind, sort, visible, data FROM programmes ORDER BY sort, id`,
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Programmes</h1>
          <p>Courses and workshops shown on the Academy page, each with its own page. Lower numbers appear first.</p>
        </div>
        <div className="actions">
          <Link className="a-btn" href="/admin/programmes/new">
            Add programme
          </Link>
        </div>
      </div>
      <ProgrammeOrder
        rows={rows.map((r) => ({ id: Number(r.id), slug: r.slug, kind: r.kind, sort: r.sort, visible: r.visible, title: r.data.title.en, level: r.data.level.en, duration: r.data.duration.en }))}
      />
    </>
  );
}
