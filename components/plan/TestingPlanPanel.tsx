"use client";

import type { AnalyzeResult } from "@/lib/types";
import { testingPlan } from "@/lib/perf";

export default function TestingPlanPanel({ result }: { result: AnalyzeResult }) {
  const plan = testingPlan(result);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Creative testing plan</h3>
      <p className="mt-1 text-sm text-zinc-500">
        A prioritized 2-week roadmap: which hooks to run first, how much data each needs, and when to kill or scale.
      </p>
      <div className="mt-4 space-y-3">
        {plan.map((p) => (
          <div key={p.step} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {p.step}
                </span>
                <span className="text-sm font-medium">{p.hook.text}</span>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {p.hook.score}/100
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{p.strategy}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Min. <strong>{p.minClicks.toLocaleString()}</strong> clicks · {p.durationDays} days ·{" "}
              <span className="text-zinc-700 dark:text-zinc-300">{p.verdict}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}