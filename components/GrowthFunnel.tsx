"use client";

import { useEffect, useState } from "react";

type Growth = {
  overview: {
    runs?: number;
    captures?: number;
    signups?: number;
    referralSignups?: number;
    topups?: number;
  } | null;
  fetchedAt?: string;
} | null;

export default function GrowthFunnel() {
  const [data, setData] = useState<Growth>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/growth", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const o = data?.overview;
  if (!o) return null;

  const step = (value: number | undefined, name: string) => ({
    value: value || 0,
    name,
  });
  const steps = [
    step(o.runs, "Runs / hooks"),
    step(o.captures, "Leads captured"),
    step(o.signups, "Signups"),
    step(o.topups, "Paid top-ups"),
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <section className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Funnel & monetization
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Run → lead → signup → paid, with what &quot;free&quot; converts to so far.
      </p>
      <div className="mt-5 space-y-4">
        {steps.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between text-sm">
              <span>{s.name}</span>
              <span className="font-semibold">{s.value.toLocaleString()}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="bg-gradient-brand h-full rounded-full transition-all"
                style={{ width: `${(s.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}