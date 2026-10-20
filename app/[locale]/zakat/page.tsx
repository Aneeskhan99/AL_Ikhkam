import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import ZakatCalculator from "@/components/ZakatCalculator";
import { formatPKR, isLocale } from "@/lib/i18n";
import { getContent, getSettings } from "@/lib/server/content";
import { pageMetadata } from "@/lib/server/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getContent(locale);
  return pageMetadata("zakat", locale, { title: d.zakat.title, description: d.zakat.lede, path: "/zakat" });
}

export default async function ZakatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const s = (await getContent(locale)).zakat;
  const z = (await getSettings()).zakat;

  return (
    <>
      <PageHead title={s.title} lede={s.lede} />
      <section className="section">
        <div className="wrap">
          <ZakatCalculator
            locale={locale}
            defaults={z}
            strings={{
              step1: s.step1,
              silver: s.silver,
              gold: s.gold,
              silverHint: s.silverHint,
              goldHint: s.goldHint,
              silverRate: s.silverRate,
              goldRate: s.goldRate,
              rateNote: s.rateNote(z.pricesAsOf[locale], z.priceSource),
              step2: s.step2,
              cash: s.cash,
              goldHeld: s.goldHeld,
              silverHeld: s.silverHeld,
              investments: s.investments,
              receivables: s.receivables,
              inventory: s.inventory,
              step3: s.step3,
              debts: s.debts,
              debtsHint: s.debtsHint,
              summary: s.summary,
              totalAssets: s.totalAssets,
              totalDebts: s.totalDebts,
              net: s.net,
              nisab: s.nisab,
              due: s.due,
              below: s.below,
              above: s.above,
              print: s.print,
              reset: s.reset,
              askScholar: s.askScholar,
              tola: s.tola,
              rs: locale === "ur" ? "روپے" : "Rs",
            }}
          />

          <div className="two-col" style={{ marginTop: "clamp(3rem, 6vw, 5rem)" }}>
            <div className="panel">
              <h2 className="h4">{s.officialTitle}</h2>
              <p className="muted">{s.officialText(formatPKR(z.officialNisab, locale), z.officialNisabYear[locale])}</p>
            </div>
            <p className="note" style={{ alignSelf: "start" }}>
              {s.disclaimer}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
