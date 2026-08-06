"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/tracking";

const KEY = "hookai-hero-variant";

type Variant = "A" | "B";

function pickVariant(forced?: string): Variant {
  if (forced === "A" || forced === "B") return forced;
  if (typeof window === "undefined") return "A";
  try {
    const existing = localStorage.getItem(KEY) as Variant | null;
    if (existing === "A" || existing === "B") return existing;
    const v: Variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(KEY, v);
    return v;
  } catch {
    return Math.random() < 0.5 ? "A" : "B";
  }
}

export default function HeroAb({ forced }: { forced?: string }) {
  const [variant] = useState<Variant>(() => pickVariant(forced));
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("hero_view", { variant });
    }
    const onDocClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-hero-cta]");
      if (el) track("hero_click", { variant });
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [variant]);

  return (
    <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl [animation-delay:80ms]">
      {variant === "B" ? (
        <>
          The hook machine.
          <br />
          <span className="text-gradient">Stop guessing what converts.</span>
        </>
      ) : (
        <>
          Stop writing headlines.
          <br />
          <span className="text-gradient">Start winning angles.</span>
        </>
      )}
    </h1>
  );
}
