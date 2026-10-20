import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import Seal from "@/components/Seal";
import { isLocale } from "@/lib/i18n";
import { getContent, getFaculty } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("faculty", locale, { title: d.faculty.title, description: d.faculty.lede, path: "/faculty" });
}

export default async function FacultyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const f = (await getContent(locale)).faculty;
  const faculty = await getFaculty();

  return (
    <>
      <PageHead title={f.title} lede={f.lede} />
      <section className="section-tight">
        <div className="wrap">
          {faculty.map((m) => (
            <article key={m.slug} id={m.slug} className="profile">
              <div className="profile-portrait">
                {m.photo ? (
                  <Image src={m.photo} alt={m.name[locale]} fill sizes="220px" />
                ) : (
                  <Seal letter={m.initial} className="seal" title={m.name[locale]} />
                )}
              </div>
              <div className="profile-body">
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <h2 className="h3">{m.name[locale]}</h2>
                  <span className="role">{m.role[locale]}</span>
                  <span className="muted">{m.affiliation[locale]}</span>
                </div>
                <div className="bio">
                  {m.bio[locale]
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
                <div className="profile-cols">
                  <div>
                    <h3>{f.education}</h3>
                    <ul>
                      {m.education[locale].map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>{f.focus}</h3>
                    <ul>
                      {m.focus[locale].map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="profile-links">
                  {m.email && (
                    <a className="link" href={`mailto:${m.email}?subject=${encodeURIComponent("Enquiry from the Al-Ihkam website")}`}>
                      {f.contact}
                    </a>
                  )}
                  {m.links?.map((l) => (
                    <a key={l.href} className="link" href={l.href} target="_blank" rel="noopener">
                      {l.label[locale]}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
