"use client";

import type { AnalyzeResult } from "@/lib/types";
import { funnelMap } from "@/lib/perf";

const STAGE_COLORS: Record<string, string> = {
  TOFU: "bg-sky-500",
  MOFU: "bg-indigo-500",
  BOFU: "bg-emerald-500",
};

export default function FunnelPanel({ result }: { result: AnalyzeResult }) {
  const stages = funnelMap(result);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Funnel-stage mapping</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Which stage each hook targets. A healthy campaign spans all three — pure awareness rarely converts, pure
        urgency rarely attracts.
      </p>
      <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {stages.map((s) =>
          s.share > 0 ? (
            <div key={s.stage} className={STAGE_COLORS[s.stage]} style={{ width: `${s.share}%` }} title={`${s.stage}: ${s.share}%`} />
          ) : null
        )}
      </div>
      <div className="mt-4 space-y-3">
        {stages.map((s) => (
          <div key={s.stage} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{s.stage}</span>
              <span className="text-xs text-zinc-500">{s.share}% · {s.hooks.length} hooks</span>
            </div>
            <p className="text-xs text-zinc-500">{s.label}</p>
            {s.hooks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.hooks.slice(0, 6).map((h) => (
                  <span key={h.id} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {h.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}