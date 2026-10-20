"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listMedia, uploadMedia, type MediaItem } from "./actions/media";
import { bytes } from "./format";
import { ActionForm, SubmitButton } from "./ui";

/** A modal to choose an image from the media library, or upload a new one. */
export default function MediaPicker({ onPick, onClose, images = true }: { onPick: (m: MediaItem) => void; onClose: () => void; images?: boolean }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const load = useCallback(async (s: string) => {
    try {
      setItems(await listMedia(s, images));
    } catch {
      setItems([]);
    }
  }, [images]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search, load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Rendered into <body> so it can be used inside other forms without nesting <form> elements.
  return createPortal(
    <div className="m-picker" role="dialog" aria-modal="true" aria-label="Choose from the media library" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-picker-box">
        <div className="a-panel-head" style={{ flexWrap: "wrap" }}>
          <h2>Media library</h2>
          <div className="a-row" style={{ flex: "1 1 320px", justifyContent: "flex-end" }}>
            <input type="search" placeholder="Search by name or alt text" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
            <ActionForm action={uploadMedia} className="a-row" onSuccess={() => load(search)} resetOnSuccess>
              {(pending) => (
                <>
                  <input type="file" name="files" accept={images ? "image/*" : "image/*,application/pdf"} multiple required style={{ maxWidth: 220 }} />
                  <SubmitButton pending={pending} className="a-btn secondary sm">
                    {pending ? "Uploading" : "Upload"}
                  </SubmitButton>
                </>
              )}
            </ActionForm>
          </div>
        </div>
        <div className="m-grid">
          {items === null && <p className="a-muted">Loading…</p>}
          {items?.length === 0 && <p className="a-muted">No files yet. Upload one above.</p>}
          {items?.map((m) => (
            <button
              type="button"
              key={m.id}
              className="m-card"
              aria-pressed={selected?.id === m.id}
              onClick={() => setSelected(m)}
              onDoubleClick={() => onPick(m)}
            >
              <span className="thumb" style={m.mime.startsWith("image/") ? { backgroundImage: `url(${m.url})` } : undefined}>
                {!m.mime.startsWith("image/") && "PDF"}
              </span>
              <span className="meta">
                <b>{m.name}</b>
                <span>
                  {m.width && m.height ? `${m.width}×${m.height}, ` : ""}
                  {bytes(m.bytes)}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="a-dialog-foot" style={{ borderTop: "1px solid var(--a-line-2)" }}>
          <button type="button" className="a-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="a-btn" disabled={!selected} onClick={() => selected && onPick(selected)}>
            Use selected file
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
