import Link from "next/link";
import { notFound } from "next/navigation";
import { can, requirePage } from "@/lib/server/auth";
import { one } from "@/lib/server/db";
import { fmtDateTime, toLocalInput } from "../../../format";
import PostEditor from "./PostEditor";

export const metadata = { title: "Edit article" };

type L = { en: string; ur: string };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePage("posts.own");
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const p = await one<{
    id: string;
    slug: string;
    status: string;
    publish_at: Date | null;
    author_id: string | null;
    image: string | null;
    tags: string[];
    data: { title: L; excerpt: L; topic: L; body: L; imageAlt: L };
    seo: { title?: L; description?: L; ogImage?: string; noindex?: boolean; canonical?: string };
    autosave: { title: L; excerpt: L; topic: L; body: L; imageAlt: L } | null;
    autosaved_at: Date | null;
    updated_at: Date;
    author: string | null;
  }>(`SELECT p.*, u.name AS author FROM posts p LEFT JOIN users u ON u.id = p.author_id WHERE p.id = $1`, [id]);
  if (!p) notFound();
  if (!can(user, "posts.all") && Number(p.author_id) !== user.id) notFound();

  const empty = { en: "", ur: "" };
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/insights" className="a-crumb">
            Insights
          </Link>
          <h1>{p.data.title.en || p.data.title.ur || "Untitled article"}</h1>
          <p>
            {p.author ? `By ${p.author}. ` : ""}Last saved {fmtDateTime(p.updated_at)}.
          </p>
        </div>
      </div>
      <PostEditor
        id={Number(p.id)}
        status={p.status}
        canPublish={can(user, "posts.publish")}
        initial={{
          title: p.data.title,
          excerpt: p.data.excerpt,
          topic: p.data.topic,
          body: p.data.body,
          imageAlt: p.data.imageAlt || empty,
          slug: p.slug.startsWith("untitled-") ? "" : p.slug,
          image: p.image || "",
          tags: (p.tags || []).join(", "),
          publishAt: toLocalInput(p.publish_at),
          seo: {
            title: p.seo?.title || empty,
            description: p.seo?.description || empty,
            ogImage: p.seo?.ogImage || "",
            noindex: Boolean(p.seo?.noindex),
            canonical: p.seo?.canonical || "",
          },
        }}
        autosave={p.autosave && p.autosaved_at && p.autosaved_at > p.updated_at ? { data: p.autosave, at: fmtDateTime(p.autosaved_at) } : null}
        currentSlug={p.slug}
      />
    </>
  );
}
