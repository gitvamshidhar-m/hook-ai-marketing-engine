"use client";

import { useState, useEffect } from "react";
import { supabaseConfigured, recordRun } from "@/lib/supabase";

type StatRow = {
  topic: string;
  hooks: number;
  best_score: number;
  ai_powered: boolean;
  created_at: string;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabaseConfigured) {
        setError("Supabase is not configured — connect your project to see analytics.");
        setLoading(false);
        return;
      }
      try {
        const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const res = await fetch(
          `${URL}/rest/v1/hook_ai_stats?select=topic,hooks,best_score,ai_powered,created_at&order=created_at.desc&limit=100`,
          {
            headers: {
              apikey: KEY,
              Authorization: `Bearer ${KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as StatRow[];
        setStats(data);
      } catch (e) {
        setError("Failed to load analytics.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalRuns = stats.length;
  const aiRuns = stats.filter((s) => s.ai_powered).length;
  const engineRuns = totalRuns - aiRuns;
  const avgScore =
    totalRuns > 0
      ? Math.round(stats.reduce((a, s) => a + s.best_score, 0) / totalRuns)
      : 0;
  const topTopics = Object.entries(
    stats.reduce<Record<string, number>>((acc, s) => {
      acc[s.topic] = (acc[s.topic] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Real usage stats from your Supabase hook_ai_stats table.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
            Loading stats…
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Total runs</p>
                <p className="mt-1 text-3xl font-bold">{totalRuns}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">AI-powered</p>
                <p className="mt-1 text-3xl font-bold">{aiRuns}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Engine fallback</p>
                <p className="mt-1 text-3xl font-bold">{engineRuns}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Avg best score</p>
                <p className="mt-1 text-3xl font-bold">{avgScore}</p>
              </div>
            </div>

            {topTopics.length > 0 && (
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Top topics
                </h2>
                <div className="mt-4 space-y-3">
                  {topTopics.map(([topic, count]) => (
                    <div key={topic} className="flex items-center gap-3">
                      <span className="flex-1 text-sm">{topic}</span>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {count} run{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.length > 0 && (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Hooks</th>
                      <th className="px-4 py-3">Best score</th>
                      <th className="px-4 py-3">AI</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                      >
                        <td className="px-4 py-3 font-medium">{s.topic}</td>
                        <td className="px-4 py-3">{s.hooks}</td>
                        <td className="px-4 py-3">{s.best_score}</td>
                        <td className="px-4 py-3">
                          {s.ai_powered ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              yes
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                              no
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalRuns === 0 && (
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-lg font-semibold">No runs yet.</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Run an analysis on the home page and your stats will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}