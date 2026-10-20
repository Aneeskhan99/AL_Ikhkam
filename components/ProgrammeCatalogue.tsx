"use client";

import Link from "next/link";
import { useState } from "react";

export type CatalogueItem = {
  slug: string;
  kind: "course" | "workshop";
  level: string;
  title: string;
  facts: string;
  summary: string;
};

type Props = {
  locale: string;
  items: CatalogueItem[];
  labels: { tabs: string; courses: string; workshops: string; details: string };
};

export default function ProgrammeCatalogue({ locale, items, labels }: Props) {
  const [kind, setKind] = useState<"course" | "workshop">("course");
  const tabs = [
    { id: "course" as const, label: labels.courses },
    { id: "workshop" as const, label: labels.workshops },
  ];
  const shown = items.filter((i) => i.kind === kind);

  return (
    <div>
      <div className="tabs" role="tablist" aria-label={labels.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={kind === tab.id}
            aria-controls="programme-panel"
            className="tab"
            onClick={() => setKind(tab.id)}
          >
            {tab.label}
            <span className="count">{items.filter((i) => i.kind === tab.id).length}</span>
          </button>
        ))}
      </div>

      <ul id="programme-panel" role="tabpanel" aria-labelledby={`tab-${kind}`} className="programme-list">
        {shown.map((p) => (
          <li key={p.slug} className="programme">
            <span className="level">{p.level}</span>
            <div>
              <h3 className="h4">
                <Link href={`/${locale}/academy/${p.slug}`} style={{ textDecoration: "none" }}>
                  {p.title}
                </Link>
              </h3>
              <p className="facts">{p.facts}</p>
            </div>
            <p className="summary">{p.summary}</p>
            <Link href={`/${locale}/academy/${p.slug}`} className="link go" aria-label={`${labels.details}: ${p.title}`}>
              {labels.details}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
