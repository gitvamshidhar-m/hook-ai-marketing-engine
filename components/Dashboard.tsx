"use client";

import { useEffect, useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

type Stats = {
  runs: number;
  hooks: number;
  best: number;
  lastBestText: string;
  recent: string[];
};

const KEY = "hookai-stats";

function defaults(): Stats {
  return { runs: 0, hooks: 0, best: 0, lastBestText: "", recent: [] };
}

function read(): Stats {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaults();
  } catch {
    return defaults();
  }
}

export default function Dashboard({ result }: { result: AnalyzeResult | null }) {
  const [stats] = useState<Stats>(read);

  useEffect(() => {
    if (!result) return;
    const top = result.hooks.reduce((a, b) => (b.score > a.score ? b : a), result.hooks[0]);
    const prev = read();
    const next: Stats = {
      runs: prev.runs + 1,
      hooks: prev.hooks + result.hooks.length,
      best: top && top.score > prev.best ? top.score : prev.best,
      lastBestText: top && top.score > prev.best ? top.text : prev.lastBestText,
      recent: [result.topic, ...prev.recent].slice(0, 5),
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, [result]);

  const currentTop = result
    ? result.hooks.reduce((a, b) => (b.score > a.score ? b : a), result.hooks[0])
    : undefined;
  const best = currentTop && currentTop.score > stats.best ? currentTop.score : stats.best;
  const bestText = currentTop && currentTop.score > stats.best ? currentTop.text : stats.lastBestText;
  const runs = result ? stats.runs + 1 : stats.runs;
  const hooks = result ? stats.hooks + result.hooks.length : stats.hooks;

  const cards = [
    { label: "Hooks generated", value: hooks.toLocaleString(), hint: "this browser" },
    { label: "Runs", value: runs, hint: "this browser" },
    { label: "Best predicted score", value: best ? `${best}/100` : "—", hint: "your ceiling" },
  ];

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your live dashboard</h2>
          <span className="text-xs text-zinc-400">stored in your browser · resets on clear</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-zinc-400">{c.hint}</p>
            </div>
          ))}
        </div>
        {bestText && (
          <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Highest-scoring hook: “{bestText}” — {best}/100
          </p>
        )}
      </div>
    </section>
  );
}
