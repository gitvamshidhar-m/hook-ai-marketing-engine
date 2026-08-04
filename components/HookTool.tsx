"use client";

import { useState } from "react";
import type { AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS, ANGLE_CATEGORIES } from "@/lib/types";
import Dashboard from "./Dashboard";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];

const TABS = ["Hooks", "Angles", "Gap Scan", "USP"] as const;
type Tab = (typeof TABS)[number];

export default function HookTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [competitors, setCompetitors] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Hooks");
  const [copied, setCopied] = useState("");

  async function run() {
    if (!topic.trim()) return setError("Enter a topic to start.");
    setLoading(true);
    setError("");
    setResult(null);
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setTab("Hooks");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const best = result ? [...result.hooks].sort((a, b) => b.score - a.score)[0] : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
            onClick={run}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Generate hooks"}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </section>

      {result && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  tab === t
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {t}
                {t === "Hooks" && ` (${result.hooks.length})`}
              </button>
            ))}
            {result.aiPowered && (
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                AI-powered · {result.model}
              </span>
            )}
          </div>

          {best && (
            <div className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Best hook · predicted score {best.score}/100</p>
              <p className="mt-1 text-lg font-semibold">{best.text}</p>
            </div>
          )}

          {tab === "Hooks" && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {CHANNEL_ORDER.map((ch) => (
                <section key={ch} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{CHANNEL_LABELS[ch]}</h3>
                  <div className="mt-3 space-y-3">
                    {result.hooks
                      .filter((h) => h.channel === ch)
                      .map((h) => (
                        <div key={h.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm">{h.text}</p>
                            <div className="flex shrink-0 items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  h.score >= 80
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : h.score >= 60
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}
                              >
                                {h.score}
                              </span>
                              <button
                                onClick={() => copy(h.text, h.id)}
                                className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                              >
                                {copied === h.id ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-zinc-500">{h.psychology}</p>
                        </div>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {tab === "Angles" && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {result.angles.map((a) => {
                const meta = ANGLE_CATEGORIES.find((c) => c.id === a.category);
                return (
                  <div key={a.category} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta?.tint }} />
                      <h3 className="font-semibold">{a.name}</h3>
                    </div>
                    <p className="mt-2 text-sm">{a.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">{a.whyItWorks}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "Gap Scan" && (
            <div className="mt-5 space-y-4">
              {result.gaps.map((g) => (
                <div key={g.angleCategory} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">Untapped angle: {g.angleName}</h3>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      Blue ocean
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{g.evidence}</p>
                  <p className="mt-1 text-sm">{g.suggestedHook}</p>
                </div>
              ))}
              {result.gaps.length === 0 && (
                <p className="text-sm text-zinc-500">Add competitor headlines above to scan for untapped angles.</p>
              )}
            </div>
          )}

          {tab === "USP" && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Positioning statement</h3>
                <p className="mt-2 text-lg font-medium">{result.usp.positioningStatement}</p>
                <button
                  onClick={() => copy(result.usp.positioningStatement, "usp")}
                  className="mt-3 rounded-md border border-zinc-300 px-3 py-1 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {copied === "usp" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Elevator pitch</h3>
                <p className="mt-2 text-lg font-medium">{result.usp.elevatorPitch}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Differentiators</h3>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {result.usp.differentiators.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
      <Dashboard result={result} />
    </div>
  );
}
