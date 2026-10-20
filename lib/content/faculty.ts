import type { L } from "../i18n";

export type FacultyMember = {
  slug: string;
  initial: string; // shown in the seal when no photo is available
  photo?: string; // a file in public/faculty, or an upload from Admin › Faculty
  name: L;
  role: L;
  affiliation: L;
  bio: L;
  education: L<string[]>;
  focus: L<string[]>;
  email?: string;
  links?: { label: L; href: string }[];
};

export const faculty: FacultyMember[] = [
  {
    slug: "zeeshan-rais-khattak",
    initial: "ز",
    photo: "/faculty/zeeshan-rais-khattak.jpg",
    name: { en: "Dr. Zeeshan Rais Khattak", ur: "ڈاکٹر ذیشان رئیس خٹک" },
    role: { en: "Founder & CEO | Chief Shariah Advisor", ur: "بانی و سی ای او | چیف شریعہ ایڈوائزر" },
    affiliation: {
      en: "Assistant Professor, Department of Islamic Studies, Bahria University Islamabad",
      ur: "اسسٹنٹ پروفیسر، شعبۂ اسلامیات، بحریہ یونیورسٹی اسلام آباد",
    },
    bio: {
      en: "Dr. Zeeshan Rais Khattak is a distinguished academic and the driving force behind Al-Ihkam. Currently serving as an Assistant Professor of Islamic Studies at Bahria University, Islamabad, he combines a deep scholarly understanding of Shariah with a rigorous, research-driven approach to modern finance.\n\nHis academic grounding in Islamic finance is anchored by a specialised M.Sc. in Islamic Banking and Finance and a Ph.D. in Islamic Studies. His doctoral research, on non-Shariah-compliant financial transactions and their socio-economic impact, forms the intellectual backbone of our advisory services. His M.Phil. research, an analysis of State Bank policies on Islamic banking, gives him a macro-level understanding of financial regulation.\n\nDr. Khattak is an active contributor to contemporary Islamic finance discourse, with peer-reviewed articles on critical topics including the socio-economic impact of Riba, the Shariah compliance of cryptocurrency and business ethics in Islam.\n\nUnder his leadership, Al-Ihkam delivers Shariah-compliant solutions that are not only academically rigorous and ethically sound but also practically viable for the modern global economy.",
      ur: "ڈاکٹر ذیشان رئیس خٹک ایک ممتاز ماہرِ تعلیم اور الاحکام کے روحِ رواں ہیں۔ آپ اس وقت بحریہ یونیورسٹی اسلام آباد میں اسلامیات کے اسسٹنٹ پروفیسر ہیں اور شریعت کے گہرے علمی فہم کو جدید مالیات کے بارے میں تحقیق پر مبنی، باریک بین طرزِ فکر کے ساتھ یکجا کرتے ہیں۔\n\nاسلامی مالیات میں آپ کی علمی بنیاد اسلامی بینکاری و مالیات میں خصوصی ایم ایس سی اور اسلامیات میں پی ایچ ڈی پر قائم ہے۔ آپ کی ڈاکٹریٹ تحقیق، جو غیر شرعی مالی معاملات اور ان کے سماجی و معاشی اثرات پر ہے، ہماری مشاورتی خدمات کی فکری بنیاد ہے۔ اسٹیٹ بینک کی اسلامی بینکاری سے متعلق پالیسیوں کے تجزیے پر مبنی آپ کی ایم فل تحقیق آپ کو مالیاتی ضوابط کا وسیع تر فہم فراہم کرتی ہے۔\n\nڈاکٹر خٹک عصری اسلامی مالیاتی مباحث میں سرگرم حصہ لیتے ہیں۔ ربا کے سماجی و معاشی اثرات، کرپٹو کرنسی کی شرعی حیثیت اور اسلام میں کاروباری اخلاقیات جیسے اہم موضوعات پر آپ کے تحقیقی مقالات ہم جائزہ جرائد میں شائع ہو چکے ہیں۔\n\nآپ کی قیادت میں الاحکام ایسے شریعت سے ہم آہنگ حل فراہم کرتا ہے جو نہ صرف علمی طور پر مضبوط اور اخلاقی طور پر درست ہیں بلکہ جدید عالمی معیشت میں عملی طور پر قابلِ عمل بھی ہیں۔",
    },
    education: {
      en: [
        "PhD Islamic Studies, NUML",
        "M.Phil Islamic Studies, Allama Iqbal Open University",
        "M.Sc Islamic Banking and Finance, International Islamic University Islamabad",
        "Hifz of the Quran, Wifaq ul Madaris al-Arabia",
      ],
      ur: [
        "پی ایچ ڈی اسلامیات، NUML",
        "ایم فل اسلامیات، علامہ اقبال اوپن یونیورسٹی",
        "ایم ایس سی اسلامی بینکاری و مالیات، بین الاقوامی اسلامی یونیورسٹی اسلام آباد",
        "حفظِ قرآن، وفاق المدارس العربیہ",
      ],
    },
    focus: {
      en: ["Fatwa and Shariah opinions", "Cryptocurrency in Islamic law", "Maqasid al-Shariah", "Riba and its social and economic effects", "Business ethics"],
      ur: ["فتویٰ اور شرعی آراء", "اسلامی قانون میں کرپٹو کرنسی", "مقاصدِ شریعہ", "سود اور اس کے سماجی و معاشی اثرات", "کاروباری اخلاقیات"],
    },
    email: "zeeshanraees2015@gmail.com",
  },
  {
    slug: "daud-khan",
    initial: "د",
    photo: "/faculty/daud-khan.jpg",
    name: { en: "Daud Khan", ur: "داؤد خان" },
    role: { en: "Senior Faculty, Islamic Banking and Risk", ur: "سینئر فیکلٹی، اسلامی بینکاری اور رسک" },
    affiliation: {
      en: "Consultant Trainer, Emirates Institute of Banking and Financial Studies, Dubai",
      ur: "کنسلٹنٹ ٹرینر، امارات انسٹیٹیوٹ آف بینکنگ اینڈ فنانشل اسٹڈیز، دبئی",
    },
    bio: {
      en: "Daud has worked as a Shariah Compliance Officer at Bank Alfalah Islamic Banking Group and has taught as adjunct faculty at several UAE universities, including Manipal, Jumeira and Amity Dubai. He brings the view from inside a bank to every review and every class.",
      ur: "داؤد خان بینک الفلاح اسلامک بینکنگ گروپ میں شریعہ کمپلائنس آفیسر رہ چکے ہیں اور متحدہ عرب امارات کی کئی جامعات بشمول منی پال، جمیرا اور ایمیٹی دبئی میں ایڈجنکٹ فیکلٹی کے طور پر پڑھا چکے ہیں۔ وہ ہر جائزے اور ہر کلاس میں بینک کے اندر کا تجربہ لاتے ہیں۔",
    },
    education: {
      en: [
        "Masters in Islamic Banking and Finance, International Islamic University Islamabad",
        "MBA Finance, Bahria University",
        "MA Sociology, University of Peshawar",
        "BBA (Hons) Finance, IMSciences",
      ],
      ur: [
        "ماسٹرز اسلامی بینکاری و مالیات، بین الاقوامی اسلامی یونیورسٹی اسلام آباد",
        "ایم بی اے فنانس، بحریہ یونیورسٹی",
        "ایم اے سوشیالوجی، پشاور یونیورسٹی",
        "بی بی اے (آنرز) فنانس، IMSciences",
      ],
    },
    focus: {
      en: ["Shariah audit and compliance", "Market risk", "Internal audit", "Contract management", "Islamic banking products and trade finance"],
      ur: ["شریعہ آڈٹ اور کمپلائنس", "مارکیٹ رسک", "اندرونی آڈٹ", "معاہدوں کا انتظام", "اسلامی بینکاری پروڈکٹس اور ٹریڈ فنانس"],
    },
    email: "zeeshanraees2015@gmail.com",
  },
  {
    slug: "ikram-ullah",
    initial: "ا",
    photo: "/faculty/ikram-ullah.jpg",
    name: { en: "Ikram Ullah", ur: "اکرام اللہ" },
    role: { en: "Senior Faculty, Islamic Finance and Research", ur: "سینئر فیکلٹی، اسلامی مالیات اور تحقیق" },
    affiliation: {
      en: "Lecturer and Academic Officer, Capital University of Science and Technology, Islamabad",
      ur: "لیکچرر اور اکیڈمک آفیسر، کیپیٹل یونیورسٹی آف سائنس اینڈ ٹیکنالوجی، اسلام آباد",
    },
    bio: {
      en: "Ikram has more than ten years of teaching and research at Riphah International University and now teaches at CUST. He specialises in Islamic banking, the AAOIFI Shariah Standards and the Islamic law of transactions, and has trained Shariah audit teams at RSM International and Grant Thornton.",
      ur: "اکرام اللہ رفاہ انٹرنیشنل یونیورسٹی میں دس سال سے زائد تدریس و تحقیق کا تجربہ رکھتے ہیں اور اب CUST میں پڑھاتے ہیں۔ ان کا تخصص اسلامی بینکاری، AAOIFI شرعی معیارات اور اسلامی قانونِ معاملات ہے، اور وہ RSM انٹرنیشنل اور گرانٹ تھورنٹن کی شریعہ آڈٹ ٹیموں کو تربیت دے چکے ہیں۔",
    },
    education: {
      en: [
        "MS Islamic Business and Finance, Riphah International University",
        "M.Sc Islamic Banking and Finance, International Islamic University Islamabad (merit scholar)",
        "PGD Professional Ethics and Teaching Methodology",
        "FIBO, National Institute of Banking and Finance (NIBAF)",
      ],
      ur: [
        "ایم ایس اسلامی بزنس اینڈ فنانس، رفاہ انٹرنیشنل یونیورسٹی",
        "ایم ایس سی اسلامی بینکاری و مالیات، بین الاقوامی اسلامی یونیورسٹی اسلام آباد (میرٹ اسکالر)",
        "پی جی ڈی پروفیشنل ایتھکس اینڈ ٹیچنگ میتھڈولوجی",
        "FIBO، نیشنل انسٹیٹیوٹ آف بینکنگ اینڈ فنانس (NIBAF)",
      ],
    },
    focus: {
      en: ["Islamic banking", "Islamic law of transactions", "Islamic jurisprudence and economics", "Takaful", "Business ethics"],
      ur: ["اسلامی بینکاری", "اسلامی قانونِ معاملات", "فقہ اسلامی اور اسلامی معاشیات", "تکافل", "کاروباری اخلاقیات"],
    },
    email: "ikramullahjaan@gmail.com",
    links: [{ label: { en: "Watch a lecture", ur: "لیکچر دیکھیں" }, href: "https://youtu.be/KRnsvwIahuY" }],
  },
];
