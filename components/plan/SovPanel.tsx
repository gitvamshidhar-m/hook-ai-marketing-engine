"use client";

import type { AnalyzeResult } from "@/lib/types";
import { sovRows } from "@/lib/perf";
import { ANGLE_CATEGORIES } from "@/lib/types";

export default function SovPanel({ result }: { result: AnalyzeResult }) {
  const rows = sovRows(result);
  const name = (id: string) => ANGLE_CATEGORIES.find((a) => a.id === id)?.name || id;
  const max = Math.max(...rows.map((r) => r.you + r.competitors), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Share-of-voice tracker</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Who owns each angle — your hooks vs. the competitor lines you pasted. Angles where competitors dominate are
        crowded; where they&apos;re absent is your blue ocean.
      </p>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.angle}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{name(r.angle)}</span>
              <span className="text-zinc-500">
                you {r.you} · comp {r.competitors}
              </span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="bg-indigo-500" style={{ width: `${(r.you / max) * 100}%` }} title={`You: ${r.you}`} />
              <div className="bg-amber-400" style={{ width: `${(r.competitors / max) * 100}%` }} title={`Competitors: ${r.competitors}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Your hooks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Competitors
        </span>
      </div>
    </div>
  );
}