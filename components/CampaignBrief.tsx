"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";

export default function CampaignBrief({ result }: { result: AnalyzeResult }) {
  const [downloadState, setDownloadState] = useState<"idle" | "done">("idle");

  function download() {
    const lines: string[] = [];
    lines.push(`HOOK AI — CAMPAIGN BRIEF`);
    lines.push(`Topic: ${result.topic}`);
    lines.push(`Audience: ${result.audience}`);
    lines.push(`Goal: ${result.goal || "—"}`);
    lines.push(`Model: ${result.aiPowered ? result.model : "Engine (no AI key)"}`);
    lines.push("");
    lines.push("1) BEST HOOKS");
    [...result.hooks]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .forEach((h, i) => lines.push(`${i + 1}. [${h.channelLabel}] ${h.text} — ${h.score}/100 (${h.psychology})`));
    lines.push("");
    lines.push("2) ANGLES");
    result.angles.slice(0, 5).forEach((a) => lines.push(`- ${a.name}: ${a.description}`));
    lines.push("");
    lines.push("3) GAP SCAN (blue ocean)");
    result.gaps.forEach((g) => lines.push(`- ${g.angleName}: ${g.suggestedHook}`));
    lines.push("");
    lines.push("4) POSITIONING");
    lines.push(result.usp.positioningStatement);
    lines.push(result.usp.elevatorPitch);
    lines.push("");
    lines.push("5) TAGLINES");
    (result.taglines || []).forEach((t) => lines.push(`- ${t.text} (${t.confidence}% confidence)`));
    lines.push("");
    lines.push("Generated with Hook AI — hook-ai-marketing-engine.vercel.app");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hook-ai-brief-${result.topic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadState("done");
    setTimeout(() => setDownloadState("idle"), 2000);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Campaign brief</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Export the whole strategy into a client-ready brief — angles, top hooks, gaps, positioning, and taglines.
          </p>
        </div>
        <button
          onClick={download}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          {downloadState === "done" ? "Downloaded!" : "Download brief"}
        </button>
      </div>
    </div>
  );
}