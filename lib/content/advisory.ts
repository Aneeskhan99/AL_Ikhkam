import type { L } from "../i18n";

export type Service = {
  id: string;
  title: L;
  summary: L;
  points: L<string[]>;
};

export const services: Service[] = [
  {
    id: "review",
    title: { en: "Shariah compliance review and screening", ur: "شرعی کمپلائنس جائزہ اور اسکریننگ" },
    summary: {
      en: "A full review of a company, fund or portfolio: what the business does, how it is financed and where its income comes from, tested against AAOIFI screening criteria.",
      ur: "کسی کمپنی، فنڈ یا پورٹ فولیو کا مکمل جائزہ: کاروبار کیا ہے، اس کی فنانسنگ کیسے ہوتی ہے اور آمدنی کہاں سے آتی ہے، اور یہ سب AAOIFI اسکریننگ معیار پر پرکھا جاتا ہے۔",
    },
    points: {
      en: [
        "Business activity and financial ratio screening",
        "Purification ratio for impermissible income",
        "Dividend cleansing calculation for investors",
      ],
      ur: [
        "کاروباری سرگرمی اور مالیاتی تناسب کی جانچ",
        "ناجائز آمدنی کی تطہیر کا تناسب",
        "سرمایہ کاروں کے لیے منافع کی تطہیر کا حساب",
      ],
    },
  },
  {
    id: "structuring",
    title: { en: "Product structuring", ur: "پروڈکٹ اسٹرکچرنگ" },
    summary: {
      en: "Design and review of Islamic financing and investment products, from the term sheet to the final contract set, so that each step of the transaction is valid on its own.",
      ur: "اسلامی فنانسنگ اور سرمایہ کاری کی پروڈکٹس کی تشکیل اور جائزہ، ٹرم شیٹ سے آخری معاہدوں تک، تاکہ لین دین کا ہر مرحلہ بذاتِ خود درست ہو۔",
    },
    points: {
      en: [
        "Murabaha, Ijarah, Musharakah and Diminishing Musharakah",
        "Sukuk structures, SPV and asset transfer",
        "Salam and Istisna for trade and working capital",
      ],
      ur: [
        "مرابحہ، اجارہ، مشارکہ اور مشارکۂ متناقصہ",
        "صکوک کا ڈھانچہ، ایس پی وی اور اثاثوں کی منتقلی",
        "تجارت اور ورکنگ کیپیٹل کے لیے سلم اور استصناع",
      ],
    },
  },
  {
    id: "audit",
    title: { en: "Shariah audit and ongoing monitoring", ur: "شریعہ آڈٹ اور مسلسل نگرانی" },
    summary: {
      en: "Periodic testing of how products are actually executed, because a sound contract can still be undone by the wrong sequence of documents or payments.",
      ur: "پروڈکٹس پر عملدرآمد کی وقتاً فوقتاً جانچ، کیونکہ درست معاہدہ بھی دستاویزات یا ادائیگیوں کی غلط ترتیب سے بے اثر ہو سکتا ہے۔",
    },
    points: {
      en: [
        "Sample testing of executed transactions",
        "Findings reports with corrective actions",
        "Annual compliance review and alerts on changes",
      ],
      ur: [
        "مکمل شدہ لین دین کی نمونہ جاتی جانچ",
        "اصلاحی اقدامات کے ساتھ نتائج کی رپورٹ",
        "سالانہ کمپلائنس جائزہ اور تبدیلیوں پر اطلاع",
      ],
    },
  },
];

export const deliverables: L<string[]> = {
  en: [
    "A written Shariah opinion signed by qualified scholars",
    "The standards and evidence each finding relies on",
    "A list of changes needed, in order of priority",
    "A purification or cleansing calculation where income needs it",
  ],
  ur: [
    "مستند علماء کی دستخط شدہ تحریری شرعی رائے",
    "ہر نتیجے کی بنیاد بننے والے معیارات اور دلائل",
    "ترجیحی ترتیب سے درکار تبدیلیوں کی فہرست",
    "جہاں آمدنی میں ضرورت ہو وہاں تطہیر کا حساب",
  ],
};

export type Step = { title: L; text: L };

export const processSteps: Step[] = [
  {
    title: { en: "Scope", ur: "دائرۂ کار" },
    text: {
      en: "We agree what is being reviewed, which standards apply and the documents we need.",
      ur: "ہم طے کرتے ہیں کہ کس چیز کا جائزہ لینا ہے، کون سے معیارات لاگو ہوں گے اور کون سی دستاویزات درکار ہیں۔",
    },
  },
  {
    title: { en: "Review", ur: "جائزہ" },
    text: {
      en: "Our scholars read the contracts, process flows and financial statements, and test them clause by clause.",
      ur: "ہمارے علماء معاہدوں، طریقۂ کار اور مالیاتی گوشواروں کو پڑھتے اور شق وار جانچتے ہیں۔",
    },
  },
  {
    title: { en: "Opinion", ur: "رائے" },
    text: {
      en: "You receive a signed opinion with findings, the evidence behind them and the changes required.",
      ur: "آپ کو نتائج، ان کے دلائل اور درکار تبدیلیوں کے ساتھ دستخط شدہ رائے ملتی ہے۔",
    },
  },
  {
    title: { en: "Monitor", ur: "نگرانی" },
    text: {
      en: "We check execution over time and tell you when a change in the business or the standards affects the opinion.",
      ur: "ہم وقت کے ساتھ عملدرآمد کی جانچ کرتے ہیں اور بتاتے ہیں جب کاروبار یا معیارات میں کوئی تبدیلی رائے پر اثر ڈالے۔",
    },
  },
];

/** Stable anchor for the n-th service card (keeps the original ids for the first three). */
export function serviceAnchor(index: number) {
  return services[index]?.id ?? `service-${index + 1}`;
}
