"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40";

export default function AdPreviewTool() {
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("recruiterbrand.com/careers");
  const [copied, setCopied] = useState(false);

  function copyAll() {
    const text = [`HEADLINE: ${headline}`, `DESCRIPTION: ${description}`, `DISPLAY URL: ${url}`].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  const chars = headline.length;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Ad &amp; SERP Preview</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          See exactly how your hook renders as a Google ad, a search result, a Meta ad, and a YouTube title — before
          you spend a rupee on testing.
        </p>

        <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <span>Headline</span>
                <span className={chars > 30 ? "text-rose-500" : ""}>{chars}/30</span>
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={60}
                placeholder="e.g. Cut Screening Time 70%"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Description (line 1)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={90}
                placeholder="e.g. AI resume screening for recruiters"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Display URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button
            onClick={copyAll}
            className="bg-gradient-brand mt-5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          >
            {copied ? "Copied!" : "Copy ad copy"}
          </button>
        </div>

        {headline && (
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Google Ads preview</h2>
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-sm font-semibold text-emerald-600">{url}</p>
                <p className="mt-1 text-lg font-bold leading-snug">{headline || "Your headline here"}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{description || "Your description here"}</p>
              </div>
              <p className={`mt-2 text-xs ${chars > 30 ? "text-rose-500" : "text-emerald-600"}`}>
                {chars <= 30 ? `${30 - chars} chars left in the 30-char headline limit` : `Over by ${chars - 30} chars (truncated in Google Ads)`}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Search result preview</h2>
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs text-zinc-400">{url.replace(/^www\./i, "")}</p>
                <p className="mt-1 text-xl font-medium leading-snug text-[#1a0dab] dark:text-indigo-300">
                  {headline || "Your headline here"}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {description || "Your description here"} — {url}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Meta (Facebook / Instagram) ad preview</h2>
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">{url[0]?.toUpperCase() || "H"}</span>
                  <div>
                    <p className="text-xs font-semibold">{url}</p>
                    <p className="text-[10px] text-zinc-400">Sponsored</p>
                  </div>
                </div>
                <div className="mt-3 aspect-video rounded-lg bg-gradient-to-br from-indigo-200 to-fuchsia-200 dark:from-indigo-900 dark:to-fuchsia-900" />
                <p className="mt-2 text-sm font-bold leading-snug">{headline || "Your headline here"}</p>
                <p className="mt-1 text-xs text-zinc-500">{description || "Your description here"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">YouTube title preview</h2>
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="line-clamp-2 text-base font-semibold leading-snug">{headline || "Your title here"}</p>
                <p className="mt-1 text-xs text-zinc-500">Channel · 12K views · 2 weeks ago</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}