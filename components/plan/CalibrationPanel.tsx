"use client";

import { useEffect, useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { classifyHook } from "@/lib/psych";

type Entry = { text: string; predicted: number; actualCtr: number; angle: string; channel: string };

const KEY = "hookai-calibration";

function read(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export default function CalibrationPanel({ result }: { result: AnalyzeResult }) {
  const [entries, setEntries] = useState<Entry[]>(read);
  const [pick, setPick] = useState("");
  const [ctr, setCtr] = useState("");

  useEffect(() => {
    write(entries);
  }, [entries]);

  const top = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 6);

  function add() {
    const hook = top.find((h) => h.text === pick);
    const val = parseFloat(ctr);
    if (!hook || isNaN(val)) return;
    setEntries((prev) => [
      ...prev.filter((e) => e.text !== pick),
      { text: pick, predicted: hook.score, actualCtr: val, angle: classifyHook(hook.text), channel: hook.channel },
    ]);
    setPick("");
    setCtr("");
  }

  const usable = entries.length >= 3;
  const avgPred = usable ? entries.reduce((s, e) => s + e.predicted, 0) / entries.length : 0;
  const avgAct = usable ? entries.reduce((s, e) => s + e.actualCtr, 0) / entries.length : 0;
  const bias = usable ? avgAct - avgPred / 8 : 0;

  // per-angle learning: which angle type over/under-performs for THIS user
  const byAngle = new Map<string, { n: number; ctr: number }>();
  entries.forEach((e) => {
    const cur = byAngle.get(e.angle) || { n: 0, ctr: 0 };
    cur.n += 1;
    cur.ctr += e.actualCtr;
    byAngle.set(e.angle, cur);
  });
  const learned = [...byAngle.entries()]
    .map(([angle, v]) => ({ angle, ctr: v.ctr / v.n, n: v.n }))
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Score calibration over time</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Log real CTR results for hooks you run. Once you have 3+, the tool tells you how far off its predictions are —
        so you know whether to trust (or discount) future scores.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="block flex-1 min-w-[200px]">
          <span className="mb-1 block text-xs text-zinc-500">Hook you ran</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">Select a hook…</option>
            {top.map((h) => (
              <option key={h.id} value={h.text}>
                {h.text}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-36">
          <span className="mb-1 block text-xs text-zinc-500">Actual CTR %</span>
          <input type="number" step="0.1" value={ctr} onChange={(e) => setCtr(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
        <button onClick={add} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
          Log result
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entries.map((e) => (
            <span key={e.text} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {e.text.slice(0, 32)}… · {e.actualCtr}% CTR
            </span>
          ))}
        </div>
      )}

      {usable ? (
        <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
          <p>
            Avg predicted score: <strong>{avgPred.toFixed(0)}/100</strong> (≈ {(avgPred / 8).toFixed(2)}% CTR in our
            model) vs. your real <strong>{avgAct.toFixed(2)}%</strong>.
          </p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {Math.abs(bias) < 0.5
              ? "Model is well-calibrated for you — keep trusting scores."
              : bias > 0
                ? `Scores are UNDERpredicting by ~${bias.toFixed(1)} pts of CTR — treat 90+ as very strong.`
                : `Scores are OVERpredicting by ~${Math.abs(bias).toFixed(1)} pts of CTR — treat 90+ as strong, not guaranteed.`}
          </p>
          {learned.length > 0 && (
            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                What wins for you (by angle)
              </p>
              <ul className="mt-1.5 space-y-1">
                {learned.map((l) => (
                  <li key={l.angle} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{l.angle}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{l.ctr.toFixed(2)}% CTR</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-zinc-500">
                Estimated scores for this run&apos;s hooks, adjusted by your bias:{" "}
                {[...result.hooks]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((h) => `${Math.max(0, Math.min(100, Math.round(h.score / 8 + bias * 8)))}`).join(" · ")}{" "}
                /100 (scaled)
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-zinc-400">Log at least 3 real results to see calibration bias.</p>
      )}
    </div>
  );
}