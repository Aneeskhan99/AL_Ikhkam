"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Strings = {
  step1: string;
  silver: string;
  gold: string;
  silverHint: string;
  goldHint: string;
  silverRate: string;
  goldRate: string;
  rateNote: string;
  step2: string;
  cash: string;
  goldHeld: string;
  silverHeld: string;
  investments: string;
  receivables: string;
  inventory: string;
  step3: string;
  debts: string;
  debtsHint: string;
  summary: string;
  totalAssets: string;
  totalDebts: string;
  net: string;
  nisab: string;
  due: string;
  below: string;
  above: string;
  print: string;
  reset: string;
  askScholar: string;
  tola: string;
  rs: string;
};

type Props = {
  locale: "en" | "ur";
  strings: Strings;
  defaults: { silverPerTola: number; goldPerTola: number; silverNisabTola: number; goldNisabTola: number };
};

type Key = "cash" | "goldTola" | "silverTola" | "investments" | "receivables" | "inventory" | "debts";

const empty: Record<Key, string> = {
  cash: "",
  goldTola: "",
  silverTola: "",
  investments: "",
  receivables: "",
  inventory: "",
  debts: "",
};

function num(v: string) {
  const n = parseFloat(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function ZakatCalculator({ locale, strings: s, defaults }: Props) {
  const [basis, setBasis] = useState<"silver" | "gold">("silver");
  const [silverRate, setSilverRate] = useState(String(defaults.silverPerTola));
  const [goldRate, setGoldRate] = useState(String(defaults.goldPerTola));
  const [v, setV] = useState(empty);

  const fmt = (n: number) => {
    const str = Math.round(n).toLocaleString("en-PK");
    return locale === "ur" ? `${str} روپے` : `Rs ${str}`;
  };

  const r = useMemo(() => {
    const sr = num(silverRate);
    const gr = num(goldRate);
    const assets =
      num(v.cash) + num(v.goldTola) * gr + num(v.silverTola) * sr + num(v.investments) + num(v.receivables) + num(v.inventory);
    const debts = num(v.debts);
    const net = Math.max(0, assets - debts);
    const nisab = basis === "silver" ? defaults.silverNisabTola * sr : defaults.goldNisabTola * gr;
    const meets = net > 0 && nisab > 0 && net >= nisab;
    return { assets, debts, net, nisab, meets, due: meets ? net * 0.025 : 0 };
  }, [v, silverRate, goldRate, basis, defaults]);

  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement>) => setV((prev) => ({ ...prev, [k]: e.target.value }));
  const touched = Object.values(v).some((x) => x !== "");

  const money = (k: Key, label: string, hint?: string) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <div className="input-wrap">
        <span className="unit">{s.rs}</span>
        <input id={k} inputMode="decimal" autoComplete="off" placeholder="0" value={v[k]} onChange={set(k)} />
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
  const weight = (k: Key, label: string) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <div className="input-wrap">
        <span className="unit">{s.tola}</span>
        <input id={k} inputMode="decimal" autoComplete="off" placeholder="0" value={v[k]} onChange={set(k)} />
      </div>
    </div>
  );

  return (
    <div className="calc">
      <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>
            <span className="n">1</span> {s.step1}
          </legend>
          <div className="choice-row">
            <label className="choice">
              <input type="radio" name="basis" checked={basis === "silver"} onChange={() => setBasis("silver")} />
              <strong>{s.silver}</strong>
              <span>{s.silverHint}</span>
            </label>
            <label className="choice">
              <input type="radio" name="basis" checked={basis === "gold"} onChange={() => setBasis("gold")} />
              <strong>{s.gold}</strong>
              <span>{s.goldHint}</span>
            </label>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="silverRate">{s.silverRate}</label>
              <div className="input-wrap">
                <span className="unit">{s.rs}</span>
                <input id="silverRate" inputMode="decimal" value={silverRate} onChange={(e) => setSilverRate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="goldRate">{s.goldRate}</label>
              <div className="input-wrap">
                <span className="unit">{s.rs}</span>
                <input id="goldRate" inputMode="decimal" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} />
              </div>
            </div>
          </div>
          <p className="hint muted" style={{ fontSize: "0.86rem" }}>{s.rateNote}</p>
        </fieldset>

        <fieldset>
          <legend>
            <span className="n">2</span> {s.step2}
          </legend>
          {money("cash", s.cash)}
          <div className="field-grid">
            {weight("goldTola", s.goldHeld)}
            {weight("silverTola", s.silverHeld)}
          </div>
          {money("investments", s.investments)}
          {money("receivables", s.receivables)}
          {money("inventory", s.inventory)}
        </fieldset>

        <fieldset>
          <legend>
            <span className="n">3</span> {s.step3}
          </legend>
          {money("debts", s.debts, s.debtsHint)}
        </fieldset>

        {touched && (
          <a href="#zakat-summary" className="calc-mini no-print">
            <span>{s.due}</span>
            <strong>{fmt(r.due)}</strong>
          </a>
        )}
      </form>

      <aside className="ledger" id="zakat-summary" aria-live="polite">
        <h2>{s.summary}</h2>
        <dl>
          <div>
            <dt>{s.totalAssets}</dt>
            <dd>{fmt(r.assets)}</dd>
          </div>
          <div>
            <dt>{s.totalDebts}</dt>
            <dd>{fmt(r.debts)}</dd>
          </div>
          <div>
            <dt>{s.net}</dt>
            <dd>{fmt(r.net)}</dd>
          </div>
          <div>
            <dt>
              {s.nisab} ({basis === "silver" ? s.silver : s.gold})
            </dt>
            <dd>{fmt(r.nisab)}</dd>
          </div>
        </dl>
        <div className="due">
          <span>{s.due}</span>
          <strong>{fmt(r.due)}</strong>
        </div>
        {touched && <p className="status">{r.meets ? s.above : s.below}</p>}
        <div className="ledger-actions no-print">
          <button type="button" className="btn btn-light" onClick={() => window.print()}>
            {s.print}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setV(empty)}>
            {s.reset}
          </button>
        </div>
        <Link href={`/${locale}/contact`} className="link no-print" style={{ color: "var(--brass-pale)", justifySelf: "start" }}>
          {s.askScholar}
        </Link>
      </aside>
    </div>
  );
}
