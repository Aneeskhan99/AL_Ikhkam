import "server-only";
import { revalidatePath } from "next/cache";
import { localisedPaths } from "../content-schema";

/**
 * Refresh only the public pages affected by a change.
 * Paths are written without the language prefix: "/", "/advisory", "/academy/*", or "*" for every page.
 */
export function refreshPublic(paths: string[]) {
  for (const path of paths) {
    if (path === "*") {
      revalidatePath("/[locale]", "layout");
      revalidatePath("/sitemap.xml");
      return;
    }
    if (path === "/academy/*") {
      revalidatePath("/[locale]/academy/[slug]", "page");
      continue;
    }
    if (path === "/insights/*") {
      revalidatePath("/[locale]/insights/[slug]", "page");
      continue;
    }
    for (const p of localisedPaths(path)) revalidatePath(p);
  }
}
