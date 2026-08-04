"use client";

import { useState } from "react";
import type { AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS } from "@/lib/types";
import ResultView from "./ResultView";
import Dashboard from "./Dashboard";
import { recordRun, supabaseConfigured } from "@/lib/supabase";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];
const FREE_DAILY = 5;
const RUN_KEY = "hookai-runlog";

export default function HookTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [competitors, setCompetitors] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tryingHarder, setTryingHarder] = useState(false);
  const [error, setError] = useState("");
  const [variation, setVariation] = useState(0);
  const [rerunsLeft, setRerunsLeft] = useState<number | null>(null);

  function usedToday(): number {
    if (typeof window === "undefined") return 0;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(RUN_KEY);
      const log: Record<string, number> = raw ? JSON.parse(raw) : {};
      return log[today] || 0;
    } catch {
      return 0;
    }
  }

  function bumpUsed() {
    if (typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(RUN_KEY);
      const log: Record<string, number> = raw ? JSON.parse(raw) : {};
      log[today] = (log[today] || 0) + 1;
      localStorage.setItem(RUN_KEY, JSON.stringify(log));
      setRerunsLeft(Math.max(0, FREE_DAILY - log[today]));
    } catch {
      /* ignore */
    }
  }

  function statsPayload(best: AnalyzeResult) {
    const top = best.hooks.reduce((a, b) => (b.score > a.score ? b : a), best.hooks[0]);
    return {
      topic: best.topic,
      hooks: best.hooks.length,
      bestScore: top ? top.score : 0,
      aiPowered: best.aiPowered,
    };
  }

  async function run(variationSeed: number, avoid: string[]) {
    if (!topic.trim()) return setError("Enter a topic to start.");
    if (variationSeed === 0 && usedToday() >= FREE_DAILY) {
      setError(`You hit the free limit (${FREE_DAILY} runs/day). Try harder variations still work, or come back tomorrow.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          goal,
          channel,
          competitorHooks: competitors
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
          count: 3,
          variation: variationSeed,
          avoidPsych: avoid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setVariation(variationSeed);
      if (variationSeed === 0) {
        bumpUsed();
        recordRun(statsPayload(data));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
      setTryingHarder(false);
    }
  }

  function reset() {
    setResult(null);
    setVariation(0);
    setError("");
  }

  function tryHarder() {
    setTryingHarder(true);
    const avoid = result ? result.hooks.map((h) => h.psychology) : [];
    run(variation + 1, avoid);
  }

  const remaining =
    rerunsLeft !== null ? rerunsLeft : Math.max(0, FREE_DAILY - usedToday());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-500">
            Free plan · {remaining}/{FREE_DAILY} runs today{supabaseConfigured ? "" : " (trying harder is unlimited)"}
          </span>
          <button
            onClick={reset}
            className="text-xs text-zinc-400 underline-offset-2 hover:underline"
          >
            New topic
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Topic / product / niche</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. organic skincare for busy moms"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. time-crunched parents, 25-40"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Goal</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. drive signups to a free email course"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Channel</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel | "all")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All channels</option>
              {CHANNEL_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium">
            Competitor headlines / ad copy (one per line) — feeds the gap scanner
          </span>
          <textarea
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            rows={2}
            placeholder={"Why your skincare routine isn't working\n10 anti-aging secrets dermatologists hate"}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => run(0, [])}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Generate hooks"}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </section>

      {result && (
        <ResultView result={result} onTryHarder={tryHarder} tryingHarder={tryingHarder} />
      )}
      <Dashboard result={result} />
    </div>
  );
}