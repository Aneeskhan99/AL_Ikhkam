"use client";

import { useRouter } from "next/navigation";
import { deleteProgramme, saveProgramme } from "../../../actions/catalogue";
import { BiField } from "../../../fields";
import { ActionForm, ConfirmAction, SubmitButton } from "../../../ui";

type L = { en: string; ur: string };
export type ProgrammeValues = {
  id: number;
  slug: string;
  kind: "course" | "workshop";
  sort: number;
  visible: boolean;
  title: L;
  level: L;
  duration: L;
  format: L;
  summary: L;
  audience: L;
  modules: { en: string[]; ur: string[] };
};

export default function ProgrammeForm({ values: v }: { values: ProgrammeValues }) {
  const router = useRouter();
  return (
    <div className="a-grid-main">
      <ActionForm
        action={saveProgramme}
        id="programme-form"
        className="a-panel a-panel-pad a-form"
        onSuccess={(r) => {
          if (!v.id && r.ok && r.id) router.push(`/admin/programmes/${r.id}`);
          else router.refresh();
        }}
      >
        {(pending) => (
          <>
            <input type="hidden" name="id" value={v.id} />
            <BiField name="title" label="Title" value={v.title} required />
            <BiField name="summary" label="Summary" value={v.summary} type="textarea" hint="Shown in the catalogue and at the top of the programme page." required />
            <BiField name="audience" label="Who it is for" value={v.audience} type="textarea" />
            <BiField name="modules" label="What it covers" value={v.modules} type="list" />
            <div className="a-grid-3">
              <BiField name="level" label="Level" value={v.level} required />
              <BiField name="duration" label="Duration" value={v.duration} required />
              <BiField name="format" label="Format" value={v.format} required />
            </div>
            <div>
              <SubmitButton pending={pending}>{v.id ? "Save programme" : "Add programme"}</SubmitButton>
            </div>
          </>
        )}
      </ActionForm>
      <aside className="a-stack">
        <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
          <h2>Settings</h2>
          <div className="a-field">
            <label htmlFor="kind">Type</label>
            <select id="kind" name="kind" form="programme-form" defaultValue={v.kind}>
              <option value="course">Professional course</option>
              <option value="workshop">Corporate workshop</option>
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="slug">Address</label>
            <input id="slug" name="slug" type="text" form="programme-form" defaultValue={v.slug} placeholder="made from the English title" />
            <span className="hint">Changing it changes the page link.</span>
          </div>
          <div className="a-field">
            <label htmlFor="sort">Order</label>
            <input id="sort" name="sort" type="number" form="programme-form" defaultValue={v.sort} />
          </div>
          <label className="a-check">
            <input type="checkbox" name="visible" form="programme-form" defaultChecked={v.visible} /> Show on the website
          </label>
        </section>
        {v.id ? (
          <ConfirmAction
            action={deleteProgramme}
            fields={{ id: v.id }}
            label="Delete programme"
            title="Delete this programme?"
            message="Its page is removed from the website. To keep it but hide it, untick “Show on the website” instead."
          />
        ) : null}
      </aside>
    </div>
  );
}
