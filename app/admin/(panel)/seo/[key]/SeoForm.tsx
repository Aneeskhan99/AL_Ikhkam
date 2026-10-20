"use client";

import { useState } from "react";
import { saveSeo } from "../../../actions/seo";
import { ImageField } from "../../../fields";
import { ActionForm, SubmitButton } from "../../../ui";

type L = { en: string; ur: string };
export type SeoValues = { key: string; title: L; description: L; canonical: L; ogImage: string; noindex: boolean };

export default function SeoForm({
  values: v,
  defaults,
  host,
  path,
  siteName,
  isHome,
}: {
  values: SeoValues;
  defaults: { title: L; description: L };
  host: string;
  path: string;
  siteName: L;
  isHome: boolean;
}) {
  const [title, setTitle] = useState(v.title);
  const [desc, setDesc] = useState(v.description);
  const [noindex, setNoindex] = useState(v.noindex);

  const lang = (l: "en" | "ur") => {
    const shownTitle = title[l] || defaults.title[l];
    // Inner pages get " | Al-Ihkam" added by the site layout.
    const fullTitle = isHome ? shownTitle : `${shownTitle} | ${siteName[l]}`;
    const shownDesc = desc[l] || defaults.description[l];
    const rtl = l === "ur" ? { lang: "ur", dir: "rtl" as const } : {};
    return (
      <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.9rem" }} key={l}>
        <h2>{l === "en" ? "English" : "Urdu"}</h2>
        <div className="seo-preview" {...rtl}>
          <span className="url">
            {host} › {l}
            {path === "/" ? "" : path.replace(/\//g, " › ")}
          </span>
          <span className="t">{fullTitle.length > 65 ? fullTitle.slice(0, 63) + "…" : fullTitle}</span>
          <span className="d">{shownDesc.length > 160 ? shownDesc.slice(0, 158) + "…" : shownDesc}</span>
        </div>
        <div className="a-field">
          <label htmlFor={`title.${l}`}>Search title</label>
          <input id={`title.${l}`} name={`title.${l}`} type="text" maxLength={120} value={title[l]} placeholder={defaults.title[l]} onChange={(e) => setTitle({ ...title, [l]: e.target.value })} {...rtl} />
          <span className="hint">
            {fullTitle.length} characters with the site name. Google shows about 60.
          </span>
        </div>
        <div className="a-field">
          <label htmlFor={`description.${l}`}>Search description</label>
          <textarea id={`description.${l}`} name={`description.${l}`} rows={3} maxLength={320} value={desc[l]} placeholder={defaults.description[l]} onChange={(e) => setDesc({ ...desc, [l]: e.target.value })} {...rtl} />
          <span className="hint">{shownDesc.length} characters. Aim for 120 to 160.</span>
        </div>
        <details>
          <summary className="a-small a-muted" style={{ cursor: "pointer" }}>
            Advanced
          </summary>
          <div className="a-field a-mt">
            <label htmlFor={`canonical.${l}`}>Canonical link</label>
            <input id={`canonical.${l}`} name={`canonical.${l}`} type="text" defaultValue={v.canonical[l]} placeholder={`/${l}${path === "/" ? "" : path}`} />
            <span className="hint">Only change this if the same content lives at another address.</span>
          </div>
        </details>
      </section>
    );
  };

  return (
    <ActionForm action={saveSeo} className="a-stack">
      {(pending) => (
        <>
          <input type="hidden" name="key" value={v.key} />
          <div className="a-grid-2">
            {lang("en")}
            {lang("ur")}
          </div>
          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.9rem" }}>
            <h2>Sharing and indexing</h2>
            <ImageField name="ogImage" label="Share image" value={v.ogImage} hint="Shown when the link is shared on WhatsApp, LinkedIn or Facebook. 1200 × 630 works best. Empty uses the site’s default image." />
            <label className="a-check">
              <input type="checkbox" name="noindex" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} /> Hide this page from Google
            </label>
            {noindex && <p className="a-note warn">The page stays on the website but is removed from the sitemap and asks search engines not to list it.</p>}
          </section>
          <div className="a-row">
            <SubmitButton pending={pending}>Save</SubmitButton>
            <span className="a-small a-muted">Empty fields fall back to the page’s own heading and introduction.</span>
          </div>
        </>
      )}
    </ActionForm>
  );
}
