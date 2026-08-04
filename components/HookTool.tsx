"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS, LANGUAGES } from "@/lib/types";
import ResultView from "./ResultView";
import Dashboard from "./Dashboard";
import { recordRun, supabaseConfigured } from "@/lib/supabase";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];
const FREE_DAILY = 5;
const RUN_KEY = "hookai-runlog";
const PROGRESS_STEPS = [
  "Mapping psychological angles…",
  "Scoring hook strength…",
  "Checking channel format…",
  "Reading brand voice…",
  "Matching competitor gaps…",
];

export default function HookTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [competitors, setCompetitors] = useState("");
  const [voiceSamples, setVoiceSamples] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tryingHarder, setTryingHarder] = useState(false);
  const [error, setError] = useState("");
  const [variation, setVariation] = useState(0);
  const [rerunsLeft, setRerunsLeft] = useState<number | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setProgressStep((s) => (s + 1) % PROGRESS_STEPS.length), 2400);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

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
          voiceSamples: voiceSamples
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
          language: language || undefined,
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
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
          aria-expanded={advancedOpen}
        >
          <span
            className={`inline-block transition-transform ${advancedOpen ? "rotate-90" : ""}`}
            aria-hidden
          >
            ▸
          </span>
          Advanced options (competitor scan, brand voice)
        </button>
        {advancedOpen && (
          <div className="mt-3 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <label className="block">
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
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Brand voice samples (optional) — paste 2–4 lines of existing copy to match their tone
              </span>
              <textarea
                value={voiceSamples}
                onChange={(e) => setVoiceSamples(e.target.value)}
                rows={2}
                placeholder={"We make healthy easy for busy families.\nResults you can feel in 30 days.\nHonest, no-nonsense skincare."}
                className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => run(0, [])}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Generate hooks"}
          </button>
          {loading && (
            <p className="text-sm text-zinc-500" role="status" aria-live="polite">
              {PROGRESS_STEPS[progressStep]}
            </p>
          )}
          {error && (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {loading && !result && (
        <div className="mt-8 animate-pulse" aria-hidden>
          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
        </div>
      )}

      <div ref={resultRef}>
        {result && (
          <ResultView result={result} onTryHarder={tryHarder} tryingHarder={tryingHarder} loading={loading} />
        )}
      </div>
      <Dashboard result={result} />
    </div>
  );
}