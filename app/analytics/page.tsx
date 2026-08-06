"use client";

import { useState, useEffect } from "react";
import { supabaseConfigured } from "@/lib/supabase";

type StatRow = {
  topic: string;
  hooks: number;
  best_score: number;
  ai_powered: boolean;
  health_score: number | null;
  created_at: string;
};

type ShareStat = {
  slug: string;
  title: string;
  views: number;
  clicks: number;
  leads: number;
  created_at: string;
  url: string;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [shares, setShares] = useState<ShareStat[]>([]);
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
          `${URL}/rest/v1/hook_ai_stats?select=topic,hooks,best_score,ai_powered,health_score,created_at&order=created_at.desc&limit=200`,
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

  useEffect(() => {
    fetch("/api/shares/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setShares(Array.isArray(d.shares) ? d.shares : []))
      .catch(() => {});
  }, []);

  const totalRuns = stats.length;
  const aiRuns = stats.filter((s) => s.ai_powered).length;
  const engineRuns = totalRuns - aiRuns;
  const avgScore =
    totalRuns > 0
      ? Math.round(stats.reduce((a, s) => a + s.best_score, 0) / totalRuns)
      : 0;
  const scored = stats.filter((s) => typeof s.health_score === "number");
  const avgHealth =
    scored.length > 0
      ? Math.round(scored.reduce((a, s) => a + (s.health_score as number), 0) / scored.length)
      : 0;
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: key.slice(5), runs: stats.filter((s) => s.created_at.slice(0, 10) === key).length };
  });
  const maxDay = Math.max(1, ...last14.map((d) => d.runs));
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
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Real usage stats from your Supabase hook_ai_stats table.
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
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
              <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Total runs</p>
                <p className="text-gradient mt-1 text-3xl font-bold">{totalRuns}</p>
              </div>
              <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">AI-powered</p>
                <p className="mt-1 text-3xl font-bold">{aiRuns}</p>
              </div>
              <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Engine fallback</p>
                <p className="mt-1 text-3xl font-bold">{engineRuns}</p>
              </div>
              <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Avg best score</p>
                <p className="mt-1 text-3xl font-bold">{avgScore}</p>
              </div>
              <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Avg health score</p>
                <p className="mt-1 text-3xl font-bold">{avgHealth || "—"}</p>
              </div>
            </div>

            {last14.some((d) => d.runs > 0) && (
              <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Runs · last 14 days</h2>
                <div className="mt-4 flex h-24 items-end gap-1.5">
                  {last14.map((d) => (
                    <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.runs} run${d.runs === 1 ? "" : "s"}`}>
                      <div
                        className="bg-gradient-brand w-full rounded-t transition-all hover:brightness-110"
                        style={{ height: `${Math.max(4, (d.runs / maxDay) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                  <span>{last14[0].day}</span>
                  <span>{last14[last14.length - 1].day}</span>
                </div>
              </div>
            )}

            {topTopics.length > 0 && (
              <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Top topics
                </h2>
                <div className="mt-4 space-y-3">
                  {topTopics.map(([topic, count]) => (
                    <div key={topic} className="flex items-center gap-3">
                      <span className="flex-1 truncate text-sm">{topic}</span>
                      <span className="bg-gradient-brand rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                        {count} run{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shares.length > 0 && (
              <div className="card-elevated mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="px-4 pt-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Shared campaign pages
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Views, clicks, and leads captured on your published /s/ links.
                  </p>
                </div>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Leads</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shares.map((s) => (
                      <tr key={s.slug} className="border-b border-zinc-100 transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium">{s.title}</td>
                        <td className="px-4 py-3 font-semibold">{s.views}</td>
                        <td className="px-4 py-3 font-semibold">{s.clicks}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.leads > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                            {s.leads}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                          >
                            open
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {stats.length > 0 && (
              <div className="card-elevated mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Hooks</th>
                      <th className="px-4 py-3">Best score</th>
                      <th className="px-4 py-3">Health</th>
                      <th className="px-4 py-3">AI</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-100 transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                      >
                        <td className="px-4 py-3 font-medium">{s.topic}</td>
                        <td className="px-4 py-3">{s.hooks}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{s.best_score}</td>
                        <td className="px-4 py-3">
                          {typeof s.health_score === "number" ? (
                            <span className={`font-semibold ${s.health_score >= 70 ? "text-emerald-600 dark:text-emerald-400" : s.health_score >= 55 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {s.health_score}
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
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
              <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xl font-semibold">No runs yet.</p>
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