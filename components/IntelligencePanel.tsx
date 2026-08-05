"use client";

import { ANGLE_CATEGORIES } from "@/lib/types";
import type { AnalyzeResult } from "@/lib/types";
import { computeCoverage } from "@/lib/analytics";
import { computeHealthScore } from "@/lib/health";

export default function IntelligencePanel({ result }: { result: AnalyzeResult }) {
  const cov = computeCoverage(result);
  const pct = Math.round((cov.covered / cov.total) * 100);
  const competitorUsed = (id: string) => cov.competitorIds.includes(id);
  const health = computeHealthScore(result);

  return (
    <div className="mt-5 space-y-5">
      {/* Health score */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Campaign Health Score</h3>
            <p className="mt-1 text-sm text-zinc-500">
              One number that grades your whole campaign, from angle diversity to readability.
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold leading-none">{health.score}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">{health.grade}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          {health.factors.map((f) => (
            <div key={f.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{f.label}</span>
                <span className="font-semibold">{Math.round(f.score)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${f.ok ? "bg-emerald-500" : f.score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {health.checklist.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  c.ok ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                }`}
              >
                {c.ok ? "✓" : "✕"}
              </span>
              {c.label}
            </div>
          ))}
        </div>
      </div>

      {/* Coverage meter */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Angle coverage meter</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {cov.covered}/{cov.total} psychological angles used across your hooks.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              pct >= 70
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : pct >= 40
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          {ANGLE_CATEGORIES.map((c) => {
            const used = cov.perAngle[c.id] > 0;
            return used ? (
              <div key={c.id} className="h-full" style={{ background: c.tint, width: `${100 / cov.total}%` }} />
            ) : null;
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {pct >= 70
            ? "Strong spread — you're hitting multiple triggers. This is a varied campaign."
            : pct >= 40
              ? "Decent, but a few angles are doing all the work. Diversify below."
              : "Heavy concentration on one or two triggers. Competitors likely do the same."}
        </p>
      </div>

      {/* Heatmap */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">Competitor angle heatmap</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Where your competitors cluster (●) vs where you&apos;re free to play (○). The blue-ocean angles are your best openings.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ANGLE_CATEGORIES.map((c) => {
            const mine = cov.perAngle[c.id] > 0;
            const theirs = competitorUsed(c.id);
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-indigo-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-indigo-900 dark:hover:bg-zinc-950">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    mine
                      ? "bg-gradient-brand text-white"
                      : theirs
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                  }`}
                  title={theirs ? "Competitors saturate this" : mine ? "You use this" : "Untapped"}
                >
                  {mine ? "YOU" : theirs ? "●" : "○"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-zinc-400">
                    {theirs ? "Saturated by competitors" : mine ? `In your campaign · ${cov.perAngle[c.id]} hook${cov.perAngle[c.id] > 1 ? "s" : ""}` : "Blue ocean — go here"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
