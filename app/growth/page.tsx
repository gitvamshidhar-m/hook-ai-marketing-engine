"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Daily = { day: string; runs: number; captures: number; signups: number };
type Overview = {
  captures: number;
  signups: number;
  runs: number;
  shares: number;
  referralSignups: number;
  challenges: number;
  emailSends: number;
  topups: number;
  daily: Daily[];
  topEvents: { name: string; c: number }[];
  sources: { source: string; c: number }[];
};
type AbRow = { variant: string; views: number; clicks: number; ctr: number };
type GrowthData = { overview: Overview; ab: AbRow[]; fetchedAt: string };

function fmt(n: number | undefined | null): string {
  return (n || 0).toLocaleString("en-IN");
}

// Two-proportion z-test on CTA clicks vs views. Returns p-value (two-sided).
function abPValue(a: AbRow, b: AbRow): number | null {
  const p1 = a.clicks / a.views;
  const p2 = b.clicks / b.views;
  const p = (a.clicks + b.clicks) / (a.views + b.views);
  const se = Math.sqrt(p * (1 - p) * (1 / a.views + 1 / b.views));
  if (!se) return null;
  const z = Math.abs(p1 - p2) / se;
  return 2 * (1 - normalCdf(z));
}

function normalCdf(z: number): number {
  // Abramowitz & Stegun approximation, accurate to ~1e-3.
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  return 1 - d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}

const MIN_VIEWS_PER_VARIANT = 200;
const MIN_ABS_DIFF = 0.01;

export default function GrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/growth", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        if (active) {
          setData(json);
          setError("");
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load growth data.");
      }
    };
    void tick();
    const id = setInterval(tick, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const daily = data?.overview?.daily || [];
  const maxRuns = Math.max(1, ...daily.map((d) => d.runs));
  const maxSignups = Math.max(1, ...daily.map((d) => d.signups));
  const ab = data?.ab || [];

  const cards = data
    ? [
        { label: "Runs generated", value: fmt(data.overview.runs), hint: "tool_used events", tint: "text-indigo-500" },
        { label: "Leads captured", value: fmt(data.overview.captures), hint: "emails collected", tint: "text-violet-500" },
        { label: "Signups", value: fmt(data.overview.signups), hint: "accounts created", tint: "text-emerald-500" },
        { label: "Referral signups", value: fmt(data.overview.referralSignups), hint: "via ?ref= links", tint: "text-fuchsia-500" },
        { label: "Shares", value: fmt(data.overview.shares), hint: "result cards shared", tint: "text-rose-500" },
        { label: "Challenges scored", value: fmt(data.overview.challenges), hint: "Beat-the-AI runs", tint: "text-amber-500" },
        { label: "Emails sent", value: fmt(data.overview.emailSends), hint: "lifecycle sends", tint: "text-sky-500" },
        { label: "Top-ups", value: fmt(data.overview.topups), hint: "paid credits", tint: "text-teal-500" },
      ]
    : [];

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Live growth dashboard</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Hook AI, in numbers</h1>
          {data && (
            <p className="text-xs text-zinc-400">
              Auto-refreshes · last update {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Real metrics pulled live from the product&apos;s analytics — the same funnel the site runs on. This page is
          deliberately transparent: what a growth marketer can measure, they can improve.
        </p>

        {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

        {data && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className={`text-3xl font-black tracking-tight ${c.tint}`}>{c.value}</p>
                <p className="mt-1 text-sm font-semibold">{c.label}</p>
                <p className="text-xs text-zinc-400">{c.hint}</p>
              </div>
            ))}
          </div>
        )}

        {data && daily.length > 0 && (
          <section className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Last 30 days</h2>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Runs</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Signups</span>
              </div>
            </div>
            <div className="mt-5 flex items-end gap-[3px] overflow-x-auto pb-1" style={{ height: 200 }}>
              {daily.map((d) => (
                <div key={d.day} title={`${d.day}: ${d.runs} runs, ${d.captures} leads, ${d.signups} signups`} className="group flex min-w-[14px] flex-1 flex-col items-center justify-end gap-[2px]">
                  <div
                    className="w-full rounded-t bg-emerald-400/80 transition group-hover:bg-emerald-400"
                    style={{ height: `${Math.max(2, (d.signups / maxSignups) * 90)}px` }}
                  />
                  <div
                    className="w-full rounded-t bg-indigo-500/80 transition group-hover:bg-indigo-500"
                    style={{ height: `${Math.max(2, (d.runs / maxRuns) * 90)}px` }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {data && (
            <section className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold">A/B test — hero headline</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Visitors are split 50/50 between two headlines. Every view and CTA click is tracked per variant.
              </p>
              <div className="mt-4 space-y-3">
                {ab.length === 0 && <p className="text-sm text-zinc-400">No test data yet — check back after traffic.</p>}
                {(() => {
                  const a = ab.find((r) => r.variant === "A");
                  const b = ab.find((r) => r.variant === "B");
                  if (!a || !b || a.views < MIN_VIEWS_PER_VARIANT || b.views < MIN_VIEWS_PER_VARIANT) {
                    const minViews = Math.min(a?.views || 0, b?.views || 0);
                    return minViews > 0 ? (
                      <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Collecting data… {minViews}/{MIN_VIEWS_PER_VARIANT} minimum views per variant reached.
                      </p>
                    ) : null;
                  }
                  const winner = a.ctr >= b.ctr ? a : b;
                  const loser = winner === a ? b : a;
                  const p = abPValue(a, b);
                  const declared = p !== null && p < 0.05 && winner.ctr - loser.ctr > MIN_ABS_DIFF;
                  return (
                    <div
                      className={`mb-4 rounded-xl border px-3 py-2 text-xs ${
                        declared
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                      }`}
                    >
                      {declared ? (
                        <>
                          <strong>Winner declared: Variant {winner.variant}</strong> — beats Variant{" "}
                          {loser.variant} at {winner.ctr.toFixed(1)}% vs {loser.ctr.toFixed(1)}% CTR
                          {p !== null ? ` (p=${p.toFixed(3)})` : ""}. To lock it in, redeploy with{" "}
                          <code className="rounded bg-white/60 px-1 dark:bg-black/30">HERO_VARIANT={winner.variant}</code>
                          .
                        </>
                      ) : (
                        <>
                          <strong>Collecting data…</strong> No significant winner yet: Variant A {a.ctr.toFixed(1)}% vs
                          Variant B {b.ctr.toFixed(1)}% CTR{p !== null ? ` (p=${p.toFixed(2)})` : ""}. Need p &lt; 0.05 to declare.
                        </>
                      )}
                    </div>
                  );
                })()}
                {ab.map((r, i) => {
                  const other = ab[1 - i];
                  const anyData = ab.some((x) => x.views > 0);
                  const leading = ab.length === 2 && r.views > 0 && r.ctr > other.ctr;
                  return (
                    <div key={r.variant} className={`rounded-xl border p-4 ${r.variant === "A" ? "border-indigo-200 dark:border-indigo-800" : "border-fuchsia-200 dark:border-fuchsia-900"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">
                          Variant {r.variant} — {r.variant === "A" ? "“Stop writing headlines. Start winning angles.”" : "“The hook machine. Stop guessing what converts.”"}
                        </p>
                        {leading && anyData && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Leading</span>}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <div><p className="text-lg font-bold">{fmt(r.views)}</p><p className="text-xs text-zinc-400">views</p></div>
                        <div><p className="text-lg font-bold">{fmt(r.clicks)}</p><p className="text-xs text-zinc-400">clicks</p></div>
                        <div><p className="text-lg font-bold text-indigo-500">{r.ctr}%</p><p className="text-xs text-zinc-400">CTR</p></div>
                      </div>
                    </div>
                  );
                })}
                {data && ab.length === 2 && (
                  <p className="text-xs text-zinc-400">
                    Winner declared by CTR once each variant has meaningful views. Traffic is real: this is the actual
                    homepage test running in production.
                  </p>
                )}
              </div>
            </section>
          )}

          {data && (
            <section className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold">What the funnel tells us</h2>
              <p className="mt-1 text-sm text-zinc-500">Top product events and where signups come from.</p>
              <div className="mt-4 space-y-2">
                {data.overview.topEvents.slice(0, 6).map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">{e.name}</span>
                    <span className="font-semibold">{fmt(e.c)}</span>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 text-sm font-semibold">Attribution (UTM source)</h3>
              <div className="mt-2 space-y-2">
                {data.overview.sources.slice(0, 5).map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">{s.source || "direct"}</span>
                    <span className="font-semibold">{fmt(s.c)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/seo" className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  See the SEO program →
                </Link>
                <Link href="/analytics" className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  Funnel analytics →
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
