"use client";

import { useEffect, useState } from "react";

type Strings = {
  name: string;
  email: string;
  phone: string;
  org: string;
  interest: string;
  interests: string[];
  programme: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  sent: string;
  fallbackTitle: string;
  fallbackText: string;
  viaWhatsApp: string;
  viaEmail: string;
  error: string;
};

type Props = {
  strings: Strings;
  locale: string;
  programmes: Record<string, string>; // slug -> title, to show the programme when arriving from its page
  whatsappNumber: string;
  email: string;
};

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "fallback"; text: string } | { kind: "error" };

export default function ContactForm({ strings: s, locale, programmes, whatsappNumber, email }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [programme, setProgramme] = useState<{ slug: string; title: string } | null>(null);
  const [interest, setInterest] = useState(s.interests[0]);

  // Read ?programme= and ?interest= in the browser so the page itself can stay static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("programme");
    if (slug && programmes[slug]) setProgramme({ slug, title: programmes[slug] });
    const i = parseInt(params.get("interest") || "", 10);
    if (Number.isFinite(i) && s.interests[i]) setInterest(s.interests[i]);
  }, [programmes, s.interests]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (!data.name?.trim() || !/^\S+@\S+\.\S+$/.test(data.email || "")) {
      setState({ kind: "error" });
      return;
    }

    setState({ kind: "sending" });
    const summary = [
      `${s.name}: ${data.name}`,
      `${s.email}: ${data.email}`,
      data.phone && `${s.phone}: ${data.phone}`,
      data.org && `${s.org}: ${data.org}`,
      `${s.interest}: ${data.interest}`,
      data.programme && `${s.programme}: ${data.programme}`,
      data.message && `\n${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale, programmeSlug: programme?.slug || "", source: readSource() }),
      });
      if (res.ok) {
        setState({ kind: "sent" });
        form.reset();
        return;
      }
      setState({ kind: "fallback", text: summary });
    } catch {
      setState({ kind: "fallback", text: summary });
    }
  }

  if (state.kind === "sent") {
    return (
      <div className="form-status ok" role="status">
        <p>{s.sent}</p>
      </div>
    );
  }

  if (state.kind === "fallback") {
    const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(state.text)}`;
    const mail = `mailto:${email}?subject=${encodeURIComponent("Enquiry from the Al-Ihkam website")}&body=${encodeURIComponent(state.text)}`;
    return (
      <div className="form-status" role="status">
        <h2 className="h4">{s.fallbackTitle}</h2>
        <p className="muted">{s.fallbackText}</p>
        <div className="row">
          <a className="btn btn-primary" href={wa} target="_blank" rel="noopener">
            {s.viaWhatsApp}
          </a>
          <a className="btn btn-ghost" href={mail}>
            {s.viaEmail}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="name">{s.name}</label>
          <input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="email">{s.email}</label>
          <input id="email" name="email" type="email" autoComplete="email" dir="ltr" required />
        </div>
        <div className="field">
          <label htmlFor="phone">{s.phone}</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" />
        </div>
        <div className="field">
          <label htmlFor="org">{s.org}</label>
          <input id="org" name="org" autoComplete="organization" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="interest">{s.interest}</label>
        <select id="interest" name="interest" value={interest} onChange={(e) => setInterest(e.target.value)}>
          {s.interests.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      {programme && (
        <div className="field">
          <label htmlFor="programme">{s.programme}</label>
          <input id="programme" name="programme" value={programme.title} readOnly />
        </div>
      )}
      <div className="field">
        <label htmlFor="message">{s.message}</label>
        <textarea id="message" name="message" rows={5} placeholder={s.messagePlaceholder} />
      </div>
      <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state.kind === "error" && (
        <p className="form-error" role="alert">
          {s.error}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? s.sending : s.send}
        </button>
      </div>
    </form>
  );
}

function readSource() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("aih_src") || "{}");
    return { page: window.location.pathname, landing: saved.landing || "", referrer: saved.referrer || "", utm: saved.utm || {} };
  } catch {
    return { page: window.location.pathname };
  }
}
