"use client";

import { useEffect } from "react";

export default function ShareTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const dedupKey = "hookai-share-viewed";
    const seen = new Set<string>();
    try {
      JSON.parse(sessionStorage.getItem(dedupKey) || "[]").forEach((s: unknown) => {
        if (typeof s === "string") seen.add(s);
      });
    } catch {
      /* ignore */
    }
    if (!seen.has(slug)) {
      seen.add(slug);
      try {
        sessionStorage.setItem(dedupKey, JSON.stringify([...seen]));
      } catch {
        /* ignore */
      }
      fetch("/api/shares/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: "view" }),
      }).catch(() => {});
    }

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-track-share]");
      if (!el) return;
      fetch("/api/shares/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: "click" }),
      }).catch(() => {});
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);

  return null;
}
