import "server-only";
import { q } from "./db";

export type EnquiryFilters = {
  status?: string;
  interest?: string;
  programme?: string;
  assigned?: string;
  from?: string;
  to?: string;
  q?: string;
};

/** Builds a parameterised WHERE clause from the list filters (shared by the list and the CSV export). */
export function enquiryWhere(f: EnquiryFilters) {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    params.push(v);
    where.push(sql.replace("?", `$${params.length}`));
  };
  if (f.status === "open") where.push(`e.status IN ('contacted','booked')`);
  else if (f.status && ["new", "contacted", "booked", "engaged", "closed"].includes(f.status)) add(`e.status = ?`, f.status);
  if (f.interest) add(`e.interest = ?`, f.interest);
  if (f.programme) add(`e.programme = ?`, f.programme);
  if (f.assigned === "none") where.push(`e.assigned_to IS NULL`);
  else if (f.assigned && /^\d+$/.test(f.assigned)) add(`e.assigned_to = ?`, Number(f.assigned));
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) add(`e.created_at >= (?::date AT TIME ZONE 'Asia/Karachi')`, f.from);
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) add(`e.created_at < ((?::date + 1) AT TIME ZONE 'Asia/Karachi')`, f.to);
  if (f.q) {
    params.push(`%${f.q.slice(0, 100).replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
    const n = params.length;
    where.push(`(e.name ILIKE $${n} OR e.email ILIKE $${n} OR e.organisation ILIKE $${n} OR e.phone ILIKE $${n} OR e.message ILIKE $${n})`);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

export async function enquiryFilterOptions() {
  const [interests, programmes, staff] = await Promise.all([
    q<{ v: string }>(`SELECT DISTINCT interest AS v FROM enquiries WHERE interest IS NOT NULL ORDER BY 1`),
    q<{ v: string }>(`SELECT DISTINCT programme AS v FROM enquiries WHERE programme IS NOT NULL ORDER BY 1`),
    q<{ id: string; name: string }>(`SELECT id, name FROM users WHERE disabled = false AND role IN ('admin','editor') ORDER BY name`),
  ]);
  return { interests: interests.map((r) => r.v), programmes: programmes.map((r) => r.v), staff: staff.map((s) => ({ id: Number(s.id), name: s.name })) };
}
