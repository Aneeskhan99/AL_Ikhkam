"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import type { FieldDef } from "@/lib/content-schema";
import { discardPageDrafts, resetPageToDefault, savePageDraft } from "../../../actions/pages";
import MediaPicker from "../../../MediaPicker";
import { ConfirmAction, Toast, useCsrf } from "../../../ui";

type LocaleKey = "en" | "ur" | "*";

export type EditorField = FieldDef & {
  values: {
    locale: LocaleKey;
    defaultValue: unknown;
    published: unknown;
    draft: unknown;
    draftReset: boolean;
    updatedBy: string | null;
    updatedAt: string | null;
  }[];
};

type HistoryItem = { label: string; locale: string; action: string; oldValue: unknown; newValue: unknown; when: string; who: string };

type Cell = { value: unknown; reset: boolean; dirty: boolean };

const langName: Record<string, string> = { en: "English", ur: "اردو", "*": "Both languages" };

function initial(fields: EditorField[]) {
  const state: Record<string, Cell> = {};
  for (const f of fields) {
    for (const v of f.values) {
      const value = v.draftReset ? v.defaultValue : v.draft ?? v.published ?? v.defaultValue;
      state[`${f.key}|${v.locale}`] = { value, reset: false, dirty: false };
    }
  }
  return state;
}

function preview(v: unknown): string {
  if (v == null) return "(original text)";
  if (typeof v === "string") return v.length > 140 ? `${v.slice(0, 140)}…` : v;
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  return "…";
}

export default function PageEditor({
  groupId,
  previewPaths,
  fields,
  history,
}: {
  groupId: string;
  previewPaths: { en: string; ur: string };
  fields: EditorField[];
  history: HistoryItem[];
}) {
  const router = useRouter();
  const csrf = useCsrf();
  const [cells, setCells] = useState<Record<string, Cell>>(() => initial(fields));
  const [previewWin, setPreviewWin] = useState<{ win: Window | null; path: string } | null>(null);
  useEffect(() => setCells(initial(fields)), [fields]);

  const [result, action, pending] = useActionState(savePageDraft, null);
  useEffect(() => {
    if (result?.ok) {
      router.refresh();
      if (previewWin) {
        const url = `/api/preview?path=${encodeURIComponent(previewWin.path)}`;
        if (previewWin.win && !previewWin.win.closed) previewWin.win.location.href = url;
        else window.open(url, "aih-preview");
        setPreviewWin(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const dirtyCount = useMemo(() => Object.values(cells).filter((c) => c.dirty).length, [cells]);
  const pendingCount = useMemo(() => fields.reduce((n, f) => n + f.values.filter((v) => v.draft != null || v.draftReset).length, 0), [fields]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirtyCount) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount]);

  const set = (id: string, value: unknown) => setCells((c) => ({ ...c, [id]: { value, reset: false, dirty: true } }));
  const resetCell = (id: string, def: unknown) => setCells((c) => ({ ...c, [id]: { value: def, reset: true, dirty: true } }));
  const undoCell = (id: string, f: EditorField, locale: LocaleKey) =>
    setCells((c) => {
      const v = f.values.find((x) => x.locale === locale)!;
      return { ...c, [id]: { value: v.draftReset ? v.defaultValue : v.draft ?? v.published ?? v.defaultValue, reset: false, dirty: false } };
    });

  const submit = (intent: "draft" | "publish" | "preview", lang?: "en" | "ur") => {
    const changes = Object.entries(cells)
      .filter(([, c]) => c.dirty)
      .map(([id, c]) => {
        const [key, locale] = id.split("|");
        return c.reset ? { key, locale, reset: true } : { key, locale, value: c.value };
      });
    if (intent === "preview") {
      const path = previewPaths[lang || "en"];
      if (!changes.length) {
        window.open(`/api/preview?path=${encodeURIComponent(path)}`, "aih-preview");
        return;
      }
      setPreviewWin({ win: window.open("about:blank", "aih-preview"), path });
    }
    const fd = new FormData();
    fd.set("csrf", csrf);
    fd.set("group", groupId);
    fd.set("changes", JSON.stringify(changes));
    fd.set("intent", intent === "publish" ? "publish" : "draft");
    startTransition(() => action(fd));
  };

  let lastSection = "";

  return (
    <>
      <div className="pe-sticky">
        <div className="a-panel a-panel-pad" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span className="a-small a-muted">
            {dirtyCount ? `${dirtyCount} change${dirtyCount === 1 ? "" : "s"} not saved yet. ` : ""}
            {pendingCount ? `${pendingCount} saved draft change${pendingCount === 1 ? "" : "s"} not published.` : dirtyCount ? "" : "Everything here is live."}
          </span>
          <div className="a-row">
            <button type="button" className="a-btn secondary" disabled={pending} onClick={() => submit("draft")}>
              Save draft
            </button>
            <button type="button" className="a-btn secondary" disabled={pending} onClick={() => submit("preview", "en")}>
              Preview English
            </button>
            <button type="button" className="a-btn secondary" disabled={pending} onClick={() => submit("preview", "ur")}>
              Preview Urdu
            </button>
            <button type="button" className="a-btn" disabled={pending || (!dirtyCount && !pendingCount)} onClick={() => submit("publish")}>
              {pending ? "Working" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="a-grid-main">
        <section className="a-panel">
          {fields.map((f) => {
            const section = f.type === "image" ? "images" : f.key.split(".")[0] + "." + (f.key.split(".")[1] || "");
            const sectionLabel = f.type === "image" ? "Images" : null;
            const showSection = sectionLabel && section !== lastSection;
            lastSection = section;
            return (
              <div key={f.key}>
                {showSection && <div className="pe-section-title">{sectionLabel}</div>}
                <div className="pe-field">
                  <div className="pe-field-head">
                    <span>
                      <span className="name">{f.label}</span> <span className="key">{f.key}</span>
                    </span>
                  </div>
                  <div className={`pe-langs${f.values.length === 1 ? " one" : ""}`}>
                    {f.values.map((v) => {
                      const id = `${f.key}|${v.locale}`;
                      const cell = cells[id];
                      const isRtl = v.locale === "ur";
                      const changedFromDefault = JSON.stringify(cell?.value) !== JSON.stringify(v.defaultValue);
                      return (
                        <div className="pe-lang" key={v.locale}>
                          <div className="tag">
                            <span>{langName[v.locale]}</span>
                            {cell?.dirty ? (
                              <span className="a-badge danger">Not saved</span>
                            ) : v.draftReset ? (
                              <span className="a-badge draft-changes">Returns to original on publish</span>
                            ) : v.draft != null ? (
                              <span className="a-badge draft-changes">Draft</span>
                            ) : v.published != null ? (
                              <span className="a-badge published" title={v.updatedAt ? `Edited ${v.updatedAt}${v.updatedBy ? ` by ${v.updatedBy}` : ""}` : undefined}>
                                Edited, live
                              </span>
                            ) : null}
                            <span style={{ marginInlineStart: "auto", display: "flex", gap: "0.25rem" }}>
                              {cell?.dirty && (
                                <button type="button" className="a-btn ghost sm" onClick={() => undoCell(id, f, v.locale)}>
                                  Undo
                                </button>
                              )}
                              {(changedFromDefault || v.published != null) && !cell?.reset && (
                                <button type="button" className="a-btn ghost sm" onClick={() => resetCell(id, v.defaultValue)} title="Go back to the original text">
                                  Reset to default
                                </button>
                              )}
                            </span>
                          </div>
                          <FieldInput field={f} value={cell?.value} rtl={isRtl} onChange={(val) => set(id, val)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="a-stack">
          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
            <h2>Page actions</h2>
            <p className="a-small a-muted">Preview opens the real page in a new tab with your drafts. Only you see them until you publish.</p>
            <ConfirmAction
              action={discardPageDrafts}
              fields={{ group: groupId }}
              label="Discard unpublished drafts"
              title="Discard drafts?"
              message="Every saved draft on this page is removed. The live page does not change."
              confirmLabel="Discard drafts"
              className="a-btn secondary"
              onDone={() => router.refresh()}
            />
            <ConfirmAction
              action={resetPageToDefault}
              fields={{ group: groupId }}
              label="Reset whole page to original"
              title="Reset this page?"
              message="Every field is marked to return to its original text. Nothing changes on the live page until you publish."
              confirmLabel="Reset page"
              className="a-btn danger"
              onDone={() => router.refresh()}
            />
          </section>
          <section className="a-panel a-panel-pad">
            <h2 style={{ marginBottom: "0.6rem" }}>History</h2>
            {history.length ? (
              <ul className="a-timeline">
                {history.map((h, i) => (
                  <li key={i}>
                    <div>
                      <b>{h.who}</b> {h.action === "reset" ? "reset" : "published"} <b>{h.label}</b> ({langName[h.locale] || h.locale})
                    </div>
                    {h.action !== "reset" && <div className="a-small a-muted">{preview(h.newValue)}</div>}
                    <div className="when">{h.when}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="a-small a-muted">Nothing published from the admin yet.</p>
            )}
          </section>
        </aside>
      </div>
      <Toast result={result} />
    </>
  );
}

function FieldInput({ field, value, rtl, onChange }: { field: FieldDef; value: unknown; rtl: boolean; onChange: (v: unknown) => void }) {
  const langProps = rtl ? { lang: "ur", dir: "rtl" as const } : {};
  switch (field.type) {
    case "text":
      return <input type="text" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} {...langProps} />;
    case "textarea":
      return <textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} {...langProps} />;
    case "list":
      return <ListInput value={(value as string[]) || []} onChange={onChange} langProps={langProps} />;
    case "image":
      return <ImageInput value={String(value ?? "")} onChange={onChange} />;
    case "items":
      return <ItemsInput field={field} value={(value as Record<string, unknown>[]) || []} onChange={onChange} langProps={langProps} />;
  }
}

function ListInput({ value, onChange, langProps }: { value: string[]; onChange: (v: unknown) => void; langProps: object }) {
  return (
    <>
      <textarea rows={Math.max(3, value.length + 1)} value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} {...langProps} />
      <span className="hint a-small a-muted">One item per line.</span>
    </>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pe-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt="" />
      <div className="a-stack" style={{ gap: "0.5rem" }}>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
        <div>
          <button type="button" className="a-btn secondary sm" onClick={() => setOpen(true)}>
            Choose from media library
          </button>
        </div>
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(m) => {
            onChange(m.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ItemsInput({ field, value, onChange, langProps }: { field: FieldDef; value: Record<string, unknown>[]; onChange: (v: unknown) => void; langProps: object }) {
  const update = (i: number, name: string, v: unknown) => onChange(value.map((item, j) => (j === i ? { ...item, [name]: v } : item)));
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  const blank = () => Object.fromEntries((field.itemFields || []).map((f) => [f.name, f.type === "list" ? [] : ""]));
  return (
    <div className="a-stack" style={{ gap: "0.6rem" }}>
      {value.map((item, i) => (
        <div className="pe-item" key={i}>
          <div className="pe-item-head">
            <span>Card {i + 1}</span>
            <span className="a-row" style={{ gap: "0.2rem" }}>
              <button type="button" className="a-btn ghost sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                Up
              </button>
              <button type="button" className="a-btn ghost sm" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                Down
              </button>
              <button type="button" className="a-btn ghost sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Remove
              </button>
            </span>
          </div>
          {(field.itemFields || []).map((f) => (
            <div className="a-field" key={f.name}>
              <label>{f.label}</label>
              {f.type === "list" ? (
                <ListInput value={(item[f.name] as string[]) || []} onChange={(v) => update(i, f.name, v)} langProps={langProps} />
              ) : f.type === "textarea" ? (
                <textarea rows={3} value={String(item[f.name] ?? "")} onChange={(e) => update(i, f.name, e.target.value)} {...langProps} />
              ) : (
                <input type="text" value={String(item[f.name] ?? "")} onChange={(e) => update(i, f.name, e.target.value)} {...langProps} />
              )}
            </div>
          ))}
        </div>
      ))}
      <div>
        <button type="button" className="a-btn secondary sm" onClick={() => onChange([...value, blank()])}>
          Add a card
        </button>
      </div>
    </div>
  );
}
