"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteMedia, mediaUsageFor, updateMediaAlt, uploadMedia, type MediaItem } from "../../actions/media";
import { bytes, fmtDateTime } from "../../format";
import { ActionForm, ConfirmAction, SubmitButton } from "../../ui";

type Item = MediaItem & { by: string | null };

export default function MediaLibrary({ items, canDelete, search, type }: { items: Item[]; canDelete: boolean; search: string; type: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Item | null>(null);
  const [usage, setUsage] = useState<{ where: string; ref: string }[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selected) setSelected(items.find((i) => i.id === selected.id) || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    setUsage(null);
    setCopied(false);
    if (selected) mediaUsageFor(selected.id).then(setUsage).catch(() => setUsage([]));
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="a-grid-main">
      <section className="a-panel">
        <form className="a-filters" method="get">
          <div className="a-field grow">
            <label htmlFor="q">Search</label>
            <input id="q" name="q" type="search" defaultValue={search} placeholder="File name or alt text" />
          </div>
          <div className="a-field">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" defaultValue={type}>
              <option value="">All files</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
            </select>
          </div>
          <button className="a-btn secondary" type="submit">
            Filter
          </button>
        </form>
        {items.length ? (
          <div className="m-grid">
            {items.map((m) => (
              <button type="button" key={m.id} className="m-card" aria-pressed={selected?.id === m.id} onClick={() => setSelected(m)}>
                <span className="thumb" style={m.mime.startsWith("image/") ? { backgroundImage: `url(${m.url})` } : undefined}>
                  {!m.mime.startsWith("image/") && "PDF"}
                </span>
                <span className="meta">
                  <b>{m.name}</b>
                  <span>{bytes(m.bytes)}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="a-empty">{search || type ? "No files match that search." : "No files yet. Upload the first one on the right."}</p>
        )}
      </section>

      <aside className="a-stack">
        <section className="a-panel a-panel-pad">
          <h2 style={{ marginBottom: "0.8rem" }}>Upload</h2>
          <ActionForm action={uploadMedia} resetOnSuccess onSuccess={() => router.refresh()}>
            {(pending) => (
              <>
                <div className="a-field">
                  <label htmlFor="files">Files</label>
                  <input id="files" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,application/pdf" required />
                  <span className="hint">JPG, PNG, WebP, AVIF, GIF or PDF, up to 15 MB each.</span>
                </div>
                <div className="a-field">
                  <label htmlFor="alt">Alt text (optional)</label>
                  <input id="alt" name="alt" type="text" placeholder="Describe the image for screen readers" />
                </div>
                <SubmitButton pending={pending}>{pending ? "Uploading" : "Upload"}</SubmitButton>
              </>
            )}
          </ActionForm>
        </section>

        {selected && (
          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.9rem" }}>
            <h2 style={{ overflowWrap: "anywhere" }}>{selected.name}</h2>
            {selected.mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.url} alt={selected.alt} style={{ width: "100%", borderRadius: 6, border: "1px solid var(--a-line)" }} />
            ) : (
              <a href={selected.url} target="_blank" rel="noopener" className="a-btn secondary">
                Open PDF
              </a>
            )}
            <dl className="a-kv">
              <dt>Address</dt>
              <dd>
                <code style={{ fontSize: "0.82rem" }}>{selected.url}</code>{" "}
                <button
                  type="button"
                  className="a-btn ghost sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(selected.url).then(() => setCopied(true)).catch(() => {});
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </dd>
              {selected.width && (
                <>
                  <dt>Size</dt>
                  <dd>
                    {selected.width}×{selected.height}, {bytes(selected.bytes)}
                  </dd>
                </>
              )}
              <dt>Uploaded</dt>
              <dd>
                {fmtDateTime(selected.created)}
                {selected.by ? ` by ${selected.by}` : ""}
              </dd>
              <dt>Used in</dt>
              <dd>{usage === null ? "Checking…" : usage.length ? usage.map((u) => `${u.where} (${u.ref})`).join(", ") : "Not used anywhere"}</dd>
            </dl>
            <ActionForm action={updateMediaAlt} onSuccess={() => router.refresh()}>
              {(pending) => (
                <>
                  <input type="hidden" name="id" value={selected.id} />
                  <div className="a-field">
                    <label htmlFor="alt-edit">Alt text</label>
                    <input id="alt-edit" name="alt" type="text" defaultValue={selected.alt} key={selected.id} />
                  </div>
                  <div>
                    <SubmitButton pending={pending} className="a-btn secondary sm">
                      Save alt text
                    </SubmitButton>
                  </div>
                </>
              )}
            </ActionForm>
            {canDelete && (
              <ConfirmAction
                action={deleteMedia}
                fields={{ id: selected.id }}
                label="Delete file"
                title="Delete this file?"
                message={usage?.length ? "This file is still used on the site, so it cannot be deleted yet." : "The file is removed from the server. This cannot be undone."}
                onDone={(r) => {
                  if (r.ok) {
                    setSelected(null);
                    router.refresh();
                  }
                }}
              />
            )}
          </section>
        )}
      </aside>
    </div>
  );
}
