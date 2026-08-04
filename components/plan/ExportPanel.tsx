"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

export default function ExportPanel({ result }: { result: AnalyzeResult }) {
  const [state, setState] = useState<"idle" | "done">("idle");

  function buildCsv(): string {
    const header = "Channel,Hook,Predicted Score,Psychology,Forecast Emotion,Variant";
    const rows = result.hooks.map((h) =>
      [
        h.channelLabel,
        `"${h.text.replace(/"/g, '""')}"`,
        h.score,
        `"${h.psychology}"`,
        h.forecast ? `"${h.forecast.emotion}"` : "",
        h.variation || "",
      ].join(",")
    );
    return [header, ...rows].join("\n");
  }

  function downloadCsv() {
    const blob = new Blob([buildCsv()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hook-ai-test-matrix-${result.topic.slice(0, 24).replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  }

  async function copyBlocks() {
    const block = result.hooks
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((h) => `${h.channelLabel}:\n${h.text}\n— score ${h.score}/100 (${h.psychology})`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(block);
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Export for Ads Manager</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Grab your best hooks as copy-paste blocks or a CSV test matrix to drop straight into your ad platform.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyBlocks} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Copy blocks
          </button>
          <button onClick={downloadCsv} className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300">
            {state === "done" ? "Done!" : "Download CSV"}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[...result.hooks]
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
          .map((h) => (
            <div key={h.id} className="rounded-md border border-zinc-100 p-2 text-xs dark:border-zinc-800">
              <span className="text-zinc-400">{h.channelLabel}</span>
              <p className="mt-0.5 font-medium">{h.text}</p>
            </div>
          ))}
      </div>
    </div>
  );
}