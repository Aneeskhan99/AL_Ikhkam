"use client";

import { useEffect } from "react";

/**
 * Remembers where a visitor came from (UTM tags, external referrer, landing page) for this browser tab,
 * so an enquiry can record its source. Nothing is sent anywhere until the visitor submits the form.
 */
export default function SourceTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]) {
        const v = params.get(k);
        if (v) utm[k] = v.slice(0, 200);
      }
      const existing = sessionStorage.getItem("aih_src");
      const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
      if (!existing || Object.keys(utm).length) {
        sessionStorage.setItem(
          "aih_src",
          JSON.stringify({ utm, referrer: ref.slice(0, 500), landing: window.location.pathname + window.location.search }),
        );
      }
    } catch {
      /* storage unavailable: enquiries simply record less source detail */
    }
  }, []);
  return null;
}
