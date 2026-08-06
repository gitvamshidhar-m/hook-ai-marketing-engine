"use client";

import { useState } from "react";
import type { Channel } from "@/lib/types";

type HookRow = {
  id: string;
  text: string;
  score: number;
  psychology?: string;
  forecast?: { emotion: string };
};

export default function ToolGenerator({ channel, channelLabel }: { channel: Channel; channelLabel: string }) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [rows, setRows] = useState<HookRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    setRows([]);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience: audience || undefined,
          goal: goal || undefined,
          competitorHooks: competitors || undefined,
          channel,
          count: 3,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setRows(
        (data.hooks || []).map((h: HookRow) => h)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40";

  return (
    <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold">Try it — free {channelLabel} generator</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Enter your topic and get scored {channelLabel} options instantly.
      </p>
      <form onSubmit={run} className="mt-4 grid gap-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. AI resume screening for recruiters"
          required
          maxLength={120}
          className={inputClass}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Audience (optional)" maxLength={120} className={inputClass} />
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal (optional)" maxLength={120} className={inputClass} />
        </div>
        <textarea
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          placeholder={"Competitor hooks (optional, one per line)"}
          rows={2}
          className={inputClass}
        />
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={busy || !topic.trim()}
          className="bg-gradient-brand w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Generating…" : "Generate {channelLabel} options"}
        </button>
      </form>

      {rows.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Top options
          </p>
          {rows.map((h) => (
            <div key={h.id} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
              <div className="min-w-0">
                <p className="text-sm font-medium">{h.text}</p>
                {h.psychology && <p className="mt-0.5 text-xs text-zinc-500">{h.psychology}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {h.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}