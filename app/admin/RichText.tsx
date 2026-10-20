"use client";

import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import MediaPicker from "./MediaPicker";

/** Keeps the class/lang/dir attributes used for Arabic quotations (class="arabic" lang="ar"). */
const TextAttributes = Extension.create({
  name: "textAttributes",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          class: { default: null, parseHTML: (el) => (el.getAttribute("class") === "arabic" ? "arabic" : null), renderHTML: (a) => (a.class ? { class: a.class } : {}) },
          lang: { default: null, parseHTML: (el) => el.getAttribute("lang"), renderHTML: (a) => (a.lang ? { lang: a.lang } : {}) },
        },
      },
    ];
  },
});

export default function RichText({ value, onChange, rtl = false, placeholder }: { value: string; onChange: (html: string) => void; rtl?: boolean; placeholder?: string }) {
  const [picking, setPicking] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } } }),
      Image.configure({ inline: false }),
      TextAttributes,
    ],
    content: value || "",
    editorProps: { attributes: { "aria-label": placeholder || "Article body", ...(placeholder ? { "data-placeholder": placeholder } : {}) } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            arabic: e.isActive("paragraph", { class: "arabic" }),
          }
        : null,
  });

  if (!editor) return <div className="rt" style={{ minHeight: 360 }} />;
  const s = state || ({} as Record<string, boolean>);
  const btn = (label: string, active: boolean | undefined, run: () => void, title?: string) => (
    <button type="button" aria-pressed={Boolean(active)} title={title || label} onMouseDown={(e) => e.preventDefault()} onClick={run}>
      {label}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://… or /en/…). Leave empty to remove the link.", prev || "https://");
    if (url === null) return;
    if (!url.trim() || url === "https://") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="rt">
      <div className="rt-bar" role="toolbar" aria-label="Formatting">
        {btn("B", s.bold, () => editor.chain().focus().toggleBold().run(), "Bold")}
        {btn("I", s.italic, () => editor.chain().focus().toggleItalic().run(), "Italic")}
        <span className="sep" />
        {btn("Heading", s.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn("Subheading", s.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <span className="sep" />
        {btn("• List", s.ul, () => editor.chain().focus().toggleBulletList().run(), "Bulleted list")}
        {btn("1. List", s.ol, () => editor.chain().focus().toggleOrderedList().run(), "Numbered list")}
        {btn("Quote", s.quote, () => editor.chain().focus().toggleBlockquote().run())}
        {btn(
          "Arabic",
          s.arabic,
          () =>
            s.arabic
              ? editor.chain().focus().updateAttributes("paragraph", { class: null, lang: null }).run()
              : editor.chain().focus().setParagraph().updateAttributes("paragraph", { class: "arabic", lang: "ar" }).run(),
          "Arabic text such as a Quranic verse (set in Amiri, right to left)",
        )}
        <span className="sep" />
        {btn("Link", s.link, setLink)}
        {btn("Image", false, () => setPicking(true), "Insert an image from the media library")}
        <span className="sep" />
        {btn("Undo", false, () => editor.chain().focus().undo().run())}
        {btn("Redo", false, () => editor.chain().focus().redo().run())}
      </div>
      <div className="rt-content" dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ur" : "en"}>
        <EditorContent editor={editor} />
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(m) => {
            editor.chain().focus().setImage({ src: m.url, alt: m.alt || "" }).run();
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
