"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { messageMatch } from "@/lib/perf";

export default function MessageMatchPanel({ result }: { result: AnalyzeResult }) {
  const [landing, setLanding] = useState("");
  const mm = messageMatch(result, landing);
  const show = landing.trim().length > 20;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Message-match score</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Paste your landing page copy. The score checks whether the page echoes your ad&apos;s promise — a mismatch is the
        #1 silent ROAS killer.
      </p>
      <textarea
        value={landing}
        onChange={(e) => setLanding(e.target.value)}
        rows={3}
        placeholder="Paste your landing page headline + body text here…"
        className="mt-3 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
      />
      {show ? (
        <>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                mm.score >= 70
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : mm.score >= 40
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              }`}
            >
              {mm.score}/100
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{mm.note}</p>
          </div>
          <div className="mt-3 space-y-2">
            {mm.matches.map((m) => (
              <div key={m.hook.id} className="rounded-lg border border-zinc-100 p-3 text-sm dark:border-zinc-800">
                <p className="font-medium">{m.hook.text}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {m.matched.length > 0 && (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400">Found: {m.matched.join(", ")}</span>{" "}
                    </>
                  )}
                  {m.missing.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">Missing: {m.missing.join(", ")}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-zinc-400">Paste at least a sentence of landing copy to score message-match.</p>
      )}
    </div>
  );
}