"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campaign } from "@/lib/account";
import { listCampaigns, deleteCampaign, loadCampaign } from "@/lib/account";
import ResultView from "@/components/ResultView";
import { exportCampaignsCSV, exportResultCSV, printResult } from "@/lib/export";
import type { AnalyzeResult } from "@/lib/types";

export default function CampaignsPage() {
  const [camps, setCamps] = useState<Campaign[]>(() => listCampaigns());
  const [open, setOpen] = useState<AnalyzeResult | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  function remove(id: string) {
    deleteCampaign(id);
    setCamps(listCampaigns());
    setNotice("Campaign deleted.");
    setTimeout(() => setNotice(""), 2000);
  }

  function openCampaign(id: string) {
    if (openId === id) {
      setOpen(null);
      setOpenId(null);
    } else {
      const c = loadCampaign(id);
      setOpen(c ? c.result : null);
      setOpenId(id);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My campaigns</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {camps.length} saved · stored in this browser (syncs to your Supabase account when configured)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {camps.length > 0 && (
              <>
                <button
                  onClick={() => exportCampaignsCSV(camps)}
                  className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    const best = camps[0];
                    if (best) printResult(best.result);
                  }}
                  className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  Print best
                </button>
              </>
            )}
            <Link
              href="/#tool"
              className="bg-gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
            >
              New analysis
            </Link>
          </div>
        </div>

        {notice && <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p>}

        {camps.length === 0 ? (
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xl font-semibold">No saved campaigns yet.</p>
            <p className="mt-1 text-sm text-zinc-500">Run an analysis, then hit “Save campaign” to keep it here.</p>
            <Link
              href="/#tool"
              className="bg-gradient-brand mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
            >
              Go analyze a topic
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((c) => {
              const best = c.result.hooks.reduce((a, b) => (b.score > a.score ? b : a), c.result.hooks[0]);
              return (
                <div key={c.id} className="card-elevated flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.title}</p>
                      <p className="text-xs text-zinc-500">{new Date(c.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => remove(c.id)}
                      className="shrink-0 text-xs text-zinc-400 transition hover:text-rose-500"
                      aria-label="Delete campaign"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.result.hooks.length} hooks · best{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {best ? `${best.score}/100` : "—"}
                    </span>
                    {c.result.aiPowered ? ` · ${c.result.model}` : ""}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openCampaign(c.id)}
                      className="bg-gradient-brand flex-1 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                    >
                      {openId === c.id ? "Hide details" : "Open"}
                    </button>
                    <button
                      onClick={() => exportResultCSV(c.result)}
                      className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      title="Export CSV"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => printResult(c.result)}
                      className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      title="Print"
                    >
                      Print
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {open && (
          <div className="mt-8">
            <ResultView result={open} />
          </div>
        )}
      </div>
    </main>
  );
}