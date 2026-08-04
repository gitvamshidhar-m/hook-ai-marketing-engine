"use client";

import type { AnalyzeResult } from "@/lib/types";
import { platformPolicy } from "@/lib/perf";

export default function PolicyPanel({ result }: { result: AnalyzeResult }) {
  const hooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 4);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Platform ad-policy check</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Screens your top hooks for the claims and emphasis that Meta, TikTok, and Google frequently reject.
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {hooks.map((h) => {
          const checks = platformPolicy(h);
          return (
            <div key={h.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <p className="text-sm font-medium">{h.text}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {checks.map((c) => (
                  <div key={c.platform} className={`rounded-md p-2 text-xs ${c.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                    <span className="font-semibold">{c.platform}</span>
                    {c.ok ? <p>Likely OK</p> : (
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        {c.flags.slice(0, 2).map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}