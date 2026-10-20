import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import Seal from "@/components/Seal";
import { serviceAnchor } from "@/lib/content/advisory";
import { isLocale } from "@/lib/i18n";
import { getContent, getFaculty, getPosts, getProgrammes, getSettings, waLink } from "@/lib/server/content";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = await getContent(locale);
  const h = d.home;
  const s = await getSettings();
  const [programmes, faculty, posts] = await Promise.all([getProgrammes(), getFaculty(), getPosts()]);
  const p = (path: string) => `/${locale}${path}`;
  const preferred = ["introduction-to-islamic-finance", "sukuk-structuring-and-issuance", "aaoifi-standards-deep-dive", "zakat-masterclass"];
  const picked = programmes.filter((x) => preferred.includes(x.slug));
  const featured = picked.length >= 3 ? picked : programmes.slice(0, 4);
  const services = d.advisoryContent.services;
  const processSteps = d.advisoryContent.processSteps;
  const ceo = faculty.find((f) => f.slug === "zeeshan-rais-khattak");
  const ceoPhoto = ceo?.photo || "/faculty/zeeshan-rais-khattak.jpg";

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="kicker reveal-line">{h.kicker}</span>
              <h1 className="display hero-title reveal-line">{h.title}</h1>
              <p className="lede reveal-line">{h.lede}</p>
              <div className="hero-actions reveal-line">
                <Link href={p("/contact")} className="btn btn-primary">
                  {h.ctaPrimary}
                </Link>
                <Link href={p("/academy")} className="link">
                  {h.ctaSecondary}
                </Link>
              </div>
            </div>
            <figure className="hero-figure">
              <div className="hero-image">
                <Image
                  src={d.images.hero}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 45vw"
                />
              </div>
              <figcaption>{h.nameNote}</figcaption>
            </figure>
          </div>

          <div className="credentials">
            <div>
              <h2>{h.standardsTitle}</h2>
              <ul>
                {h.standards.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{h.facultyFromTitle}</h2>
              <ul>
                {h.facultyFrom.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome from the CEO */}
      <section className="section welcome" aria-labelledby="welcome-title">
        <div className="wrap welcome-grid">
          <figure className="welcome-portrait">
            <div className="welcome-photo">
              <Image src={ceoPhoto} alt={h.welcomeName} fill sizes="(max-width: 960px) 70vw, 30vw" />
            </div>
          </figure>
          <div className="welcome-copy">
            <span className="kicker" id="welcome-title">
              {h.welcomeKicker}
            </span>
            <p className="welcome-greeting">{h.welcomeGreeting}</p>
            {h.welcomeBody.map((para, i) => (
              <p key={i} className="body">
                {para}
              </p>
            ))}
            <div className="welcome-sign">
              <span className="welcome-name">{h.welcomeName}</span>
              <span className="welcome-role">{h.welcomeRole}</span>
            </div>
            <Link href={`${p("/faculty")}#zeeshan-rais-khattak`} className="link" style={{ justifySelf: "start" }}>
              {h.welcomeLink}
            </Link>
          </div>
        </div>
      </section>

      {/* Two practices */}
      <section className="section-tight">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">{h.practiceTitle}</h2>
          </div>
          <div className="practice">
            <div className="practice-col">
              <div className="practice-img">
                <Image src={d.images.advisory} alt="" fill sizes="(max-width: 960px) 100vw, 50vw" />
              </div>
              <h3 className="h3">{h.advisoryTitle}</h3>
              <p className="muted">{h.advisoryText}</p>
              <ul className="index-list">
                {services.map((sv, i) => (
                  <li key={i}>
                    <Link href={`${p("/advisory")}#${serviceAnchor(i)}`}>{sv.title}</Link>
                  </li>
                ))}
              </ul>
              <Link href={p("/advisory")} className="link" style={{ justifySelf: "start" }}>
                {h.advisoryLink}
              </Link>
            </div>
            <div className="practice-col">
              <div className="practice-img">
                <Image src={d.images.academy} alt="" fill sizes="(max-width: 960px) 100vw, 50vw" />
              </div>
              <h3 className="h3">{h.academyTitle}</h3>
              <p className="muted">{h.academyText}</p>
              <ul className="index-list">
                {featured.map((x) => (
                  <li key={x.slug}>
                    <Link href={p(`/academy/${x.slug}`)}>{x.title[locale]}</Link>
                    <span className="tag">{x.duration[locale]}</span>
                  </li>
                ))}
              </ul>
              <Link href={p("/academy")} className="link" style={{ justifySelf: "start" }}>
                {h.academyLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">{h.processTitle}</h2>
            <p className="lede">{h.processLede}</p>
          </div>
          <ol className="steps">
            {processSteps.map((st, i) => (
              <li key={i}>
                <h3 className="h4">{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The name */}
      <section className="name-band section">
        <div className="wrap name-grid">
          <p className="name-verse" lang="ar">
            {h.nameVerse}
          </p>
          <div className="name-copy">
            <span className="kicker">{h.nameTitle}</span>
            <p className="name-translation">{h.nameTranslation}</p>
            <span className="name-ref">{h.nameRef}</span>
            <p className="body">{h.nameBody}</p>
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section className="section">
        <div className="wrap">
          <div className="section-head-row">
            <h2 className="h2" style={{ maxWidth: "18ch" }}>
              {h.facultyTitle}
            </h2>
            <Link href={p("/faculty")} className="link">
              {h.facultyLink}
            </Link>
          </div>
          <div className="faculty-row">
            {faculty.map((f) => (
              <Link key={f.slug} href={`${p("/faculty")}#${f.slug}`} className="faculty-item" style={{ textDecoration: "none" }}>
                {f.photo ? (
                  <span className="faculty-photo">
                    <Image src={f.photo} alt="" fill sizes="72px" />
                  </span>
                ) : (
                  <Seal letter={f.initial} className="seal" />
                )}
                <h3 className="h4">{f.name[locale]}</h3>
                <span className="role">{f.role[locale]}</span>
                <span className="aff">{f.affiliation[locale]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Zakat */}
      <section className="section-tight rule-top">
        <div className="wrap feature">
          <div className="feature-img">
            <Image src={d.images.zakat} alt="" fill sizes="(max-width: 960px) 100vw, 45vw" style={{ objectPosition: "40% 50%" }} />
          </div>
          <div className="feature-copy">
            <h2 className="h2">{h.zakatTitle}</h2>
            <p className="lede">{h.zakatText}</p>
            <Link href={p("/zakat")} className="btn btn-ghost">
              {h.zakatLink}
            </Link>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="section">
        <div className="wrap">
          <div className="section-head-row">
            <h2 className="h2">{h.insightsTitle}</h2>
            <Link href={p("/insights")} className="link">
              {h.insightsLink}
            </Link>
          </div>
          <div className="article-grid">
            {posts.slice(0, 3).map((a) => (
              <ArticleCard key={a.slug} article={a} locale={locale} minutesLabel={d.insights.minutes(a.minutes)} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="closing section">
        <div className="wrap closing-inner">
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <h2 className="h2">{h.closingTitle}</h2>
            <p className="lede">{h.closingText}</p>
          </div>
          <div className="closing-actions">
            <Link href={p("/contact")} className="btn btn-primary">
              {h.ctaPrimary}
            </Link>
            <a href={waLink(s.whatsapp, d.whatsapp.greeting)} className="link" target="_blank" rel="noopener">
              {d.whatsapp.label}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
