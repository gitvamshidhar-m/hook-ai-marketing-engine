"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/tracking";

type ChallengeResult = {
  topic: string;
  topScore: number;
  topHook: string;
  hooks: { text: string; score: number; psychology: string }[];
};

const BEST_KEY = "hookai-challenge-best";

function grade(score: number): { label: string; tint: string } {
  if (score >= 90) return { label: "Elite hooker", tint: "text-fuchsia-500" };
  if (score >= 80) return { label: "Top 10%", tint: "text-indigo-500" };
  if (score >= 70) return { label: "Solid", tint: "text-emerald-500" };
  if (score >= 55) return { label: "Room to grow", tint: "text-amber-500" };
  return { label: "The AI wants a rematch", tint: "text-rose-500" };
}

export default function ChallengePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(localStorage.getItem(BEST_KEY) || 0);
    } catch {
      return 0;
    }
  });

  async function run() {
    if (!topic.trim()) {
      setError("Enter a topic to challenge the AI.");
      return;
    }
    setLoading(true);
    setError("");
    track("challenge_started", { topic: topic.trim().slice(0, 80) });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), channel: "ad", count: 5 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — try again in a minute.");
        setLoading(false);
        return;
      }
      const hooks: { text: string; score: number; psychology: string }[] = Array.isArray(data.hooks)
        ? data.hooks.map((h: { text?: string; score?: number; psychology?: string }) => ({
            text: String(h.text || ""),
            score: Number(h.score) || 0,
            psychology: h.psychology || "",
          }))
        : [];
      const topScore = hooks.reduce((m, h) => Math.max(m, h.score), 0);
      const topHook = hooks.find((h) => h.score === topScore)?.text || hooks[0]?.text || "";
      const r = { topic: topic.trim(), topScore, topHook, hooks };
      setResult(r);
      track("challenge_scored", { topic: r.topic.slice(0, 80), score: topScore });
      if (topScore > best) {
        setBest(topScore);
        try {
          localStorage.setItem(BEST_KEY, String(topScore));
        } catch {
          /* ignore */
        }
      }
    } catch {
      setError("Network error — please try again.");
    }
    setLoading(false);
  }

  function share() {
    if (!result) return;
    track("challenge_shared", { score: result.topScore });
    const url = `https://hook-ai-marketing-engine.vercel.app/challenge?topic=${encodeURIComponent(result.topic)}`;
    const text = `I scored ${result.topScore}/100 on the Hook AI hook challenge. Can you beat me? ${url}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  const g = result ? grade(result.topScore) : null;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">
          The 60-second hook challenge
        </p>
        <h1 className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Can you out-hook an AI?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-zinc-500">
          Type your topic. The engine scores its best hook out of 100 using predicted CTR.
          Score 80+ and you&apos;re in the top 10% of challengers.
        </p>

        <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <label htmlFor="challenge-topic" className="text-sm font-semibold">
            Your product or topic
          </label>
          <input
            id="challenge-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. a meal-prep app for busy parents"
            maxLength={120}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            onClick={run}
            disabled={loading}
            className="bg-gradient-brand mt-4 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Scoring…" : "Score my hook"}
          </button>
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        </div>

        {best > 0 && (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Your personal best: <span className="font-bold text-indigo-500">{best}/100</span>
          </p>
        )}

        {result && g && (
          <div className="mt-8">
            <div className="card-elevated rounded-2xl border border-indigo-200 bg-gradient-soft p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/30">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Best hook score</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="text-6xl font-black tracking-tight">{result.topScore}</span>
                <span className="text-2xl font-bold text-zinc-400">/100</span>
              </div>
              <p className={`mt-1 text-sm font-bold ${g.tint}`}>{g.label}</p>
              <p className="mx-auto mt-4 max-w-md text-sm font-medium text-zinc-600 dark:text-zinc-300">
                “{result.topHook}”
              </p>
              <button
                onClick={share}
                className="bg-gradient-brand mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
              >
                Share on X — challenge your network
              </button>
              {result.topScore < 90 && (
                <p className="mt-3 text-xs text-zinc-400">
                  Tip: add a specific audience and outcome to your topic to push the score higher.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              {result.hooks.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-medium">{h.text}</p>
                    <p className="mt-1 text-xs text-zinc-400">{h.psychology}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-indigo-500">{h.score}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-zinc-500">
                Want scored hooks for every channel — ads, email, YouTube, blog?
              </p>
              <Link
                href="/"
                className="bg-gradient-brand rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
              >
                Run the full angle engine
              </Link>
              <p className="text-xs text-zinc-400">Free daily runs — no credit card.</p>
            </div>
          </div>
        )}

        {!result && (
          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Enter a topic", d: "What are you marketing?" },
              { n: "2", t: "Get scored", d: "CTR-predicted score out of 100" },
              { n: "3", t: "Share & beat", d: "Challenge your friends to top it" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <span className="bg-gradient-brand mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                  {s.n}
                </span>
                <p className="mt-3 text-sm font-semibold">{s.t}</p>
                <p className="mt-1 text-xs text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
