import en from "./dict/en";
import ur from "./dict/ur";

export const locales = ["en", "ur"] as const;
export type Locale = (typeof locales)[number];
export type Dict = typeof en;

const dictionaries: Record<Locale, Dict> = { en, ur };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

export function dirOf(locale: Locale) {
  return locale === "ur" ? "rtl" : "ltr";
}

/** A value that exists in both languages. */
export type L<T = string> = { en: T; ur: T };

export function t<T>(value: L<T>, locale: Locale): T {
  return value[locale];
}

export function href(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

export function formatPKR(n: number, locale: Locale) {
  const v = Math.round(n).toLocaleString("en-PK");
  return locale === "ur" ? `${v} روپے` : `Rs ${v}`;
}
