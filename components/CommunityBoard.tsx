"use client";

import { useMemo, useState } from "react";
import { CHANNEL_LABELS } from "@/lib/types";

type BoardHook = {
  hook: string;
  score: number;
  channel?: string;
  psychology?: string;
  topic?: string;
  created_at: string;
};

const CHANNELS = ["all", "ad", "email", "youtube", "blog"] as const;

export default function CommunityBoard({ hooks }: { hooks: BoardHook[] }) {
  const [filter, setFilter] = useState<(typeof CHANNELS)[number]>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return hooks;
    return hooks.filter((h) => h.channel === filter);
  }, [hooks, filter]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CHANNELS.map((c) => {
          const count = c === "all" ? hooks.length : hooks.filter((h) => h.channel === c).length;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                filter === c
                  ? "bg-gradient-brand text-white shadow-md shadow-indigo-500/25"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {c === "all" ? "All" : CHANNEL_LABELS[c as keyof typeof CHANNEL_LABELS].replace("line", "").trim()}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xl font-semibold">No hooks yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Be the first — run an analysis and your best hooks will appear here.
            </p>
          </div>
        )}
        {filtered.map((h, i) => (
          <div
            key={`${h.hook}-${i}`}
            className="card-elevated flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
          >
            <span className="text-gradient w-8 shrink-0 text-center text-xl font-bold">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug">{h.hook}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {h.channel && CHANNEL_LABELS[h.channel as keyof typeof CHANNEL_LABELS] && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {CHANNEL_LABELS[h.channel as keyof typeof CHANNEL_LABELS]}
                  </span>
                )}
                {h.psychology && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{h.psychology}</span>
                )}
                {h.topic && <span className="text-zinc-400">for {h.topic}</span>}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="bg-gradient-brand rounded-full px-3 py-1 text-sm font-bold text-white">{h.score}</span>
              <button
                onClick={() => copy(h.hook, `${h.hook}-${i}`)}
                className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                {copied === `${h.hook}-${i}` ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
