// Display helpers shared by admin pages (server and client).

const tz = "Asia/Karachi";

export function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-GB", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { timeZone: tz, day: "numeric", month: "short", year: "numeric" });
}

/** Value for <input type="datetime-local"> in Pakistan time. */
export function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  const pk = new Date(date.getTime() + 5 * 60 * 60 * 1000);
  return pk.toISOString().slice(0, 16);
}

/** Parse a datetime-local value entered in Pakistan time (UTC+5). */
export function fromLocalInput(v: string) {
  if (!v) return null;
  const d = new Date(`${v}:00+05:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Consultation booked",
  engaged: "Engaged",
  closed: "Closed",
};

export const enquiryStatuses = ["new", "contacted", "booked", "engaged", "closed"] as const;

export const postStatusLabels: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  scheduled: "Scheduled",
  published: "Published",
};

export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
