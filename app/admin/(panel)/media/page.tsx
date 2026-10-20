import { can, requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { mediaUrl } from "@/lib/server/media";
import MediaLibrary from "./MediaLibrary";

export const metadata = { title: "Media library" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const user = await requirePage("media.upload");
  const sp = await searchParams;
  const search = (sp.q || "").slice(0, 80);
  const type = sp.type === "pdf" ? "pdf" : sp.type === "image" ? "image" : "";
  const like = `%${search.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await q<{ id: string; file: string; original_name: string | null; alt: string; mime: string; width: number | null; height: number | null; bytes: number; created_at: Date; name: string | null }>(
    `SELECT m.id, m.file, m.original_name, m.alt, m.mime, m.width, m.height, m.bytes, m.created_at, u.name
       FROM media m LEFT JOIN users u ON u.id = m.uploaded_by
      WHERE ($1 = '%%' OR m.original_name ILIKE $1 OR m.alt ILIKE $1 OR m.file ILIKE $1)
        AND ($2 = '' OR ($2 = 'image' AND m.mime LIKE 'image/%') OR ($2 = 'pdf' AND m.mime = 'application/pdf'))
      ORDER BY m.created_at DESC LIMIT 300`,
    [like, type],
  );
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Media library</h1>
          <p>Images are resized to at most 2400 pixels and compressed when uploaded. Files that are still used on the site cannot be deleted.</p>
        </div>
      </div>
      <MediaLibrary
        canDelete={can(user, "media.delete")}
        search={search}
        type={type}
        items={rows.map((r) => ({
          id: Number(r.id),
          url: mediaUrl(r.file),
          name: r.original_name || r.file,
          alt: r.alt,
          mime: r.mime,
          width: r.width,
          height: r.height,
          bytes: r.bytes,
          created: r.created_at.toISOString(),
          by: r.name,
        }))}
      />
    </>
  );
}
