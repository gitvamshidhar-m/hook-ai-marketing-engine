"use client";

import { useState } from "react";
import type { AbTest, AnalyzeResult, Hook } from "@/lib/types";

const KEY = "hookai-abtests";

type Stored = { tests: AbTest[] };

function read(): Stored {
  if (typeof window === "undefined") return { tests: [] };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { tests: [] };
  } catch {
    return { tests: [] };
  }
}

export default function AbTestTracker({ result }: { result: AnalyzeResult | null }) {
  const [stored, setStored] = useState<Stored>(read);
  const [picked, setPicked] = useState(false);

  const pair: Hook[] =
    result && result.hooks.length >= 2
      ? [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 2)
      : [];

  function persist(next: Stored) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setStored(next);
  }

  function pickWinner(idx: 0 | 1, hookA: Hook, hookB: Hook) {
    const test: AbTest = {
      id: `${stored.tests.length}-${hookA.text.length}-${hookB.text.length}-${hookA.score}-${hookB.score}`,
      topic: result?.topic || "",
      hooks: [hookA.text, hookB.text],
      scores: [hookA.score, hookB.score],
      winner: idx,
      createdAt: new Date().toISOString(),
    };
    persist({ tests: [test, ...stored.tests].slice(0, 20) });
    setPicked(true);
  }

  function resetPick() {
    setPicked(false);
  }

  const wins = stored.tests.filter((t) => t.winner !== -1).length;
  const winsByFirst = stored.tests.filter((t) => t.winner === 0).length;
  const winRate = wins > 0 ? Math.round((winsByFirst / wins) * 100) : null;

  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">A/B test tracker</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Pick a winner between your two top hooks. The tracker logs which psychology wins so future runs lean that way.
          </p>
        </div>
        {winRate !== null && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {wins} tests · your #1 wins {winRate}%
          </span>
        )}
      </div>

      {pair.length === 2 && !picked ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([0, 1] as const).map((idx) => (
            <button
              key={idx}
              onClick={() => pickWinner(idx, pair[0], pair[1])}
              className="rounded-xl border border-zinc-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-zinc-800 dark:hover:bg-indigo-950/30"
            >
              <p className="text-sm font-medium">{pair[idx].text}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{pair[idx].psychology}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-800">{pair[idx].score}</span>
              </div>
            </button>
          ))}
        </div>
      ) : pair.length === 2 && picked ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">Winner logged. Generate fresh hooks to test a new pair.</p>
          <button
            onClick={resetPick}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Test again
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">Generate hooks to set up a head-to-head test.</p>
      )}

      {stored.tests.length > 0 && (
        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Recent tests</h4>
          <ul className="mt-2 space-y-1.5">
            {stored.tests.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-zinc-600 dark:text-zinc-400">
                  {t.winner !== -1 ? t.hooks[t.winner] : t.hooks[0]}
                </span>
                <span className="shrink-0 text-xs text-zinc-400">
                  {t.winner === -1 ? "tie" : `${t.scores[t.winner]} · won`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
