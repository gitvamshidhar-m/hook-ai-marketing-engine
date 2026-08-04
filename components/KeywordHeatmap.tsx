"use client";

import type { AnalyzeResult } from "@/lib/types";

export default function KeywordHeatmap({ result }: { result: AnalyzeResult }) {
  const rows = result.keywords || [];
  if (rows.length === 0) return null;
  const max = Math.max(1, ...rows.map((r) => r.competitorMentions));
  const mine = Math.max(1, ...rows.map((r) => r.yourMentions || 0));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Keyword positioning map</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Which keywords your competitors anchor on vs which appear in your hooks. Where you overlap is a crowded fight;
        where you diverge is differentiation.
      </p>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.keyword} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm font-medium">{r.keyword}</span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(r.competitorMentions / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-zinc-400">{r.competitorMentions}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${((r.yourMentions || 0) / mine) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-zinc-400">{r.yourMentions || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> competitors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" /> your hooks
        </span>
      </div>
    </div>
  );
}
