import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  (await draftMode()).disable();
  (await cookies()).delete("__prerender_bypass");
  const back = request.headers.get("referer");
  let path = "/en";
  if (back) {
    try {
      const u = new URL(back);
      if (/^\/(en|ur)(\/|$)/.test(u.pathname)) path = u.pathname;
    } catch {
      /* keep default */
    }
  }
  redirect(path);
}
