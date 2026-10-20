import Link from "next/link";

// Rendered for unknown pages. Shown in both languages because Next.js does not pass the locale here.
export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap nf">
        <h1 className="h2">This page does not exist</h1>
        <p className="lede">The link may be old or mistyped. Try the home page or the programme list.</p>
        <p className="lede" lang="ur" dir="rtl" style={{ fontFamily: "var(--font-urdu)", lineHeight: 2.2 }}>
          یہ صفحہ موجود نہیں۔ ہوم پیج یا پروگراموں کی فہرست دیکھیں۔
        </p>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/en" className="btn btn-primary">Go to the home page</Link>
          <Link href="/en/academy" className="link">See the programmes</Link>
        </div>
      </div>
    </section>
  );
}
