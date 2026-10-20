import Link from "next/link";

type Props = {
  title: string;
  lede?: string;
  back?: { href: string; label: string };
  kicker?: string;
};

export default function PageHead({ title, lede, back, kicker }: Props) {
  return (
    <header className="page-head">
      <div className="wrap">
        {back && (
          <Link href={back.href} className="link breadcrumb no-print" style={{ justifySelf: "start" }}>
            {back.label}
          </Link>
        )}
        {kicker && <span className="kicker">{kicker}</span>}
        <h1 className="h2" style={{ maxWidth: "18ch" }}>
          {title}
        </h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </header>
  );
}
