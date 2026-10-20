import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import { serviceAnchor } from "@/lib/content/advisory";
import { isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("advisory", locale, { title: d.advisory.title, description: d.advisory.lede, path: "/advisory" });
}

export default async function AdvisoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = await getContent(locale);
  const a = d.advisory;
  const { services, deliverables, processSteps } = d.advisoryContent;

  return (
    <>
      <PageHead title={a.title} lede={a.lede} />

      <div className="wrap" style={{ paddingTop: "clamp(2rem, 5vw, 3.5rem)" }}>
        <div className="wide-img">
          <Image src={d.images.advisory} alt="" fill priority sizes="100vw" style={{ objectPosition: "50% 60%" }} />
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">{a.servicesTitle}</h2>
          </div>
          <div>
            {services.map((s, i) => (
              <article key={i} id={serviceAnchor(i)} className="service">
                <h3 className="h3">{s.title}</h3>
                <div className="service-body">
                  <p>{s.summary}</p>
                  <ul className="check-list">
                    {s.points.map((pt, j) => (
                      <li key={j}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap two-col">
          <div className="panel">
            <h2 className="h3">{a.deliverTitle}</h2>
            <ul className="check-list">
              {deliverables.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h2 className="h3">{a.whoTitle}</h2>
            <ul className="check-list">
              {a.who.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">{a.processTitle}</h2>
          </div>
          <ol className="steps">
            {processSteps.map((s, i) => (
              <li key={i}>
                <h3 className="h4">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div style={{ display: "grid", gap: "2rem", marginTop: "clamp(3rem, 6vw, 4.5rem)", justifyItems: "start" }}>
            <p className="note">{a.note}</p>
            <Link href={`/${locale}/contact?interest=0`} className="btn btn-primary">
              {a.cta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
