import type { NextConfig } from "next";

// Extra origins allowed to submit admin forms (needed when the site sits behind a proxy
// with a different host name), e.g. ADMIN_ALLOWED_ORIGINS=alihkam.example.com
const allowedOrigins = (process.env.ADMIN_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
  async headers() {
    return [
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb", // media uploads
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
