"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { autosavePost, deletePost, discardAutosave, savePost, type PostPayload } from "../../../actions/posts";
import { postStatusLabels } from "../../../format";
import MediaPicker from "../../../MediaPicker";
import RichText from "../../../RichText";
import { ConfirmAction, Toast, useCsrf } from "../../../ui";

type L = { en: string; ur: string };
type Lang = "en" | "ur";

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function PostEditor({
  id,
  status,
  canPublish,
  initial,
  autosave,
  currentSlug,
}: {
  id: number;
  status: string;
  canPublish: boolean;
  initial: PostPayload;
  autosave: { data: Pick<PostPayload, "title" | "excerpt" | "topic" | "body" | "imageAlt">; at: string } | null;
  currentSlug: string;
}) {
  const router = useRouter();
  const csrf = useCsrf();
  const [post, setPost] = useState<PostPayload>(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [dirty, setDirty] = useState(false);
  const [autoState, setAutoState] = useState<string>("");
  const [restoreOffer, setRestoreOffer] = useState(autosave);
  const [picking, setPicking] = useState<"image" | "og" | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [bodyKey, setBodyKey] = useState(0);
  const [result, action, pending] = useActionState(savePost, null);
  const handled = useRef<typeof result>(null);
  const latest = useRef(post);
  latest.current = post;

  // After a save, take the stored publish time and address back from the server.
  useEffect(() => {
    setPost((p) => ({ ...p, publishAt: initial.publishAt, slug: initial.slug || p.slug }));
  }, [initial.publishAt, initial.slug]);

  const live = status === "published" || status === "scheduled";
  const locked = live && !canPublish;

  useEffect(() => {
    if (result && result !== handled.current) {
      handled.current = result;
      if (result.ok) {
        setDirty(false);
        setAutoState("");
        router.refresh();
      }
    }
  }, [result, router]);

  // Autosave five seconds after the last change. Autosaves never change the live article.
  useEffect(() => {
    if (!dirty || locked) return;
    const t = setTimeout(async () => {
      setAutoState("Saving…");
      const r = await autosavePost(id, csrf, latest.current);
      setAutoState(r.ok ? `Autosaved ${new Date(r.at!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : r.error || "Autosave failed");
    }, 5000);
    return () => clearTimeout(t);
  }, [post, dirty, id, csrf, locked]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<PostPayload>) => {
    setPost((p) => {
      const next = { ...p, ...patch };
      if (!slugTouched && patch.title) next.slug = slugify(patch.title.en || "");
      return next;
    });
    setDirty(true);
  };
  const setPair = (name: "title" | "excerpt" | "topic" | "body" | "imageAlt", value: string) => update({ [name]: { ...post[name], [lang]: value } } as Partial<PostPayload>);
  const setSeo = (patch: Partial<PostPayload["seo"]>) => update({ seo: { ...post.seo, ...patch } });

  const submit = (intent: "draft" | "review" | "publish" | "unpublish") => {
    const fd = new FormData();
    fd.set("csrf", csrf);
    fd.set("id", String(id));
    fd.set("intent", intent);
    fd.set("payload", JSON.stringify(post));
    startTransition(() => action(fd));
  };

  const previewPath = `/${lang}/insights/${currentSlug}`;
  const rtl = lang === "ur";
  const langProps = rtl ? { lang: "ur", dir: "rtl" as const } : {};

  return (
    <>
      {restoreOffer && (
        <div className="a-note warn" style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <span>There are autosaved changes from {restoreOffer.at} that were never saved.</span>
          <button
            type="button"
            className="a-btn sm"
            onClick={() => {
              update({ ...restoreOffer.data });
              setBodyKey((k) => k + 1);
              setRestoreOffer(null);
            }}
          >
            Restore them
          </button>
          <ConfirmAction
            action={discardAutosave}
            fields={{ id }}
            label="Discard"
            title="Discard autosaved changes?"
            message="The editor keeps the last saved version."
            confirmLabel="Discard"
            className="a-btn secondary sm"
            onDone={() => setRestoreOffer(null)}
          />
        </div>
      )}
      {locked && <p className="a-note warn" style={{ marginBottom: "1rem" }}>This article is live, so only an editor or administrator can change it.</p>}

      <div className="a-grid-main">
        <section className="a-panel a-panel-pad a-stack">
          <div className="a-tabs" role="tablist" aria-label="Language">
            {(["en", "ur"] as const).map((l) => (
              <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)}>
                {l === "en" ? "English" : "اردو Urdu"}
                {l === "ur" && !post.title.ur && <span className="a-badge" style={{ marginInlineStart: 6 }}>empty</span>}
              </button>
            ))}
          </div>
          <div className="a-field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" value={post.title[lang]} onChange={(e) => setPair("title", e.target.value)} {...langProps} style={{ fontSize: "1.15rem", fontWeight: 600 }} />
          </div>
          <div className="a-field">
            <label htmlFor="excerpt">Summary</label>
            <textarea id="excerpt" rows={2} value={post.excerpt[lang]} onChange={(e) => setPair("excerpt", e.target.value)} {...langProps} />
            <span className="hint">Shown on article cards and in search results. One or two sentences.</span>
          </div>
          <div className="a-field">
            <span className="a-label">Body</span>
            <RichText
              key={`${lang}-${bodyKey}`}
              value={post.body[lang]}
              onChange={(html) => setPair("body", html)}
              rtl={rtl}
              placeholder={rtl ? "مضمون یہاں لکھیں" : "Write the article here"}
            />
            {lang === "ur" && <span className="hint">If the Urdu body is empty, Urdu readers see the English text.</span>}
          </div>
          <div className="a-grid-2">
            <div className="a-field">
              <label htmlFor="topic">Topic</label>
              <input id="topic" type="text" value={post.topic[lang]} onChange={(e) => setPair("topic", e.target.value)} {...langProps} />
            </div>
            <div className="a-field">
              <label htmlFor="imageAlt">Featured image description</label>
              <input id="imageAlt" type="text" value={post.imageAlt[lang]} onChange={(e) => setPair("imageAlt", e.target.value)} {...langProps} />
            </div>
          </div>
        </section>

        <aside className="a-stack">
          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
            <div className="a-row" style={{ justifyContent: "space-between" }}>
              <h2>Publishing</h2>
              <span className={`a-badge ${status}`}>{postStatusLabels[status]}</span>
            </div>
            <p className="a-small a-muted" aria-live="polite">
              {dirty ? "Unsaved changes. " : ""}
              {autoState}
            </p>
            <div className="a-field">
              <label htmlFor="publishAt">Publish date and time (Pakistan time)</label>
              <input id="publishAt" type="datetime-local" value={post.publishAt} onChange={(e) => update({ publishAt: e.target.value })} disabled={locked} />
              <span className="hint">Leave empty to publish now. A future time schedules the article.</span>
            </div>
            <div className="a-stack" style={{ gap: "0.5rem" }}>
              {canPublish ? (
                <>
                  <button type="button" className="a-btn" disabled={pending} onClick={() => submit("publish")}>
                    {live ? "Update live article" : post.publishAt && new Date(`${post.publishAt}:00+05:00`) > new Date() ? "Schedule" : "Publish"}
                  </button>
                  {!live && (
                    <button type="button" className="a-btn secondary" disabled={pending} onClick={() => submit("draft")}>
                      Save draft
                    </button>
                  )}
                  {live && (
                    <ConfirmAction
                      action={async (prev, fd) => {
                        fd.set("payload", JSON.stringify(post));
                        fd.set("intent", "unpublish");
                        return savePost(prev, fd);
                      }}
                      fields={{ id }}
                      label="Unpublish"
                      title="Take this article off the site?"
                      message="It becomes a draft again. You can publish it later."
                      confirmLabel="Unpublish"
                      className="a-btn secondary"
                      onDone={() => router.refresh()}
                    />
                  )}
                </>
              ) : (
                !locked && (
                  <>
                    <button type="button" className="a-btn secondary" disabled={pending} onClick={() => submit("draft")}>
                      Save draft
                    </button>
                    <button type="button" className="a-btn" disabled={pending} onClick={() => submit("review")}>
                      Send for review
                    </button>
                  </>
                )
              )}
              <a className="a-btn ghost" href={`/api/preview?path=${encodeURIComponent(previewPath)}`} target="aih-preview" title="Opens the article with your latest saved or autosaved text">
                Preview {lang === "en" ? "English" : "Urdu"}
              </a>
            </div>
          </section>

          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
            <h2>Article details</h2>
            <div className="a-field">
              <label htmlFor="slug">Address</label>
              <input
                id="slug"
                type="text"
                value={post.slug}
                placeholder={slugify(post.title.en) || "article-address"}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                }}
                disabled={locked}
              />
              <span className="hint">/insights/{post.slug || slugify(post.title.en) || "…"}</span>
            </div>
            <div className="a-field">
              <span className="a-label">Featured image</span>
              {post.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.image} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 6, border: "1px solid var(--a-line)" }} />
              ) : (
                <p className="a-small a-muted">None chosen. A default image is used.</p>
              )}
              <div className="a-row">
                <button type="button" className="a-btn secondary sm" onClick={() => setPicking("image")} disabled={locked}>
                  {post.image ? "Change image" : "Choose image"}
                </button>
                {post.image && (
                  <button type="button" className="a-btn ghost sm" onClick={() => update({ image: "" })} disabled={locked}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="a-field">
              <label htmlFor="tags">Tags</label>
              <input id="tags" type="text" value={post.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="zakat, shares, aaoifi" disabled={locked} />
              <span className="hint">Separate tags with commas.</span>
            </div>
          </section>

          <section className="a-panel a-panel-pad a-stack" style={{ gap: "0.8rem" }}>
            <h2>SEO ({lang === "en" ? "English" : "Urdu"})</h2>
            <div className="a-field">
              <label htmlFor="seoTitle">Search title</label>
              <input id="seoTitle" type="text" value={post.seo.title[lang]} placeholder={post.title[lang]} onChange={(e) => setSeo({ title: { ...post.seo.title, [lang]: e.target.value } })} {...langProps} />
              <span className="hint">{(post.seo.title[lang] || post.title[lang]).length} characters. Aim for under 60.</span>
            </div>
            <div className="a-field">
              <label htmlFor="seoDesc">Search description</label>
              <textarea id="seoDesc" rows={3} value={post.seo.description[lang]} placeholder={post.excerpt[lang]} onChange={(e) => setSeo({ description: { ...post.seo.description, [lang]: e.target.value } })} {...langProps} />
              <span className="hint">{(post.seo.description[lang] || post.excerpt[lang]).length} characters. Aim for 120 to 160.</span>
            </div>
            <div className="a-field">
              <span className="a-label">Share image</span>
              <div className="a-row">
                <input type="text" value={post.seo.ogImage} onChange={(e) => setSeo({ ogImage: e.target.value })} placeholder="Uses the featured image" />
                <button type="button" className="a-btn secondary sm" onClick={() => setPicking("og")}>
                  Choose
                </button>
              </div>
            </div>
            <div className="a-field">
              <label htmlFor="canonical">Canonical link</label>
              <input id="canonical" type="text" value={post.seo.canonical} onChange={(e) => setSeo({ canonical: e.target.value })} placeholder="Leave empty for this article's own address" />
            </div>
            <label className="a-check">
              <input type="checkbox" checked={post.seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked })} /> Hide from search engines (noindex)
            </label>
          </section>

          {(!live || canPublish) && (
            <ConfirmAction
              action={deletePost}
              fields={{ id }}
              label="Delete article"
              title="Delete this article?"
              message={live ? "It is removed from the website immediately. This cannot be undone." : "This cannot be undone."}
            />
          )}
        </aside>
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(null)}
          onPick={(m) => {
            if (picking === "image") update({ image: m.url, imageAlt: post.imageAlt.en ? post.imageAlt : { ...post.imageAlt, en: m.alt } });
            else setSeo({ ogImage: m.url });
            setPicking(null);
          }}
        />
      )}
      <Toast result={result} />
    </>
  );
}
