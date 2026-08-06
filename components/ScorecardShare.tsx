"use client";

import { useState } from "react";
import { track } from "@/lib/tracking";

export default function ScorecardShare({
  q,
  s,
  p,
  t,
}: {
  q: string;
  s: number;
  p: string;
  t: string;
}) {
  const [copied, setCopied] = useState(false);
  const params = `q=${encodeURIComponent(q)}&s=${s}&p=${encodeURIComponent(p)}&t=${encodeURIComponent(t)}`;
  const url = typeof window !== "undefined" ? `${window.location.origin}/card?${params}` : `/card?${params}`;
  const text = `“${q}” — a ${p} hook scored ${s}/100 by Hook AI. Bet you can't top it.`;
  const shared = "https://hook-ai-marketing-engine.vercel.app/";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("card_link_copied", { s });
    } catch {
      /* ignore */
    }
  }

  function shareX() {
    track("card_shared_x", { s });
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, "_blank", "noopener");
  }

  function shareLinkedIn() {
    track("card_shared_linkedin", { s });
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">Make it viral</p>
        <p className="text-xs text-zinc-500">Challenge your network to beat this score.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {copied ? "Link copied!" : "Copy link"}
        </button>
        <button
          onClick={shareX}
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Share on X
        </button>
        <button
          onClick={shareLinkedIn}
          className="rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          LinkedIn
        </button>
        <span className="hidden items-center text-xs text-zinc-400 sm:flex">Get the tool · {shared}</span>
      </div>
    </div>
  );
}