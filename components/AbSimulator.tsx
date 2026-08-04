"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

const BASELINE = 68;

export default function AbSimulator({ result }: { result: AnalyzeResult }) {
  const candidates = useMemo(
    () => [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 3),
    [result]
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => Math.min(100, p + 4));
    }, 40);
    return () => clearInterval(t);
  }, [result]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Live CTR simulator</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Estimated click-through vs the average headline (baseline ≈ {BASELINE}% relative lift). Bars animate as
            your hook “goes live”.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          simulated
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {candidates.map((h, i) => {
          const lift = Math.max(2, h.score - BASELINE);
          const width = Math.min(100, (lift / 30) * 100 * (progress / 100));
          return (
            <div key={h.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">#{i + 1} · {h.text}</span>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-800">
                  +{lift}%
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-100"
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {h.psychology} · predicted CTR lift +{lift}% over baseline
              </p>
            </div>
          );
        })}
      </div>

      {progress >= 100 && (
        <button
          onClick={() => setProgress(0)}
          className="mt-4 rounded-md border border-zinc-300 px-3 py-1 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Replay simulation
        </button>
      )}
    </div>
  );
}
