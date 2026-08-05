"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import CampaignPlanView from "@/components/CampaignPlanView";

export default function CampaignPage() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [budget, setBudget] = useState(500);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          goal,
          competitorHooks: competitors,
          count: 3,
          budget,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40";

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Campaign Studio</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          One click → a complete marketing plan: hooks, health score, budget split, channel strategy, content
          calendar, targeting, and KPIs. Built from your brand&apos;s own data, then publish it as a shareable link.
        </p>

        <form
          onSubmit={generate}
          className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Product / topic *</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI content engine for startups" required maxLength={120} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. first-time founders under 1,000 users" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Campaign goal</label>
              <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. drive 1,000 trial signups this quarter" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Daily budget (₹)</label>
              <input
                type="number"
                min={50}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Competitor hooks (optional, one per line)
              </label>
              <textarea
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder={"“The AI that writes for you”\n“Stop hiring copywriters”"}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy || !topic.trim()}
              className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Generating your plan…" : "Generate full campaign plan"}
            </button>
            <p className="text-xs text-zinc-500">Costs 1 credit per run.</p>
          </div>
        </form>

        {busy && (
          <div className="mt-10 flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
            Assembling strategy, budget, calendar, and KPIs…
          </div>
        )}

        {result && (
          <div className="mt-10">
            <CampaignPlanView result={result} />
          </div>
        )}
      </div>
    </main>
  );
}