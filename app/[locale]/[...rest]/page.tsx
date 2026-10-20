import { notFound } from "next/navigation";

// Any unknown path under a language renders the site's own 404 page.
export default function CatchAll() {
  notFound();
}
