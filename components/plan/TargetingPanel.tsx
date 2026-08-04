"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { targetingSuggestions } from "@/lib/perf";

export default function TargetingPanel({ result }: { result: AnalyzeResult }) {
  const [copyState, setCopyState] = useState("");
  const t = targetingSuggestions(result);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(id);
      setTimeout(() => setCopyState(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const blocks = [
    { id: "meta", label: "Meta interests", list: t.meta },
    { id: "tiktok", label: "TikTok keywords & hashtags", list: t.tiktok },
    { id: "google", label: "Google Ads keywords", list: t.google },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Platform targeting suggestions</h3>
      <p className="mt-1 text-sm text-zinc-500">{t.note}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{b.label}</h4>
              <button
                onClick={() => copy(b.list.join(", "), b.id)}
                className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {copyState === b.id ? "Copied" : "Copy"}
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {b.list.map((item) => (
                <li key={item} className="rounded bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}