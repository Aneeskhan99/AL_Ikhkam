import type { L } from "../i18n";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string; arabic?: string };

export type Article = {
  slug: string;
  topic: L;
  title: L;
  excerpt: L;
  image: string;
  imageAlt: L;
  minutes: number;
  date: string; // ISO
  body: L<Block[]>;
};

export const articles: Article[] = [
  {
    slug: "understanding-riba-in-modern-banking",
    topic: { en: "Islamic finance", ur: "اسلامی مالیات" },
    title: { en: "Understanding riba in modern banking", ur: "جدید بینکاری میں سود کی حقیقت" },
    excerpt: {
      en: "Why a fixed return on a loan is prohibited, and how Islamic banks earn a return without it.",
      ur: "قرض پر طے شدہ اضافہ کیوں حرام ہے، اور اسلامی بینک اس کے بغیر منافع کیسے کماتے ہیں۔",
    },
    image: "/images/insight-riba.jpg",
    imageAlt: { en: "Concrete arches receding into morning haze", ur: "صبح کی دھند میں کنکریٹ کی محرابیں" },
    minutes: 5,
    date: "2026-09-15",
    body: {
      en: [
        { type: "p", text: "Riba is usually translated as interest, but the Arabic word means increase. In finance it refers to any increase on a loan that is agreed in advance as a condition of lending. The amount does not matter: a small fixed return on money lent is riba in the same way a large one is." },
        { type: "quote", arabic: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا", text: "Allah has permitted trade and has forbidden riba.", cite: "Surah al-Baqarah, 2:275" },
        { type: "h2", text: "Trade, not lending, is the model" },
        { type: "p", text: "The verse draws the line that every Islamic financial product has to respect. Profit is allowed when it comes from trade, from renting out an asset, or from sharing in a business. In each case the person earning the profit takes on a real risk: they own goods that could be damaged, an asset that could lose value, or a share in a venture that could make a loss. A conventional loan earns a return simply because time passes, while the lender's capital is guaranteed." },
        { type: "h2", text: "How Islamic banks structure the alternatives" },
        { type: "ul", items: [
          "Murabaha: the bank buys an asset the customer needs and sells it on at a disclosed cost plus profit, payable later. The bank must own the asset and carry its risk before it sells.",
          "Ijarah: the bank buys an asset and leases it. Because the bank remains the owner, it bears the risks of ownership while the customer pays rent for its use.",
          "Diminishing Musharakah: the bank and customer co-own an asset such as a house. The customer rents the bank's share and gradually buys it out.",
          "Mudarabah deposits: savers provide capital and the bank manages it. Profit is shared at an agreed ratio, and the return is not guaranteed.",
        ] },
        { type: "h2", text: "Why the details matter" },
        { type: "p", text: "Many questions about Islamic banking come down to sequence. If a bank signs the sale to the customer before it has bought the goods, a Murabaha becomes a loan with extra paperwork. If a lease makes the customer responsible for every ownership risk, it starts to look like a disguised loan. This is why Shariah review looks at execution as well as at contracts." },
        { type: "p", text: "Islamic banks in Pakistan may price products against a market benchmark such as KIBOR. Scholars generally allow this as a way of setting a price, provided the underlying contract is a genuine sale, lease or partnership. The benchmark sets the number; the contract decides whether the profit is permissible." },
        { type: "h2", text: "Where Pakistan stands" },
        { type: "p", text: "In April 2022 the Federal Shariat Court ruled that interest-based banking must be replaced, setting the end of 2027 as the deadline. Banks, regulators and businesses are now working toward that transition, which makes a clear understanding of riba useful for every finance professional, not only those in Islamic banks." },
      ],
      ur: [
        { type: "p", text: "ربا کا ترجمہ عموماً سود کیا جاتا ہے، مگر عربی میں اس کا مطلب اضافہ ہے۔ مالیات میں اس سے مراد قرض پر ہر وہ اضافہ ہے جو قرض دینے کی شرط کے طور پر پہلے سے طے کر لیا جائے۔ رقم کی مقدار سے فرق نہیں پڑتا: قرض پر تھوڑا سا طے شدہ منافع بھی اسی طرح سود ہے جیسے زیادہ۔" },
        { type: "quote", arabic: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا", text: "اللہ نے تجارت کو حلال کیا ہے اور سود کو حرام۔", cite: "سورۂ البقرہ، 2:275" },
        { type: "h2", text: "بنیاد تجارت ہے، قرض نہیں" },
        { type: "p", text: "یہ آیت وہ حد کھینچتی ہے جس کا ہر اسلامی مالیاتی پروڈکٹ کو لحاظ رکھنا ہوتا ہے۔ منافع اس وقت جائز ہے جب وہ تجارت سے، کسی اثاثے کو کرائے پر دینے سے، یا کاروبار میں شراکت سے حاصل ہو۔ ہر صورت میں منافع کمانے والا حقیقی خطرہ اٹھاتا ہے: اس کی ملکیت میں ایسا مال ہوتا ہے جو خراب ہو سکتا ہے، ایسا اثاثہ جس کی قدر گر سکتی ہے، یا ایسے کاروبار میں حصہ جو نقصان میں جا سکتا ہے۔ روایتی قرض محض وقت گزرنے پر منافع دیتا ہے جبکہ قرض دینے والے کا سرمایہ محفوظ رہتا ہے۔" },
        { type: "h2", text: "اسلامی بینک متبادل کیسے بناتے ہیں" },
        { type: "ul", items: [
          "مرابحہ: بینک گاہک کی ضرورت کا اثاثہ خریدتا ہے اور اسے ظاہر کردہ لاگت اور منافع پر ادھار بیچتا ہے۔ بیچنے سے پہلے بینک کا اثاثے کا مالک ہونا اور اس کا خطرہ اٹھانا ضروری ہے۔",
          "اجارہ: بینک اثاثہ خرید کر کرائے پر دیتا ہے۔ چونکہ مالک بینک رہتا ہے، اس لیے ملکیت کے خطرات بھی وہی اٹھاتا ہے، اور گاہک استعمال کا کرایہ ادا کرتا ہے۔",
          "مشارکۂ متناقصہ: بینک اور گاہک کسی اثاثے، مثلاً گھر، کے مشترکہ مالک ہوتے ہیں۔ گاہک بینک کے حصے کا کرایہ دیتا ہے اور رفتہ رفتہ اسے خرید لیتا ہے۔",
          "مضاربہ ڈپازٹس: بچت کرنے والے سرمایہ دیتے ہیں اور بینک اس کا انتظام کرتا ہے۔ منافع طے شدہ تناسب سے تقسیم ہوتا ہے اور اس کی ضمانت نہیں ہوتی۔",
        ] },
        { type: "h2", text: "تفصیلات کیوں اہم ہیں" },
        { type: "p", text: "اسلامی بینکاری کے بہت سے سوالات ترتیب پر آ کر ختم ہوتے ہیں۔ اگر بینک مال خریدنے سے پہلے ہی گاہک کو فروخت کا معاہدہ کر لے تو مرابحہ اضافی کاغذات والا قرض بن جاتا ہے۔ اگر اجارے میں ملکیت کا ہر خطرہ گاہک پر ڈال دیا جائے تو وہ چھپا ہوا قرض لگنے لگتا ہے۔ اسی لیے شرعی جائزہ صرف معاہدوں کو نہیں بلکہ عملدرآمد کو بھی دیکھتا ہے۔" },
        { type: "p", text: "پاکستان میں اسلامی بینک اپنی پروڈکٹس کی قیمت KIBOR جیسے بازاری معیار کے حوالے سے طے کر سکتے ہیں۔ علماء عموماً اسے قیمت مقرر کرنے کے ایک طریقے کے طور پر جائز قرار دیتے ہیں، بشرطیکہ بنیادی معاہدہ حقیقی بیع، اجارہ یا شراکت ہو۔ معیار صرف عدد طے کرتا ہے؛ منافع کے جائز ہونے کا فیصلہ معاہدہ کرتا ہے۔" },
        { type: "h2", text: "پاکستان کہاں کھڑا ہے" },
        { type: "p", text: "اپریل 2022 میں وفاقی شرعی عدالت نے فیصلہ دیا کہ سود پر مبنی بینکاری کو ختم کیا جائے، اور اس کے لیے 2027 کے اختتام کی مہلت مقرر کی۔ بینک، ریگولیٹرز اور کاروباری ادارے اب اس منتقلی کی طرف بڑھ رہے ہیں، اس لیے سود کی واضح سمجھ ہر مالیاتی پیشہ ور کے لیے مفید ہے، صرف اسلامی بینکوں میں کام کرنے والوں کے لیے نہیں۔" },
      ],
    },
  },
  {
    slug: "aaoifi-screening-practical-guide",
    topic: { en: "Halal investing", ur: "حلال سرمایہ کاری" },
    title: { en: "AAOIFI screening: a practical guide", ur: "AAOIFI اسکریننگ: ایک عملی رہنما" },
    excerpt: {
      en: "The two tests a share must pass under AAOIFI Shariah Standard 21, and how purification works.",
      ur: "AAOIFI شرعی معیار نمبر 21 کے تحت کسی شیئر کو کن دو جانچوں سے گزرنا ہوتا ہے، اور تطہیر کیسے ہوتی ہے۔",
    },
    image: "/images/insight-screening.jpg",
    imageAlt: { en: "Green and ivory zellige tiles in an eight-pointed star pattern", ur: "آٹھ کونوں والے ستارے کے نقش میں سبز اور سفید ٹائلیں" },
    minutes: 6,
    date: "2026-08-28",
    body: {
      en: [
        { type: "p", text: "Very few listed companies are entirely free of interest. Most hold some cash in conventional banks and many carry some conventional debt. Shariah screening asks a narrower question: is this company's main business permissible, and is its exposure to interest small enough to tolerate? AAOIFI Shariah Standard No. 21, on financial papers, sets out the most widely used answer." },
        { type: "h2", text: "Test one: what the business does" },
        { type: "p", text: "The company's core activity must be permissible. Conventional banking and insurance, alcohol, pork, gambling, adult entertainment and similar activities fail this test no matter how clean the balance sheet is. A company whose main business passes can still have minor impermissible income, which the second test measures." },
        { type: "h2", text: "Test two: the financial ratios" },
        { type: "ul", items: [
          "Interest-bearing debt must not exceed 30% of the company's market capitalisation.",
          "Cash and investments held in interest-bearing accounts or instruments must not exceed 30% of market capitalisation.",
          "Income from impermissible sources must not exceed 5% of total revenue.",
        ] },
        { type: "p", text: "These thresholds are tolerances, not approval. They exist because avoiding all contact with interest is not yet practical in most markets. A company that passes is acceptable to hold, but the impermissible part of its income still has to be dealt with." },
        { type: "h2", text: "Purification" },
        { type: "p", text: "If 2% of a company's income comes from impermissible sources, then 2% of the dividend an investor receives should be given to charity, without expecting any reward for it. Some scholars also require purification of capital gains; others do not. Fund managers usually calculate a purification ratio for each holding and report it to investors." },
        { type: "h2", text: "Screening in Pakistan" },
        { type: "p", text: "Pakistan's Shariah-compliant indices and Shariah advisers apply their own published criteria, which follow the same logic but measure some ratios against total assets rather than market value. When you compare screening results from different providers, check which method each one uses before drawing conclusions." },
        { type: "p", text: "Ratios also change every quarter. A share that passed last year can fail after a large borrowing or a fall in its share price, which is why screening should be repeated, not done once." },
      ],
      ur: [
        { type: "p", text: "بہت کم لسٹڈ کمپنیاں سود سے مکمل طور پر پاک ہوتی ہیں۔ اکثر کی کچھ نقدی روایتی بینکوں میں ہوتی ہے اور بہت سی کچھ نہ کچھ روایتی قرض بھی رکھتی ہیں۔ شرعی اسکریننگ ایک محدود سوال پوچھتی ہے: کیا اس کمپنی کا بنیادی کاروبار جائز ہے، اور کیا سود سے اس کا تعلق اتنا کم ہے کہ اسے برداشت کیا جا سکے؟ AAOIFI کا شرعی معیار نمبر 21 (مالیاتی اوراق) اس کا سب سے زیادہ استعمال ہونے والا جواب دیتا ہے۔" },
        { type: "h2", text: "پہلی جانچ: کاروبار کیا ہے" },
        { type: "p", text: "کمپنی کی بنیادی سرگرمی جائز ہونی چاہیے۔ روایتی بینکاری و انشورنس، شراب، خنزیر، جوا، فحش تفریح اور اسی طرح کی سرگرمیاں اس جانچ میں ناکام رہتی ہیں، چاہے بیلنس شیٹ کتنی ہی صاف ہو۔ جس کمپنی کا بنیادی کاروبار درست ہو اس کی بھی کچھ معمولی ناجائز آمدنی ہو سکتی ہے، جسے دوسری جانچ ناپتی ہے۔" },
        { type: "h2", text: "دوسری جانچ: مالیاتی تناسب" },
        { type: "ul", items: [
          "سودی قرض کمپنی کی مارکیٹ کیپیٹلائزیشن کے 30 فیصد سے زیادہ نہ ہو۔",
          "سودی کھاتوں یا آلات میں رکھی گئی نقدی اور سرمایہ کاری مارکیٹ کیپیٹلائزیشن کے 30 فیصد سے زیادہ نہ ہو۔",
          "ناجائز ذرائع سے آمدنی کل آمدنی کے 5 فیصد سے زیادہ نہ ہو۔",
        ] },
        { type: "p", text: "یہ حدیں رعایت ہیں، منظوری نہیں۔ یہ اس لیے رکھی گئی ہیں کہ اکثر بازاروں میں ابھی سود سے مکمل بچنا عملاً ممکن نہیں۔ جو کمپنی ان پر پوری اترے اس کے شیئر رکھے جا سکتے ہیں، مگر اس کی آمدنی کے ناجائز حصے کا ازالہ پھر بھی ضروری ہے۔" },
        { type: "h2", text: "تطہیر" },
        { type: "p", text: "اگر کسی کمپنی کی 2 فیصد آمدنی ناجائز ذرائع سے ہو تو سرمایہ کار کو ملنے والے منافع کا 2 فیصد ثواب کی نیت کے بغیر صدقہ کر دینا چاہیے۔ بعض علماء سرمایہ جاتی منافع کی تطہیر بھی ضروری قرار دیتے ہیں اور بعض نہیں۔ فنڈ منیجرز عموماً ہر شیئر کے لیے تطہیر کا تناسب نکال کر سرمایہ کاروں کو بتاتے ہیں۔" },
        { type: "h2", text: "پاکستان میں اسکریننگ" },
        { type: "p", text: "پاکستان کے شریعہ کمپلائنٹ انڈیکس اور شریعہ ایڈوائزرز اپنے شائع شدہ معیارات استعمال کرتے ہیں، جو اسی منطق پر قائم ہیں مگر بعض تناسب مارکیٹ ویلیو کی بجائے کل اثاثوں کے مقابلے میں ناپتے ہیں۔ مختلف اداروں کے اسکریننگ نتائج کا موازنہ کرتے وقت پہلے دیکھ لیں کہ ہر ایک کون سا طریقہ استعمال کرتا ہے۔" },
        { type: "p", text: "تناسب ہر سہ ماہی بدلتے بھی ہیں۔ جو شیئر پچھلے سال درست تھا وہ کسی بڑے قرض یا قیمت میں کمی کے بعد ناکام ہو سکتا ہے، اسی لیے اسکریننگ ایک بار نہیں بلکہ بار بار ہونی چاہیے۔" },
      ],
    },
  },
  {
    slug: "zakat-on-shares-and-mutual-funds",
    topic: { en: "Zakat", ur: "زکوٰۃ" },
    title: { en: "Zakat on shares and mutual funds", ur: "شیئرز اور میوچل فنڈز پر زکوٰۃ" },
    excerpt: {
      en: "The two scholarly approaches to Zakat on equity, explained simply, with what happens at your bank.",
      ur: "شیئرز پر زکوٰۃ کے بارے میں علماء کے دو طریقے آسان انداز میں، اور بینک میں کیا ہوتا ہے۔",
    },
    image: "/images/insight-zakat-shares.jpg",
    imageAlt: { en: "A brass balance with silver coins and a gold bar", ur: "پیتل کا ترازو، چاندی کے سکے اور سونے کی اینٹ" },
    minutes: 5,
    date: "2026-08-10",
    body: {
      en: [
        { type: "p", text: "A share is part ownership of a company. So the question is not only what the share is worth, but what you actually own through it. Scholars answer this in two ways, and the right one depends on why you hold the share." },
        { type: "h2", text: "If you hold shares to sell them" },
        { type: "p", text: "Shares bought for trading, to profit from a rise in price, are treated like a trader's stock. Zakat is due at 2.5% of their full market value on the day your Zakat year completes. Most active investors fall into this group." },
        { type: "h2", text: "If you hold shares for the long term" },
        { type: "p", text: "Shares held for dividends rather than resale are treated differently. Here you pay Zakat only on your share of the company's zakatable assets, such as its cash, receivables and stock held for sale. Buildings, machinery and other fixed assets used to run the business are excluded." },
        { type: "p", text: "To use this method, divide the company's zakatable assets by the number of shares in issue, multiply by the shares you hold and apply 2.5%. The figures come from the latest published balance sheet. If they are not available, many scholars advise paying on the full market value to be safe." },
        { type: "h2", text: "Mutual funds" },
        { type: "p", text: "A fund unit is a share in a pool of investments. For most investors the simplest approach is to pay Zakat on the value of their units on their Zakat date. Some Shariah-compliant funds publish the zakatable portion of each unit, which lets long-term investors use the second method." },
        { type: "h2", text: "What happens at your bank" },
        { type: "p", text: "In Pakistan, Zakat is deducted at source on the first of Ramadan from certain savings accounts and investments held by Muslim citizens whose balance is above the official Nisab. A person who holds that Zakat is not due on them under their school of thought can file a declaration on form CZ-50 to be exempt from the deduction. Zakat deducted at source counts toward what you owe, so subtract it from your own calculation." },
        { type: "p", text: "Use our calculator to work out the rest of your Zakat, and ask a scholar if you hold shares in many companies or through a business." },
      ],
      ur: [
        { type: "p", text: "شیئر کسی کمپنی میں جزوی ملکیت ہے۔ اس لیے سوال صرف یہ نہیں کہ شیئر کی قیمت کیا ہے، بلکہ یہ کہ اس کے ذریعے آپ اصل میں کس چیز کے مالک ہیں۔ علماء اس کا جواب دو طرح دیتے ہیں، اور درست طریقہ اس پر منحصر ہے کہ آپ نے شیئر کیوں رکھا ہے۔" },
        { type: "h2", text: "اگر شیئر بیچنے کے لیے رکھے ہیں" },
        { type: "p", text: "جو شیئر قیمت بڑھنے پر منافع کمانے کے لیے خریدے گئے ہوں وہ تاجر کے مالِ تجارت کی طرح ہیں۔ زکوٰۃ کا سال مکمل ہونے کے دن ان کی پوری بازاری قیمت پر ڈھائی فیصد زکوٰۃ واجب ہے۔ اکثر فعال سرمایہ کار اسی زمرے میں آتے ہیں۔" },
        { type: "h2", text: "اگر شیئر طویل مدت کے لیے رکھے ہیں" },
        { type: "p", text: "جو شیئر دوبارہ بیچنے کی بجائے منافع (ڈیویڈنڈ) کے لیے رکھے گئے ہوں ان کا حکم مختلف ہے۔ اس صورت میں زکوٰۃ صرف کمپنی کے قابلِ زکوٰۃ اثاثوں میں آپ کے حصے پر ہے، مثلاً اس کی نقدی، وصول طلب رقوم اور فروخت کے لیے رکھا گیا مال۔ کاروبار چلانے کے لیے استعمال ہونے والی عمارتیں، مشینری اور دیگر مستقل اثاثے شامل نہیں۔" },
        { type: "p", text: "اس طریقے میں کمپنی کے قابلِ زکوٰۃ اثاثوں کو جاری شدہ شیئرز کی تعداد پر تقسیم کریں، اپنے شیئرز کی تعداد سے ضرب دیں اور ڈھائی فیصد نکالیں۔ اعداد تازہ ترین شائع شدہ بیلنس شیٹ سے لیے جاتے ہیں۔ اگر یہ دستیاب نہ ہوں تو بہت سے علماء احتیاطاً پوری بازاری قیمت پر زکوٰۃ دینے کا مشورہ دیتے ہیں۔" },
        { type: "h2", text: "میوچل فنڈز" },
        { type: "p", text: "فنڈ کا یونٹ سرمایہ کاری کے ایک مجموعے میں حصہ ہے۔ اکثر سرمایہ کاروں کے لیے آسان طریقہ یہ ہے کہ زکوٰۃ کی تاریخ پر اپنے یونٹس کی قیمت پر زکوٰۃ ادا کریں۔ بعض شریعہ کمپلائنٹ فنڈز ہر یونٹ کا قابلِ زکوٰۃ حصہ شائع کرتے ہیں، جس سے طویل مدتی سرمایہ کار دوسرا طریقہ اپنا سکتے ہیں۔" },
        { type: "h2", text: "آپ کے بینک میں کیا ہوتا ہے" },
        { type: "p", text: "پاکستان میں یکم رمضان کو ان مسلمان شہریوں کے بعض بچت کھاتوں اور سرمایہ کاری سے زکوٰۃ منہا کی جاتی ہے جن کا بیلنس سرکاری نصاب سے زیادہ ہو۔ جو شخص اپنے فقہی مسلک کے مطابق سمجھتا ہو کہ اس پر یہ زکوٰۃ واجب نہیں، وہ کٹوتی سے استثنیٰ کے لیے فارم CZ-50 پر حلف نامہ جمع کرا سکتا ہے۔ منہا شدہ زکوٰۃ آپ کی واجب زکوٰۃ میں شمار ہوتی ہے، اس لیے اسے اپنے حساب سے منفی کر لیں۔" },
        { type: "p", text: "باقی زکوٰۃ کے حساب کے لیے ہمارا کیلکولیٹر استعمال کریں، اور اگر آپ کے پاس بہت سی کمپنیوں کے شیئرز ہوں یا کاروبار کے ذریعے ہوں تو کسی عالم سے رجوع کریں۔" },
      ],
    },
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
