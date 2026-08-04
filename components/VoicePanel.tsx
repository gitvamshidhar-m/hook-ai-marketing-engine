"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

export default function VoicePanel({ result }: { result: AnalyzeResult }) {
  const [open, setOpen] = useState(false);
  if (!result.voice) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="font-semibold">Brand voice detected</h3>
          <p className="mt-1 text-sm text-zinc-500">{result.voice.summary}</p>
        </div>
        <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300">
          {result.voice.detected.join(" · ")}
        </span>
      </button>
      {open && (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
          {result.voice.detected.map((v) => (
            <li key={v}>{v} tone — use matching language in headlines and CTAs.</li>
          ))}
        </ul>
      )}
    </div>
  );
}
