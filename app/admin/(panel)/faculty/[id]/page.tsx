import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { one } from "@/lib/server/db";
import FacultyForm, { type FacultyValues } from "./FacultyForm";

export const metadata = { title: "Edit profile" };

const blank = { en: "", ur: "" };
const blankList = { en: [] as string[], ur: [] as string[] };

export default async function EditFaculty({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("faculty.edit");
  const { id } = await params;
  let v: FacultyValues;
  if (id === "new") {
    v = { id: 0, slug: "", sort: 100, visible: true, photo: "", initial: "", name: blank, role: blank, affiliation: blank, bio: blank, education: blankList, focus: blankList, email: "", links: [] };
  } else {
    if (!/^\d+$/.test(id)) notFound();
    const r = await one<{ id: string; slug: string; sort: number; visible: boolean; photo: string | null; data: Omit<FacultyValues, "id" | "slug" | "sort" | "visible" | "photo"> }>(
      `SELECT id, slug, sort, visible, photo, data FROM faculty WHERE id = $1`,
      [id],
    );
    if (!r) notFound();
    v = { ...r.data, email: r.data.email || "", links: r.data.links || [], id: Number(r.id), slug: r.slug, sort: r.sort, visible: r.visible, photo: r.photo || "" };
  }
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/faculty" className="a-crumb">
            Faculty
          </Link>
          <h1>{v.id ? v.name.en : "Add a profile"}</h1>
        </div>
        {v.id ? (
          <div className="actions">
            <a className="a-btn secondary" href={`/en/faculty#${v.slug}`} target="_blank" rel="noopener">
              View on site
            </a>
          </div>
        ) : null}
      </div>
      <FacultyForm values={v} />
    </>
  );
}
