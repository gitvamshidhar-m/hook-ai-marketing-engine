"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign } from "@/lib/account";
import { listCampaigns, deleteCampaign, loadCampaign, duplicateCampaign } from "@/lib/account";
import ResultView from "@/components/ResultView";
import CampaignPlanView from "@/components/CampaignPlanView";
import LeadCapture from "@/components/LeadCapture";
import { exportCampaignsCSV, exportResultCSV, printResult, exportHookPack, printHookPack } from "@/lib/export";
import type { AnalyzeResult } from "@/lib/types";

type CloudProject = {
  id: string;
  title: string;
  topic: string;
  result: AnalyzeResult;
  created_at: string;
  updated_at: string;
};

export default function CampaignsPage() {
  const [camps, setCamps] = useState<Campaign[]>(() => listCampaigns());
  const [cloud, setCloud] = useState<CloudProject[]>([]);
  const [open, setOpen] = useState<AnalyzeResult | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  // Merge cloud projects when signed in.
  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCloud(Array.isArray(d.projects) ? d.projects : []))
      .catch(() => {});
  }, []);

  function remove(id: string) {
    deleteCampaign(id);
    fetch(`/api/projects/delete?id=${id}`, { method: "DELETE" }).catch(() => {});
    setCloud((prev) => prev.filter((p) => p.id !== id));
    setCamps(listCampaigns());
    setNotice("Campaign deleted.");
    setTimeout(() => setNotice(""), 2000);
  }

  function copyLocally(c: Campaign) {
    duplicateCampaign(c);
    setCamps(listCampaigns());
    setNotice("Campaign duplicated.");
    setTimeout(() => setNotice(""), 2000);
  }

  async function copyCloud(p: CloudProject) {
    const res = await fetch("/api/projects/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    const data = await res.json();
    if (res.ok && data.project) {
      setCloud((prev) => [data.project as CloudProject, ...prev]);
      setNotice("Campaign duplicated.");
      setTimeout(() => setNotice(""), 2000);
    }
  }

  function openCampaign(id: string) {
    if (openId === id) {
      setOpen(null);
      setOpenId(null);
    } else {
      const c = loadCampaign(id);
      const cloudProject = cloud.find((p) => p.id === id);
      setOpen(c ? c.result : cloudProject ? cloudProject.result : null);
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
              {camps.length} saved in this browser · {cloud.length} in your account
            </p>
          </div>
          <div className="flex items-center gap-2">
            {camps.length > 0 && (
              <>
                <button
                  onClick={() => exportHookPack(camps)}
                  className="bg-gradient-brand rounded-xl px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
                >
                  Copy Hook Pack
                </button>
                <button
                  onClick={() => printHookPack(camps)}
                  className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  Print Hook Pack
                </button>
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
                      onClick={() => copyLocally(c)}
                      className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      title="Duplicate this campaign"
                    >
                      Copy
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

        {cloud.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Synced to your account
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cloud.map((p) => {
                const best = p.result.hooks.reduce((a, b) => (b.score > a.score ? b : a), p.result.hooks[0]);
                return (
                  <div key={p.id} className="card-elevated flex flex-col rounded-2xl border border-indigo-200 bg-gradient-soft p-5 transition hover:-translate-y-0.5 dark:border-indigo-900 dark:bg-indigo-950/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.title}</p>
                        <p className="text-xs text-zinc-500">{new Date(p.updated_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => remove(p.id)}
                        className="shrink-0 text-xs text-zinc-400 transition hover:text-rose-500"
                        aria-label="Delete project"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {p.result.hooks.length} hooks · best{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {best ? `${best.score}/100` : "—"}
                      </span>
                      {p.result.aiPowered ? ` · ${p.result.model}` : ""}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openCampaign(p.id)}
                        className="bg-gradient-brand flex-1 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                      >
                        {openId === p.id ? "Hide details" : "Open"}
                      </button>
                      <button
                        onClick={() => exportResultCSV(p.result)}
                        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        title="Export CSV"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => copyCloud(p)}
                        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        title="Duplicate this campaign"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => printResult(p.result)}
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
          </>
        )}

        {open && (
          <div className="mt-8">
            {open.plan && (
              <div className="mb-8">
                <CampaignPlanView result={open} />
              </div>
            )}
            <ResultView result={open} />
          </div>
        )}

        <LeadCapture
          compact
          source="campaigns"
          title="Get your best hook turned into a full campaign plan"
          subtitle="Drop your email and we'll send a step-by-step plan for launching the top hook above."
        />
      </div>
    </main>
  );
}