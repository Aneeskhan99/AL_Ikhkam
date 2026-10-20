import { can, currentUser } from "@/lib/server/auth";
import { audit } from "@/lib/server/audit";
import { q } from "@/lib/server/db";
import { enquiryWhere } from "@/lib/server/enquiries";

// GET /admin/enquiries/export?status=...  CSV of the filtered enquiries (session and role checked).
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !can(user, "enquiries.manage")) return new Response("Not allowed", { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
  const { sql, params } = enquiryWhere(sp);
  const rows = await q<Record<string, unknown>>(
    `SELECT e.id, e.created_at, e.status, e.name, e.email, e.phone, e.organisation, e.interest, e.programme, e.message, e.locale,
            u.name AS assigned_to, e.source_page, e.landing_page, e.referrer, e.utm
       FROM enquiries e LEFT JOIN users u ON u.id = e.assigned_to ${sql} ORDER BY e.created_at DESC LIMIT 10000`,
    params,
  );
  const cols = ["id", "created_at", "status", "name", "email", "phone", "organisation", "interest", "programme", "message", "locale", "assigned_to", "source_page", "landing_page", "referrer", "utm"];
  const cell = (v: unknown) => {
    let s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    // Stop spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  await audit(user.id, "export", "enquiry", null, `exported ${rows.length} enquiries to CSV`);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="al-ihkam-enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
