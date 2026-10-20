import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser, isHttps } from "@/lib/server/auth";

// Turns on Draft Mode for a signed-in editor and opens the requested page with unpublished changes.
// GET /api/preview?path=/en/advisory
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  const url = new URL(request.url);
  const raw = url.searchParams.get("path") || "/en";
  const path = /^\/(en|ur)(\/[a-z0-9\-/]*)?$/i.test(raw) ? raw : "/en";

  const draft = await draftMode();
  draft.enable();

  // Next.js marks the preview cookie "Secure" in production, which browsers ignore on plain http
  // (for example http://192.168.x.x:3005). Re-issue it without Secure when the site is not on https.
  if (!(await isHttps())) {
    const jar = await cookies();
    const value = jar.get("__prerender_bypass")?.value;
    if (value) jar.set("__prerender_bypass", value, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  }

  redirect(path);
}
