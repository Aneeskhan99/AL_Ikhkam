import "@fontsource-variable/hanken-grotesk/index.css";
import "@fontsource-variable/noto-nastaliq-urdu/index.css";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/libre-caslon-text/400.css";
import "./admin.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Al-Ihkam admin", template: "%s | Al-Ihkam admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="admin" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
