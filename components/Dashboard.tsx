"use client";

import { useEffect, useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

type Stats = {
  runs: number;
  hooks: number;
  best: number;
  lastBestText: string;
  recent: string[];
  streak: number;
  lastDay: string;
};

const KEY = "hookai-stats";

function defaults(): Stats {
  return { runs: 0, hooks: 0, best: 0, lastBestText: "", recent: [], streak: 0, lastDay: "" };
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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeNext(prev: Stats, result: AnalyzeResult): Stats {
  const top = result.hooks.reduce((a, b) => (b.score > a.score ? b : a), result.hooks[0]);
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = 1;
  if (prev.lastDay === today) streak = prev.streak;
  else if (prev.lastDay === yesterday) streak = prev.streak + 1;
  const topic = result.topic.trim();
  const recent = [topic, ...prev.recent.filter((t) => t.trim().toLowerCase() !== topic.toLowerCase())].slice(0, 5);
  return {
    runs: prev.runs + 1,
    hooks: prev.hooks + result.hooks.length,
    best: top && top.score > prev.best ? top.score : prev.best,
    lastBestText: top && top.score > prev.best ? top.text : prev.lastBestText,
    recent,
    streak,
    lastDay: today,
  };
}

export default function Dashboard({ result }: { result: AnalyzeResult | null }) {
  const [stats] = useState<Stats>(read);

  useEffect(() => {
    if (!result) return;
    const next = computeNext(read(), result);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, [result]);

  const merged = result ? computeNext(stats, result) : stats;
  const cards = [
    { label: "Hooks generated", value: merged.hooks.toLocaleString(), hint: "this browser" },
    { label: "Runs", value: merged.runs, hint: "this browser" },
    { label: "Best predicted score", value: merged.best ? `${merged.best}/100` : "—", hint: "your ceiling" },
    { label: "Daily streak", value: merged.streak, icon: "🔥", hint: "keep coming back" },
  ];

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-4">
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your live dashboard</h2>
          <span className="text-xs text-zinc-400">stored in your browser · resets on clear</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-800">
              <p className="text-xs font-medium text-zinc-500">{c.label}</p>
              <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tracking-tight">
                <span className="text-gradient">{String(c.value)}</span>
                {c.icon && <span className="text-xl" aria-hidden>{c.icon}</span>}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">{c.hint}</p>
            </div>
          ))}
        </div>
        {merged.lastBestText ? (
          <p className="mt-5 rounded-xl bg-gradient-soft px-4 py-3 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            Highest-scoring hook: “{merged.lastBestText}” — {merged.best}/100
          </p>
        ) : null}
        {merged.recent.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Recent topics (session memory)</h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {merged.recent.slice(0, 5).map((t) => (
                <li key={t} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-800">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
