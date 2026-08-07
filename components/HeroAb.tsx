"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

const BLOCKS: Record<
  Variant,
  {
    headline: string;
    emphasis: string;
    subhead: string;
    primary: string;
    secondary: string;
  }
> = {
  A: {
    headline: "Stop writing headlines.",
    emphasis: "Start winning angles.",
    subhead:
      "Hook AI is the angle-discovery engine for digital marketers. It finds the psychological triggers your competitors are ignoring, scores every hook, drafts your ad copy, and plans your campaign — all in one shot.",
    primary: "Try the tool free",
    secondary: "See how it works",
  },
  B: {
    headline: "The hook machine.",
    emphasis: "Stop guessing what converts.",
    subhead:
      "Paste your topic, get 12 CTR-scored angles across ads, email, YouTube, and blog — plus a full campaign plan. Built for marketers who test with judgment, not guesses.",
    primary: "Generate my angles",
    secondary: "See the method",
  },
};

export default function HeroAb({ forced }: { forced?: string }) {
  const [variant] = useState<Variant>(() => pickVariant(forced));
  const tracked = useRef(false);
  const content = BLOCKS[variant];

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
    <>
      <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl [animation-delay:80ms]">
        {content.headline}
        <br />
        <span className="text-gradient">{content.emphasis}</span>
      </h1>
      <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 [animation-delay:160ms]">
        {content.subhead}
      </p>
      <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
        <Link
          href="#tool"
          data-hero-cta
          className="bg-gradient-brand rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[0.98]"
        >
          {content.primary}
        </Link>
        <a
          href="#features"
          data-hero-cta
          className="rounded-lg border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
        >
          {content.secondary}
        </a>
      </div>
    </>
  );
}