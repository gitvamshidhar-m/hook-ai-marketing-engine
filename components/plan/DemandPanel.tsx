"use client";

import type { AnalyzeResult } from "@/lib/types";
import { demandSignal } from "@/lib/demand";

const TREND_META: Record<string, { label: string; color: string }> = {
  rising: { label: "Demand rising", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40" },
  peaking: { label: "Demand peaking now", color: "text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/40" },
  falling: { label: "Demand fading", color: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40" },
  evergreen: { label: "Evergreen demand", color: "text-zinc-600 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800" },
};

export default function DemandPanel({ result }: { result: AnalyzeResult }) {
  const s = demandSignal(result.topic);
  const meta = TREND_META[s.trend];
  const month = new Date().getMonth();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Search-demand & seasonality signal</h3>
      <p className="mt-1 text-sm text-zinc-500">
        A fast heuristic on when this topic peaks — so you time angle choice to demand, not guess.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex h-3 w-40 max-w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="bg-gradient-to-r from-emerald-400 to-indigo-500" style={{ width: `${s.demand}%` }} />
          </div>
          <span className="text-xs text-zinc-500">Demand index · {s.demand}/100</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${meta.color}`}>{meta.label}</span>
      </div>
      {s.peakMonths.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={`rounded px-1.5 py-0.5 text-[10px] ${
                i === month
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : s.peakMonths.includes([
                        "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
                      ][i])
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
              }`}
            >
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}
            </span>
          ))}
          <span className="ml-1 text-xs text-zinc-400">peak months highlighted</span>
        </div>
      )}
      <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        {s.note}
      </p>
    </div>
  );
}