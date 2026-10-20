import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { defaultValue, fieldsFor, pageGroups } from "@/lib/content-schema";
import { fmtDateTime } from "../../../format";
import PageEditor, { type EditorField } from "./PageEditor";

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }) {
  const { group: gid } = await params;
  const g = pageGroups.find((x) => x.id === gid);
  return { title: g ? `Edit ${g.label}` : "Pages" };
}

export default async function EditPage({ params }: { params: Promise<{ group: string }> }) {
  await requirePage("pages.edit");
  const { group: id } = await params;
  const group = pageGroups.find((g) => g.id === id);
  if (!group) notFound();
  const fields = fieldsFor(group);
  const keys = fields.map((f) => f.key);

  const rows = await q<{ key: string; locale: string; published: unknown; draft: unknown; draft_reset: boolean; updated_at: Date; name: string | null }>(
    `SELECT c.key, c.locale, c.published, c.draft, c.draft_reset, c.updated_at, u.name
       FROM content_fields c LEFT JOIN users u ON u.id = c.updated_by WHERE c.key = ANY($1)`,
    [keys],
  );
  const history = await q<{ key: string; locale: string; action: string; old_value: unknown; new_value: unknown; created_at: Date; name: string | null }>(
    `SELECT h.key, h.locale, h.action, h.old_value, h.new_value, h.created_at, u.name
       FROM content_history h LEFT JOIN users u ON u.id = h.user_id
      WHERE h.key = ANY($1) ORDER BY h.created_at DESC LIMIT 40`,
    [keys],
  );

  const byKey = new Map(rows.map((r) => [`${r.key}|${r.locale}`, r]));
  const editorFields: EditorField[] = fields.map((f) => {
    const locales = f.shared ? (["*"] as const) : (["en", "ur"] as const);
    return {
      ...f,
      values: locales.map((locale) => {
        const r = byKey.get(`${f.key}|${locale}`);
        const def = defaultValue(f.key, locale);
        return {
          locale,
          defaultValue: def,
          published: r?.published ?? null,
          draft: r?.draft ?? null,
          draftReset: Boolean(r?.draft_reset),
          updatedBy: r?.name || null,
          updatedAt: r ? fmtDateTime(r.updated_at) : null,
        };
      }),
    };
  });
  const labelFor = new Map(fields.map((f) => [f.key, f.label]));

  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/pages" className="a-crumb">
            Pages
          </Link>
          <h1>{group.label}</h1>
          <p>{group.description}</p>
        </div>
      </div>
      <PageEditor
        groupId={group.id}
        previewPaths={{ en: `/en${group.previewPath}`, ur: `/ur${group.previewPath}` }}
        fields={editorFields}
        history={history.map((h) => ({
          label: labelFor.get(h.key) || h.key,
          locale: h.locale,
          action: h.action,
          oldValue: h.old_value,
          newValue: h.new_value,
          when: fmtDateTime(h.created_at),
          who: h.name || "Someone",
        }))}
      />
    </>
  );
}
