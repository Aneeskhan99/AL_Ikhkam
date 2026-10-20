"use client";

// Bilingual form fields used by the Programmes, Faculty, SEO and Settings screens.
// Inputs are named "<name>.en" and "<name>.ur"; lists are one item per line.

import { useState } from "react";
import MediaPicker from "./MediaPicker";

type L = { en: string; ur: string };

export function BiField({
  name,
  label,
  value,
  type = "text",
  hint,
  required,
}: {
  name: string;
  label: string;
  value: L | { en: string[]; ur: string[] };
  type?: "text" | "textarea" | "list";
  hint?: string;
  required?: boolean;
}) {
  const val = (l: "en" | "ur") => {
    const v = (value as Record<string, unknown>)[l];
    return Array.isArray(v) ? v.join("\n") : String(v ?? "");
  };
  const input = (l: "en" | "ur") => {
    const common = {
      id: `${name}.${l}`,
      name: `${name}.${l}`,
      defaultValue: val(l),
      ...(l === "ur" ? { lang: "ur", dir: "rtl" as const } : {}),
      required: required && l === "en",
    };
    if (type === "text") return <input type="text" {...common} />;
    const lines = val(l).split("\n").length;
    return <textarea rows={type === "list" ? Math.max(3, lines + 1) : Math.min(14, Math.max(3, Math.ceil(val(l).length / 90) + lines))} {...common} />;
  };
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="pe-langs">
        <div className="pe-lang">
          <label className="tag" htmlFor={`${name}.en`}>
            English
          </label>
          {input("en")}
        </div>
        <div className="pe-lang">
          <label className="tag" htmlFor={`${name}.ur`}>
            اردو
          </label>
          {input("ur")}
        </div>
      </div>
      {(hint || type === "list") && <span className="hint">{hint || "One item per line."}</span>}
    </div>
  );
}

export function ImageField({ name, label, value, hint }: { name: string; label: string; value: string; hint?: string }) {
  const [v, setV] = useState(value);
  const [open, setOpen] = useState(false);
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="pe-image">
        {v ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v} alt="" />
        ) : (
          <div style={{ width: 160, height: 100, borderRadius: 6, border: "1px dashed var(--a-line)", display: "grid", placeItems: "center" }} className="a-small a-muted">
            No image
          </div>
        )}
        <div className="a-stack" style={{ gap: "0.5rem" }}>
          <input type="text" name={name} value={v} onChange={(e) => setV(e.target.value)} placeholder="/media/… or https://…" />
          <div className="a-row">
            <button type="button" className="a-btn secondary sm" onClick={() => setOpen(true)}>
              Choose from media library
            </button>
            {v && (
              <button type="button" className="a-btn ghost sm" onClick={() => setV("")}>
                Remove
              </button>
            )}
          </div>
          {hint && <span className="hint">{hint}</span>}
        </div>
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(m) => {
            setV(m.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
