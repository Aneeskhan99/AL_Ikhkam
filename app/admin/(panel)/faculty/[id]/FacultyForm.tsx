"use client";

import { useRouter } from "next/navigation";
import { deleteFaculty, saveFaculty } from "../../../actions/catalogue";
import { BiField, ImageField } from "../../../fields";
import { ActionForm, ConfirmAction, SubmitButton } from "../../../ui";

type L = { en: string; ur: string };
type LL = { en: string[]; ur: string[] };
export type FacultyValues = {
  id: number;
  slug: string;
  sort: number;
  visible: boolean;
  photo: string;
  initial: string;
  name: L;
  role: L;
  affiliation: L;
  bio: L;
  education: LL;
  focus: LL;
  email: string;
  links: { label: L; href: string }[];
};

export default function FacultyForm({ values: v }: { values: FacultyValues }) {
  const router = useRouter();
  return (
    <div className="a-grid-main">
      <ActionForm
        action={saveFaculty}
        id="faculty-form"
        className="a-panel a-panel-pad a-form"
        onSuccess={(r) => {
          if (!v.id && r.ok && r.id) router.push(`/admin/faculty/${r.id}`);
          else router.refresh();
        }}
      >
        {(pending) => (
          <>
            <input type="hidden" name="id" value={v.id} />
            <ImageField name="photo" label="Photo" value={v.photo} hint="A portrait works best (4:5). Without a photo, the site shows a geometric seal with the initial." />
            <BiField name="name" label="Name" value={v.name} required />
            <BiField name="role" label="Role at Al-Ihkam" value={v.role} required />
            <BiField name="affiliation" label="Current position and institution" value={v.affiliation} />
            <BiField name="bio" label="Biography" value={v.bio} type="textarea" hint="Leave an empty line between paragraphs." />
            <BiField name="education" label="Education" value={v.education} type="list" />
            <BiField name="focus" label="Areas of work" value={v.focus} type="list" />
            <div>
              <SubmitButton pending={pending}>{v.id ? "Save profile" : "Add profile"}</SubmitButton>
            </div>
          </>
        )}
      </ActionForm>
      <aside className="a-stack">
        <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
          <h2>Details</h2>
          <div className="a-field">
            <label htmlFor="email">Public email</label>
            <input id="email" name="email" type="email" form="faculty-form" defaultValue={v.email} />
          </div>
          <div className="a-field">
            <label htmlFor="initial">Initial for the seal</label>
            <input id="initial" name="initial" type="text" form="faculty-form" defaultValue={v.initial} maxLength={2} lang="ar" dir="rtl" style={{ maxWidth: 80, fontFamily: "Amiri, serif", fontSize: "1.2rem" }} />
            <span className="hint">One Arabic or Urdu letter, used when there is no photo.</span>
          </div>
          <div className="a-field">
            <label htmlFor="linkHrefs">Profile links</label>
            <textarea id="linkHrefs" name="linkHrefs" form="faculty-form" rows={3} defaultValue={v.links.map((l) => l.href).join("\n")} placeholder="https://scholar.google.com/…" />
            <span className="hint">One link per line, for example Google Scholar, ORCID, LinkedIn or a lecture.</span>
          </div>
          <div className="a-field">
            <label htmlFor="linkLabel.en">Link names (English)</label>
            <textarea id="linkLabel.en" name="linkLabel.en" form="faculty-form" rows={3} defaultValue={v.links.map((l) => l.label.en).join("\n")} placeholder="Google Scholar" />
          </div>
          <div className="a-field">
            <label htmlFor="linkLabel.ur">Link names (Urdu)</label>
            <textarea id="linkLabel.ur" name="linkLabel.ur" form="faculty-form" rows={3} lang="ur" dir="rtl" defaultValue={v.links.map((l) => l.label.ur).join("\n")} />
          </div>
          <div className="a-field">
            <label htmlFor="slug">Address</label>
            <input id="slug" name="slug" type="text" form="faculty-form" defaultValue={v.slug} placeholder="made from the English name" />
          </div>
          <div className="a-field">
            <label htmlFor="sort">Order</label>
            <input id="sort" name="sort" type="number" form="faculty-form" defaultValue={v.sort} />
          </div>
          <label className="a-check">
            <input type="checkbox" name="visible" form="faculty-form" defaultChecked={v.visible} /> Show on the website
          </label>
        </section>
        {v.id ? (
          <ConfirmAction
            action={deleteFaculty}
            fields={{ id: v.id }}
            label="Delete profile"
            title="Delete this profile?"
            message="It is removed from the website. To keep it but hide it, untick “Show on the website” instead."
          />
        ) : null}
      </aside>
    </div>
  );
}
