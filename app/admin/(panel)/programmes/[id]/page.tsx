import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { one } from "@/lib/server/db";
import ProgrammeForm, { type ProgrammeValues } from "./ProgrammeForm";

export const metadata = { title: "Edit programme" };

const blank = { en: "", ur: "" };

export default async function EditProgramme({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("programmes.edit");
  const { id } = await params;
  let values: ProgrammeValues;
  if (id === "new") {
    values = {
      id: 0,
      slug: "",
      kind: "course",
      sort: 100,
      visible: true,
      title: blank,
      level: { en: "Foundation", ur: "بنیادی" },
      duration: blank,
      format: { en: "Online, live sessions with recordings", ur: "آن لائن، براہِ راست سیشن اور ریکارڈنگ" },
      summary: blank,
      audience: blank,
      modules: { en: [], ur: [] },
    };
  } else {
    if (!/^\d+$/.test(id)) notFound();
    const r = await one<{ id: string; slug: string; kind: "course" | "workshop"; sort: number; visible: boolean; data: Omit<ProgrammeValues, "id" | "slug" | "kind" | "sort" | "visible"> }>(
      `SELECT id, slug, kind, sort, visible, data FROM programmes WHERE id = $1`,
      [id],
    );
    if (!r) notFound();
    values = { ...r.data, id: Number(r.id), slug: r.slug, kind: r.kind, sort: r.sort, visible: r.visible };
  }
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/programmes" className="a-crumb">
            Programmes
          </Link>
          <h1>{values.id ? values.title.en : "Add a programme"}</h1>
          {values.id ? <p>/academy/{values.slug}</p> : <p>Fill in English first; Urdu can follow. Empty Urdu fields show nothing on the Urdu site.</p>}
        </div>
        {values.id ? (
          <div className="actions">
            <a className="a-btn secondary" href={`/en/academy/${values.slug}`} target="_blank" rel="noopener">
              View on site
            </a>
          </div>
        ) : null}
      </div>
      <ProgrammeForm values={values} />
    </>
  );
}
