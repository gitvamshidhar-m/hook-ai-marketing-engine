"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { projectBudget } from "@/lib/perf";

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function BudgetPanel({ result }: { result: AnalyzeResult }) {
  const [budget, setBudget] = useState(50);
  const [cpm, setCpm] = useState(12);
  const [aov, setAov] = useState(40);
  const [cvr, setCvr] = useState(2);
  const proj = projectBudget(result, budget, cpm, aov, cvr);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Budget & ROAS projection</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Estimate what each hook makes at your spend. Adjust the knobs and watch projected ROAS move.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Daily budget ($)</span>
          <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">CPM ($)</span>
          <input type="number" value={cpm} onChange={(e) => setCpm(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Avg. order value ($)</span>
          <input type="number" value={aov} onChange={(e) => setAov(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">Conv. rate (%)</span>
          <input type="number" value={cvr} onChange={(e) => setCvr(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
      </div>

      {proj.best && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Best expected ROAS: <strong>{proj.best.roas.toFixed(2)}×</strong> on “{proj.best.hook.text}” — est.{" "}
          {fmt(proj.best.conversions, 1)} orders, ${fmt(proj.best.revenue)} revenue / day at ${fmt(proj.best.spend, 0)} spend.
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-2">Hook</th>
              <th className="px-2">CTR</th>
              <th className="px-2">CPC</th>
              <th className="px-2">Clicks</th>
              <th className="px-2">Conv</th>
              <th className="px-2">Rev</th>
              <th className="py-2 pl-2">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {[...proj.rows].sort((a, b) => b.roas - a.roas).map((r) => (
              <tr key={r.hook.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="max-w-[200px] truncate py-2 pr-2">{r.hook.text}</td>
                <td className="px-2">{(r.ctr * 100).toFixed(1)}%</td>
                <td className="px-2">${r.cpc.toFixed(2)}</td>
                <td className="px-2">{fmt(r.clicks)}</td>
                <td className="px-2">{fmt(r.conversions, 1)}</td>
                <td className="px-2">${fmt(r.revenue)}</td>
                <td className={`py-2 pl-2 font-semibold ${r.roas >= 2 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{r.roas.toFixed(2)}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}