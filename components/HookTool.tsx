"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS, LANGUAGES } from "@/lib/types";
import ResultView from "./ResultView";
import Dashboard from "./Dashboard";
import TemplateGallery from "./TemplateGallery";
import { recordRun, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { computeHealthScore } from "@/lib/health";
import { bonusRunsToday } from "@/lib/referral";
import { competitorHooksFromCSV, readFileAsText } from "@/lib/csv";
import { track, emailBonusRunsToday, isEmailBonusClaimed } from "@/lib/tracking";
import EmailCapture from "./EmailCapture";
import Link from "next/link";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];
const FREE_DAILY = 20;
const RUN_KEY = "hookai-runlog";
const PROGRESS_STEPS = [
  "Mapping psychological angles…",
  "Scoring hook strength…",
  "Checking channel format…",
  "Reading brand voice…",
  "Matching competitor gaps…",
];

export default function HookTool() {
  const { user } = useAuth();
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
  const [emailBonus, setEmailBonus] = useState(() => emailBonusRunsToday());
  const [limitHit, setLimitHit] = useState(false);
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
      topHooks: best.hooks.map((h) => ({
        text: h.text,
        score: h.score,
        channel: h.channel,
        psychology: h.psychology,
      })),
    };
  }

  async function run(variationSeed: number, avoid: string[]) {
    if (!topic.trim()) return setError("Enter a topic to start.");
    if (variationSeed === 0 && usedToday() >= FREE_DAILY + bonusRunsToday() + emailBonus) {
      setLimitHit(true);
      track("run_limit_hit", { topic: topic.trim().slice(0, 80) });
      setError(`You hit the free limit (${FREE_DAILY} runs/day). Share results or grab the +5 email bonus to earn more, try harder variations, or come back tomorrow.`);
      return;
    }
    setLimitHit(false);
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
        recordRun({ ...statsPayload(data), healthScore: computeHealthScore(data).score, userId: user?.id || undefined });
        track("tool_used", { topic, channel });
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
    setLimitHit(false);
  }

  function tryHarder() {
    setTryingHarder(true);
    const avoid = result ? result.hooks.map((h) => h.psychology) : [];
    run(variation + 1, avoid);
  }

  async function importCompetitorCSV(file: File) {
    try {
      const text = await readFileAsText(file);
      const hooks = competitorHooksFromCSV(text);
      if (hooks.length === 0) {
        setError("No usable competitor lines found in that file.");
        return;
      }
      const merged = [...new Set([...competitors.split("\n").map((l) => l.trim()).filter(Boolean), ...hooks])];
      setCompetitors(merged.join("\n"));
      setError("");
    } catch {
      setError("Couldn't read that file — please upload a plain CSV.");
    }
  }

  const remaining =
    rerunsLeft !== null ? rerunsLeft : Math.max(0, FREE_DAILY + bonusRunsToday() + emailBonus - usedToday());
  const bonusToday = bonusRunsToday();
  const showEmailCapture = Boolean(result) && !user && !isEmailBonusClaimed();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <TemplateGallery onLoad={(v) => { setTopic(v.topic); setAudience(v.audience); setGoal(v.goal); setCompetitors(v.competitors); setVoiceSamples(v.voice); setLanguage(v.language); }} />
      <section className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
            Free plan · {remaining}/{FREE_DAILY} runs today
            {bonusToday > 0 ? <span className="text-emerald-500">(+{bonusToday} from sharing)</span> : ""}
            {emailBonus > 0 ? <span className="text-indigo-500">(+{emailBonus} from email)</span> : ""}
            {supabaseConfigured ? "" : " · trying harder is unlimited"}
          </span>
          {result && (
            <button
              onClick={reset}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              New topic
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Topic / product / niche</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. organic skincare for busy moms"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. time-crunched parents, 25-40"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Goal</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. drive signups to a free email course"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Channel</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel | "all")}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
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
              <span className="mb-1.5 block text-sm font-medium">Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="mt-5 flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
          aria-expanded={advancedOpen}
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-md border border-indigo-200 text-[10px] transition-transform dark:border-indigo-900 ${advancedOpen ? "rotate-90" : ""}`}
            aria-hidden
          >
            ▸
          </span>
          Advanced options (competitor scan, brand voice)
        </button>
        {advancedOpen && (
          <div className="mt-4 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:p-5">
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                <span>
                  Competitor headlines / ad copy (one per line) — feeds the gap scanner
                </span>
                <label className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  ⤓ Import CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) importCompetitorCSV(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </span>
              <textarea
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                rows={2}
                placeholder={"Why your skincare routine isn't working\n10 anti-aging secrets dermatologists hate"}
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Brand voice samples (optional) — paste 2–4 lines of existing copy to match their tone
              </span>
              <textarea
                value={voiceSamples}
                onChange={(e) => setVoiceSamples(e.target.value)}
                rows={2}
                placeholder={"We make healthy easy for busy families.\nResults you can feel in 30 days.\nHonest, no-nonsense skincare."}
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>
        )}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => run(0, [])}
            disabled={loading}
            className="bg-gradient-brand rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Generate hooks"}
          </button>
          {loading && (
            <p className="flex items-center gap-2 text-sm text-zinc-500" role="status" aria-live="polite">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
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

      {limitHit && !result && (
        <section className="card-elevated mt-6 rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-8">
          <h2 className="text-lg font-bold">You&apos;ve hit the free limit for today</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {user
              ? "Your daily allowance is used up. Top up credits to keep generating without waiting."
              : "Your daily allowance is used up — but there are two fast ways to keep going."}
          </p>

          {!user && (
            <div className="mt-5">
              <p className="text-sm font-semibold">
                1. Unlock +5 more runs with your email{" "}
                <span className="font-normal text-zinc-500">(one-time bonus for today)</span>
              </p>
              <div className="mt-2 max-w-md">
                <EmailCapture
                  topic={topic}
                  onClaimed={(b) => {
                    setEmailBonus((prev) => Math.max(prev, b));
                    setLimitHit(false);
                    setError("");
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="text-sm font-semibold">{user ? "1. " : "2. "}Get more runs, on demand</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
              >
                View pricing
              </Link>
              <Link
                href="/account"
                className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                {user ? "Top up credits" : "Create a free account"}
              </Link>
            </div>
          </div>

          <p className="mt-5 text-xs text-zinc-400">
            Tip: “trying harder” variations never count against your daily total, and every result card you share
            earns a credit on signups. The free allowance resets every morning.
          </p>
        </section>
      )}

      {loading && !result && (
        <div className="mt-8" aria-hidden>
          <div className="shimmer h-5 w-48 rounded-full" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      <div ref={resultRef}>
        {result && (
          <>
            <ResultView result={result} onTryHarder={tryHarder} tryingHarder={tryingHarder} loading={loading} />
            {showEmailCapture && (
              <EmailCapture
                topic={result.topic}
                onClaimed={(b) => {
                  setEmailBonus((prev) => Math.max(prev, b));
                }}
              />
            )}
          </>
        )}
      </div>
      <Dashboard result={result} />
    </div>
  );
}