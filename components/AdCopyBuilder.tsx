"use client";

import { useMemo, useState } from "react";
import type { AdCopy, AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS } from "@/lib/types";

function buildTemplateAd(result: AnalyzeResult): AdCopy[] {
  const adHook = [...result.hooks].filter((h) => h.channel === "ad").sort((a, b) => b.score - a.score)[0];
  const extra = adHook ? `${adHook.text}` : result.usp.elevatorPitch;
  const headline = result.taglines?.[0]?.text || extra.slice(0, 40);
  const primes = (result.keywords || []).slice(0, 3).map((k) => k.keyword).join(", ");
  const body = `${result.usp.positioningStatement} ${primes ? `Built for people searching ${primes}.` : ""}`;
  const cta = (result.goal || "get started").replace(/^to\s+/i, "").replace(/\b(drive|gain|generate)\b/gi, "");
  return [
    {
      variant: "A",
      angle: "Direct + specific",
      headline,
      subheadline: result.usp.elevatorPitch.length > 80 ? result.usp.elevatorPitch.slice(0, 77) + "…" : result.usp.elevatorPitch,
      body,
      cta: cta ? `Start now — ${cta.trim()}` : "Start now",
    },
    {
      variant: "B",
      angle: "Curiosity + proof",
      headline: adHook ? adHook.text : `${result.topic}, minus the guesswork`,
      subheadline: `The ${result.topic} system, built with ${primes || "proven angles"}.`,
      body: `Skip the trial-and-error. ${result.usp.differentiators[0] || ""} — the smarter way forward.`,
      cta: "Claim your spot",
    },
  ];
}

export default function AdCopyBuilder({ result }: { result: AnalyzeResult }) {
  const [copies, setCopies] = useState<AdCopy[]>(() => buildTemplateAd(result));
  const [model, setModel] = useState("");
  const [source, setSource] = useState<"template" | "ai">("template");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const isTemplate = useMemo(() => source === "template", [source]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/adcopy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, channel: "ad" as Channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      if (data.copies && data.copies.length) {
        setCopies(data.copies);
        setModel(data.model || "");
        setSource("ai");
      } else {
        throw new Error("No ad copy returned.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function resetTemplate() {
    setCopies(buildTemplateAd(result));
    setSource("template");
    setModel("");
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Ad copy builder · {CHANNEL_LABELS.ad}</h3>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Instant paste-ready ad assembled from your top hook, USP, keywords, and goal. Hit{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Generate AI ad copy</span> for two richer A/B variants tuned to your brand voice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetTemplate}
            disabled={!source}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Template
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? "Generating…" : source === "ai" ? "Generate again" : "Generate AI ad copy"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {!isTemplate && model && (
        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">AI-generated · {model}</p>
      )}
      {!isTemplate && (
        <p className="mt-1 text-xs text-zinc-500">
          <button onClick={resetTemplate} className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300">
            Show instant template
          </button>
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {copies.map((ad) => (
          <div key={ad.variant} className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Variant {ad.variant}
              </span>
              <span className="truncate text-xs text-zinc-400">{ad.angle}</span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-lg font-bold leading-tight">{ad.headline}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{ad.subheadline}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{ad.body}</p>
            </div>
            <div className="mt-auto pt-3">
              <p className="inline-block rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-black">{ad.cta}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => copy(adCTA(ad), `ad-${ad.variant}`)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {copied === `ad-${ad.variant}` ? "Copied" : "Copy ad"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function adCTA(ad: AdCopy) {
  return `${ad.headline}\n${ad.subheadline}\n${ad.body}\nCTA: ${ad.cta}`;
}