import type { L } from "../i18n";

export type Programme = {
  slug: string;
  kind: "course" | "workshop";
  level: L;
  title: L;
  duration: L;
  format: L;
  summary: L;
  audience: L;
  modules: L<string[]>;
};

const foundation = { en: "Foundation", ur: "بنیادی" };
const intermediate = { en: "Intermediate", ur: "درمیانی" };
const advanced = { en: "Advanced", ur: "اعلیٰ" };
const executive = { en: "Executive", ur: "ایگزیکٹو" };
const online = { en: "Online, live sessions with recordings", ur: "آن لائن، براہِ راست سیشن اور ریکارڈنگ" };
const liveOnline = { en: "Live online", ur: "براہِ راست آن لائن" };

export const programmes: Programme[] = [
  {
    slug: "introduction-to-islamic-finance",
    kind: "course",
    level: foundation,
    title: { en: "Introduction to Islamic Finance", ur: "اسلامی مالیات کا تعارف" },
    duration: { en: "6 weeks", ur: "6 ہفتے" },
    format: online,
    summary: {
      en: "For professionals new to Islamic finance. Understand riba, gharar and maysir, and the core contracts behind every Islamic financial product.",
      ur: "اسلامی مالیات میں نئے پیشہ ور افراد کے لیے۔ سود، غرر اور میسر کو سمجھیں، اور ان بنیادی معاہدوں کو جن پر ہر اسلامی مالیاتی پروڈکٹ قائم ہے۔",
    },
    audience: {
      en: "New joiners at Islamic banks and windows, finance and accounts staff, and anyone who wants a structured grounding before a specialist course.",
      ur: "اسلامی بینکوں اور ونڈوز کے نئے ملازمین، فنانس اور اکاؤنٹس کا عملہ، اور ہر وہ شخص جو کسی خصوصی کورس سے پہلے منظم بنیاد چاہتا ہو۔",
    },
    modules: {
      en: [
        "The Islamic economic worldview",
        "Why riba is prohibited",
        "Gharar and maysir",
        "Murabaha, Ijarah, Mudarabah and Musharakah",
        "Islamic and conventional banking compared",
      ],
      ur: [
        "اسلامی معاشی تصور",
        "سود کی حرمت",
        "غرر اور میسر",
        "مرابحہ، اجارہ، مضاربہ اور مشارکہ",
        "اسلامی اور روایتی بینکاری کا موازنہ",
      ],
    },
  },
  {
    slug: "islamic-banking-operations",
    kind: "course",
    level: foundation,
    title: { en: "Islamic Banking Operations and Products", ur: "اسلامی بینکاری کے عملیات اور پروڈکٹس" },
    duration: { en: "8 weeks", ur: "8 ہفتے" },
    format: online,
    summary: {
      en: "How an Islamic bank actually runs: deposits, financing, trade finance and product structuring from start to finish.",
      ur: "اسلامی بینک عملی طور پر کیسے چلتا ہے: ڈپازٹس، فنانسنگ، ٹریڈ فنانس اور پروڈکٹ کی تشکیل، شروع سے آخر تک۔",
    },
    audience: {
      en: "Branch and operations staff, relationship managers and officers moving from a conventional bank to an Islamic one.",
      ur: "برانچ اور آپریشنز کا عملہ، ریلیشن شپ منیجرز اور روایتی بینک سے اسلامی بینک میں آنے والے افسران۔",
    },
    modules: {
      en: [
        "Current, savings and term deposits",
        "Asset side products",
        "Trade finance with Murabaha, Salam and Istisna",
        "Documentation and its sequence",
        "Branch operations and performance measures",
      ],
      ur: [
        "کرنٹ، سیونگ اور میعادی ڈپازٹس",
        "اثاثہ جاتی پروڈکٹس",
        "مرابحہ، سلم اور استصناع کے ذریعے ٹریڈ فنانس",
        "دستاویزات اور ان کی ترتیب",
        "برانچ آپریشنز اور کارکردگی کے پیمانے",
      ],
    },
  },
  {
    slug: "zakat-ushr-and-islamic-taxation",
    kind: "course",
    level: foundation,
    title: { en: "Zakat, Ushr and Islamic Taxation", ur: "زکوٰۃ، عشر اور اسلامی محصولات" },
    duration: { en: "4 weeks", ur: "4 ہفتے" },
    format: online,
    summary: {
      en: "Zakat across every asset class, from cash and gold to business stock, shares and property, and how it sits alongside Pakistan's tax system.",
      ur: "ہر قسم کے اثاثے پر زکوٰۃ، نقدی اور سونے سے لے کر کاروباری مال، شیئرز اور جائیداد تک، اور پاکستان کے ٹیکس نظام کے ساتھ اس کا تعلق۔",
    },
    audience: {
      en: "Business owners, accountants, tax practitioners and trustees who calculate Zakat for themselves or for others.",
      ur: "کاروباری مالکان، اکاؤنٹنٹس، ٹیکس ماہرین اور ٹرسٹی جو اپنے یا دوسروں کے لیے زکوٰۃ کا حساب کرتے ہیں۔",
    },
    modules: {
      en: [
        "Zakat on cash, gold, silver and business assets",
        "Zakat on shares and mutual funds",
        "Ushr and Khums",
        "Nisab and the lunar year",
        "Charity and tax together",
      ],
      ur: [
        "نقدی، سونا، چاندی اور کاروباری اثاثوں پر زکوٰۃ",
        "شیئرز اور میوچل فنڈز پر زکوٰۃ",
        "عشر اور خمس",
        "نصاب اور قمری سال",
        "صدقہ اور ٹیکس کا باہمی تعلق",
      ],
    },
  },
  {
    slug: "sukuk-structuring-and-issuance",
    kind: "course",
    level: intermediate,
    title: { en: "Sukuk Structuring and Issuance", ur: "صکوک کی تشکیل اور اجراء" },
    duration: { en: "6 weeks", ur: "6 ہفتے" },
    format: online,
    summary: {
      en: "How sukuk are structured, documented, rated, listed and traded, for corporates, banks and their advisers.",
      ur: "صکوک کی تشکیل، دستاویزات، درجہ بندی، لسٹنگ اور تجارت کیسے ہوتی ہے: کارپوریٹس، بینکوں اور ان کے مشیروں کے لیے۔",
    },
    audience: {
      en: "Treasury and investment banking teams, corporate finance staff and legal advisers who work on debt capital market transactions.",
      ur: "ٹریژری اور انویسٹمنٹ بینکنگ ٹیمیں، کارپوریٹ فنانس کا عملہ اور قانونی مشیر جو قرضہ جاتی کیپیٹل مارکیٹ کے معاملات پر کام کرتے ہیں۔",
    },
    modules: {
      en: [
        "Sukuk and conventional bonds compared",
        "Ijarah, Musharakah, Wakalah and hybrid sukuk",
        "The SPV and transfer of assets",
        "Ratings and investor considerations",
        "Walkthrough of a real issuance",
      ],
      ur: [
        "صکوک اور روایتی بانڈز کا موازنہ",
        "اجارہ، مشارکہ، وکالہ اور مخلوط صکوک",
        "ایس پی وی اور اثاثوں کی منتقلی",
        "درجہ بندی اور سرمایہ کاروں کے پہلو",
        "ایک حقیقی اجراء کا مرحلہ وار جائزہ",
      ],
    },
  },
  {
    slug: "takaful-principles-and-practice",
    kind: "course",
    level: intermediate,
    title: { en: "Takaful: Principles and Practice", ur: "تکافل: اصول اور عمل" },
    duration: { en: "6 weeks", ur: "6 ہفتے" },
    format: online,
    summary: {
      en: "The Islamic alternative to conventional insurance, from operating models to underwriting, claims and how surplus is shared.",
      ur: "روایتی انشورنس کا اسلامی متبادل: آپریٹنگ ماڈلز سے لے کر انڈر رائٹنگ، کلیمز اور سرپلس کی تقسیم تک۔",
    },
    audience: {
      en: "Staff at takaful operators and window takaful businesses, bancassurance teams and compliance officers.",
      ur: "تکافل آپریٹرز اور ونڈو تکافل کا عملہ، بینک انشورنس ٹیمیں اور کمپلائنس افسران۔",
    },
    modules: {
      en: [
        "Tabarru and the cooperative principle",
        "Wakalah, Mudarabah and hybrid models",
        "Family and general takaful",
        "Underwriting and claims",
        "Handling surplus and deficit",
        "Regulation",
      ],
      ur: [
        "تبرع اور باہمی تعاون کا اصول",
        "وکالہ، مضاربہ اور مخلوط ماڈلز",
        "فیملی اور جنرل تکافل",
        "انڈر رائٹنگ اور کلیمز",
        "سرپلس اور خسارے کا انتظام",
        "ریگولیشن",
      ],
    },
  },
  {
    slug: "islamic-trade-finance",
    kind: "course",
    level: intermediate,
    title: { en: "Islamic Trade Finance", ur: "اسلامی تجارتی مالیات" },
    duration: { en: "6 weeks", ur: "6 ہفتے" },
    format: online,
    summary: {
      en: "Structuring and documenting the Islamic trade finance products used for imports, exports and working capital.",
      ur: "درآمد، برآمد اور ورکنگ کیپیٹل کے لیے استعمال ہونے والی اسلامی ٹریڈ فنانس پروڈکٹس کی تشکیل اور دستاویزات۔",
    },
    audience: {
      en: "Trade finance officers, corporate bankers and the finance teams of importers and exporters.",
      ur: "ٹریڈ فنانس افسران، کارپوریٹ بینکرز اور درآمد و برآمد کنندگان کی فنانس ٹیمیں۔",
    },
    modules: {
      en: [
        "Murabaha for imports and exports",
        "Ijarah and Wakalah",
        "Salam and Istisna",
        "Letters of credit, guarantees and documentary collections",
        "Risk and compliance",
      ],
      ur: [
        "درآمد و برآمد کے لیے مرابحہ",
        "اجارہ اور وکالہ",
        "سلم اور استصناع",
        "لیٹر آف کریڈٹ، گارنٹی اور دستاویزی وصولی",
        "رسک اور کمپلائنس",
      ],
    },
  },
  {
    slug: "islamic-microfinance",
    kind: "course",
    level: intermediate,
    title: { en: "Islamic Microfinance", ur: "اسلامی مائیکرو فنانس" },
    duration: { en: "6 weeks", ur: "6 ہفتے" },
    format: online,
    summary: {
      en: "Shariah-compliant models for financial inclusion, including qard hasan, group Murabaha and waqf-based finance.",
      ur: "مالی شمولیت کے شریعہ کمپلائنٹ ماڈلز، جن میں قرضِ حسن، گروپ مرابحہ اور وقف پر مبنی فنانس شامل ہیں۔",
    },
    audience: {
      en: "Staff at microfinance banks and institutions, NGOs and social finance practitioners.",
      ur: "مائیکرو فنانس بینکوں اور اداروں کا عملہ، این جی اوز اور سماجی مالیات کے ماہرین۔",
    },
    modules: {
      en: [
        "Islamic microfinance models",
        "Qard hasan and waqf-based finance",
        "Group-based Murabaha",
        "Bringing Zakat and microfinance together",
        "Measuring impact",
      ],
      ur: [
        "اسلامی مائیکرو فنانس کے ماڈلز",
        "قرضِ حسن اور وقف پر مبنی فنانس",
        "گروپ کی بنیاد پر مرابحہ",
        "زکوٰۃ اور مائیکرو فنانس کا امتزاج",
        "اثرات کی پیمائش",
      ],
    },
  },
  {
    slug: "aaoifi-standards-deep-dive",
    kind: "course",
    level: advanced,
    title: { en: "AAOIFI Standards in Depth", ur: "AAOIFI معیارات کا تفصیلی مطالعہ" },
    duration: { en: "8 weeks", ur: "8 ہفتے" },
    format: online,
    summary: {
      en: "A clause by clause study of the AAOIFI Shariah Standards and how to apply them in product approval and board decisions.",
      ur: "AAOIFI شرعی معیارات کا شق وار مطالعہ، اور پروڈکٹ کی منظوری اور بورڈ کے فیصلوں میں ان کا اطلاق۔",
    },
    audience: {
      en: "Shariah compliance officers, Shariah auditors, product developers and members of Shariah boards.",
      ur: "شریعہ کمپلائنس افسران، شریعہ آڈیٹرز، پروڈکٹ ڈیولپرز اور شریعہ بورڈ کے اراکین۔",
    },
    modules: {
      en: [
        "How the standards are organised",
        "Key standards on Murabaha, Ijarah, Sukuk and Takaful",
        "Using the standards in product approval",
        "Resolving disputes",
        "How a Shariah board reaches a decision",
      ],
      ur: [
        "معیارات کی ترتیب و تنظیم",
        "مرابحہ، اجارہ، صکوک اور تکافل کے اہم معیارات",
        "پروڈکٹ کی منظوری میں معیارات کا استعمال",
        "تنازعات کا حل",
        "شریعہ بورڈ فیصلے تک کیسے پہنچتا ہے",
      ],
    },
  },
  {
    slug: "riba-free-banking-for-smes",
    kind: "workshop",
    level: executive,
    title: { en: "Riba-Free Banking for SMEs", ur: "چھوٹے اور درمیانے کاروبار کے لیے بلا سود بینکاری" },
    duration: { en: "Half day", ur: "آدھا دن" },
    format: liveOnline,
    summary: {
      en: "A practical guide for owners and managers moving from conventional to Islamic banking: facilities, paperwork and real costs.",
      ur: "روایتی سے اسلامی بینکاری کی طرف آنے والے مالکان اور منیجرز کے لیے عملی رہنمائی: سہولیات، کاغذی کارروائی اور اصل لاگت۔",
    },
    audience: {
      en: "SME owners, finance managers and chartered accountants who advise small businesses.",
      ur: "ایس ایم ای مالکان، فنانس منیجرز اور چھوٹے کاروباروں کو مشورہ دینے والے چارٹرڈ اکاؤنٹنٹس۔",
    },
    modules: {
      en: [
        "Islamic financing options for SMEs",
        "Murabaha, Ijarah and Diminishing Musharakah",
        "Documents and pricing",
        "Comparing with a conventional loan",
        "Common mistakes",
      ],
      ur: [
        "ایس ایم ایز کے لیے اسلامی فنانسنگ کے انتخاب",
        "مرابحہ، اجارہ اور مشارکۂ متناقصہ",
        "دستاویزات اور قیمت کا تعین",
        "روایتی قرض سے موازنہ",
        "عام غلطیاں",
      ],
    },
  },
  {
    slug: "zakat-masterclass",
    kind: "workshop",
    level: executive,
    title: { en: "Half-Day Zakat Masterclass", ur: "آدھے دن کی زکوٰۃ ماسٹر کلاس" },
    duration: { en: "Half day", ur: "آدھا دن" },
    format: liveOnline,
    summary: {
      en: "A working session on Zakat for business owners, investors and finance teams, with complex cases solved live.",
      ur: "کاروباری مالکان، سرمایہ کاروں اور فنانس ٹیموں کے لیے زکوٰۃ پر عملی سیشن، جس میں پیچیدہ مسائل براہِ راست حل کیے جاتے ہیں۔",
    },
    audience: {
      en: "Business owners, family offices, investors and the accountants who prepare their Zakat.",
      ur: "کاروباری مالکان، فیملی آفسز، سرمایہ کار اور ان کی زکوٰۃ کا حساب تیار کرنے والے اکاؤنٹنٹس۔",
    },
    modules: {
      en: [
        "Zakat on business stock",
        "Zakat on shares and funds",
        "Zakat on gold and property",
        "Nisab and the year end",
        "Common mistakes",
      ],
      ur: [
        "کاروباری مال پر زکوٰۃ",
        "شیئرز اور فنڈز پر زکوٰۃ",
        "سونے اور جائیداد پر زکوٰۃ",
        "نصاب اور سال کا اختتام",
        "عام غلطیاں",
      ],
    },
  },
  {
    slug: "sukuk-structuring-workshop",
    kind: "workshop",
    level: executive,
    title: { en: "One-Day Sukuk Structuring Workshop", ur: "ایک روزہ صکوک اسٹرکچرنگ ورکشاپ" },
    duration: { en: "1 day", ur: "1 دن" },
    format: liveOnline,
    summary: {
      en: "A case-based day working through a full sukuk issuance, from the term sheet to closing.",
      ur: "کیس پر مبنی ایک دن، جس میں صکوک کے مکمل اجراء کو ٹرم شیٹ سے کلوزنگ تک حل کیا جاتا ہے۔",
    },
    audience: {
      en: "CFOs, treasurers and bankers preparing for a sukuk issuance, and advisers who support them.",
      ur: "صکوک کے اجراء کی تیاری کرنے والے سی ایف اوز، ٹریژررز اور بینکرز، اور ان کے معاون مشیر۔",
    },
    modules: {
      en: [
        "Choosing the structure",
        "Setting up the SPV",
        "Shariah documentation",
        "Ratings and marketing",
        "Closing and listing",
      ],
      ur: [
        "ڈھانچے کا انتخاب",
        "ایس پی وی کا قیام",
        "شرعی دستاویزات",
        "درجہ بندی اور مارکیٹنگ",
        "کلوزنگ اور لسٹنگ",
      ],
    },
  },
];

export function getProgramme(slug: string) {
  return programmes.find((p) => p.slug === slug);
}
