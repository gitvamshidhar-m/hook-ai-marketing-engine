"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { CHANNEL_LABELS } from "@/lib/types";

const CHANNEL_TINT: Record<string, string> = {
  ad: "#6366f1",
  email: "#10b981",
  youtube: "#f43f5e",
  blog: "#0ea5e9",
};

export default function CampaignPlanView({ result }: { result: AnalyzeResult }) {
  const plan = result.plan;
  const [publish, setPublish] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [shareUrl, setShareUrl] = useState("");

  async function publishCampaign() {
    if (!plan) return;
    setPublish("busy");
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: result.topic, payload: result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      setShareUrl(data.url);
      setPublish("done");
      try {
        await navigator.clipboard.writeText(data.url);
      } catch {
        /* clipboard unavailable — link is still shown */
      }
    } catch {
      setPublish("error");
    }
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-500">Generate with the Campaign Studio to see the full one-click plan.</p>
      </div>
    );
  }

  const gradeTint = plan.healthGrade === "A" ? "text-emerald-500" : plan.healthGrade === "B" ? "text-indigo-500" : plan.healthGrade === "C" ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-6">
      {/* Header + health score */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">Campaign plan</h2>
            <p className="mt-1 text-sm text-zinc-500">
              One-click strategy for “{result.topic}” · {result.plan ? `Health ${plan.healthScore}/100 (${plan.healthGrade})` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-black ${gradeTint}`}>{plan.healthGrade}</div>
            <div>
              <div className="h-2.5 w-36 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="bg-gradient-brand h-full rounded-full transition-all" style={{ width: `${plan.healthScore}%` }} />
              </div>
              <p className="mt-1 text-xs text-zinc-500">{plan.healthScore}/100 health score</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={publishCampaign}
            disabled={publish === "busy"}
            className="bg-gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            {publish === "busy" ? "Publishing…" : publish === "done" ? "Link copied!" : "Publish campaign link"}
          </button>
          {publish === "done" && shareUrl && (
            <code className="max-w-full truncate rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{shareUrl}</code>
          )}
          {publish === "error" && <p className="text-xs text-amber-600">Couldn&apos;t publish — are you signed in with Supabase configured?</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget allocation */}
        <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold">Budget split</h3>
          <p className="mt-1 text-sm text-zinc-500">Daily spend ₹{plan.budget.total.toLocaleString("en-IN")} projected across channels.</p>
          <div className="mt-4 space-y-3">
            {plan.budget.allocations.map((a) => (
              <div key={a.channel}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHANNEL_TINT[a.channel] || "#6366f1" }} />
                    {a.label}
                  </span>
                  <span className="text-zinc-500">
                    {a.percent}% · ₹{a.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${a.percent}%`, background: CHANNEL_TINT[a.channel] || "#6366f1" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand signal */}
        <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold">Market demand</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${plan.demand.demand >= 70 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" : plan.demand.demand >= 50 ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300" : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300"}`}>
              {plan.demand.demand}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{plan.demand.trend}</span>
              {plan.demand.peakMonths.length > 0 && (
                <p className="mt-1.5">Peaks: {plan.demand.peakMonths.join(", ")}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{plan.demand.note}</p>
        </div>
      </div>

      {/* Channel strategy */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">Channel strategy</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plan.strategies.map((s) => (
            <div key={s.channel} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHANNEL_TINT[s.channel] }} />
                  {CHANNEL_LABELS[s.channel]}
                </h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{s.role}</p>
              {s.bestHook && (
                <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium dark:bg-zinc-800/60">“{s.bestHook}”</p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{s.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">Funnel fit</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {plan.funnel.map((f) => (
            <div key={f.stage} className="rounded-xl border border-zinc-100 p-4 text-center dark:border-zinc-800">
              <p className="text-sm font-bold">{f.stage}</p>
              <p className="mt-1 text-xs text-zinc-500">{f.label}</p>
              <p className="mt-2 text-2xl font-black">{f.share}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day content calendar */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">7-day content calendar</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plan.calendar.map((c) => (
            <div key={c.day} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">Day {c.day}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${CHANNEL_TINT[c.channel] || "#6366f1"}1a`, color: CHANNEL_TINT[c.channel] || "#6366f1" }}>
                  {c.label}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-snug">{c.idea}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testing plan */}
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-semibold">Creative testing plan</h3>
        <div className="mt-4 space-y-3">
          {plan.testing.map((t) => (
            <div key={t.step} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
              <div className="min-w-0">
                <p className="text-sm font-medium">Step {t.step}: “{t.hook}”</p>
                <p className="mt-0.5 text-xs text-zinc-500">{t.strategy}</p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">{t.minClicks} clicks · {t.durationDays} days</span>
            </div>
          ))}
        </div>
      </div>

      {/* Targeting + KPIs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold">Targeting</h3>
          <p className="mt-1 text-xs text-zinc-500">{plan.targeting.note}</p>
          <div className="mt-4 space-y-3">
            {(["meta", "tiktok", "google"] as const).map((p) => (
              <div key={p}>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{p}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {plan.targeting[p].map((t) => (
                    <span key={t} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold">KPIs to hit</h3>
          <div className="mt-4 space-y-3">
            {plan.kpis.map((k) => (
              <div key={k.metric} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{k.metric}</p>
                  <p className="bg-gradient-brand rounded-full px-2.5 py-0.5 text-xs font-bold text-white">{k.target}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{k.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}