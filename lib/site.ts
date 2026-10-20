// Central site configuration. Edit contact details and Zakat reference prices here.

export const site = {
  name: { en: "Al-Ihkam", ur: "الاحکام" },
  arabicName: "الإحكام",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://al-ihkam.com",
  email: "zeeshanraees2015@gmail.com",
  phone: "+92 333 554 2606",
  phoneHref: "tel:+923335542606",
  whatsappNumber: "923335542606",
  city: { en: "Islamabad and Rawalpindi, Pakistan", ur: "اسلام آباد اور راولپنڈی، پاکستان" },
} as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// Zakat reference figures. Prices move every day: update these, or let visitors
// type today's rate into the calculator (the fields are editable).
export const zakatReference = {
  silverPerTola: 7169, // PKR, All Pakistan Sarafa Gems & Jewellers Association
  goldPerTola: 471000, // PKR, 24 karat, same source
  pricesAsOf: { en: "20 August 2026", ur: "20 اگست 2026" },
  priceSource: "All Pakistan Sarafa Gems & Jewellers Association",
  // Government bank deduction threshold for 1446–47 AH, notified February 2026.
  officialNisab: 503529,
  officialNisabYear: { en: "1447 AH (Ramadan 2026)", ur: "1447ھ (رمضان 2026)" },
  silverNisabTola: 52.5,
  goldNisabTola: 7.5,
  gramsPerTola: 11.664,
};
