"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavItem = { href: string; label: string };

type Props = {
  locale: "en" | "ur";
  brandName: string;
  brandSub: string;
  items: NavItem[];
  bookLabel: string;
  menuLabel: string;
  closeLabel: string;
  switchTo: string;
  switchLabel: string;
};

export default function Header(props: Props) {
  const { locale, items } = props;
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const other = locale === "en" ? "ur" : "en";
  const switchHref = pathname.replace(/^\/(en|ur)(?=\/|$)/, `/${other}`);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href={`/${locale}`} className="brand" aria-label={props.brandName}>
          <Image src="/brand/al-ihkam-logo.png" alt="" width={581} height={568} className="brand-mark" sizes="56px" priority />
          <span className="brand-text">
            <span className="brand-name">{props.brandName}</span>
            <span className="brand-sub">{props.brandSub}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          {items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href={switchHref} className="lang-switch" lang={other} hrefLang={other} title={props.switchLabel}>
            {props.switchTo}
          </Link>
          <Link href={`/${locale}/contact`} className="btn btn-primary">
            {props.bookLabel}
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? props.closeLabel : props.menuLabel}
          </button>
        </div>
      </div>

      <div id="mobile-nav" className="mobile-nav" data-open={open}>
        <div className="wrap">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/${locale}/contact`} className="btn btn-primary">
            {props.bookLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
