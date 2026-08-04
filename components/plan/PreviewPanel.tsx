"use client";

import { useMemo, useState } from "react";
import type { AnalyzeResult, AdCopy } from "@/lib/types";
import { buildTemplateAd } from "@/lib/adcopyTemplate";

type Platform = "Meta" | "TikTok" | "Google";

export default function PreviewPanel({ result }: { result: AnalyzeResult }) {
  const [platform, setPlatform] = useState<Platform>("Meta");
  const ads: AdCopy[] = useMemo(() => buildTemplateAd(result), [result]);
  const ad = ads[0];

  const mock = (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {platform === "Meta" && (
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
            <div>
              <p className="text-sm font-semibold">Brand Page</p>
              <p className="text-xs text-zinc-400">Sponsored</p>
            </div>
          </div>
          <div className="mt-2 h-40 rounded-md bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950 dark:to-violet-950" />
          <p className="mt-3 text-sm font-bold">{ad.headline}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{ad.subheadline}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{ad.body}</p>
          <div className="mt-3 flex items-center justify-between rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold dark:border-zinc-600">
            <span>{ad.cta}</span>
            <span className="text-zinc-400">Learn More</span>
          </div>
        </div>
      )}
      {platform === "TikTok" && (
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-zinc-800 dark:bg-zinc-600" />
            <div>
              <p className="text-sm font-semibold">@brand</p>
              <p className="text-xs text-zinc-400">Original audio · 0:12</p>
            </div>
          </div>
          <div className="mt-2 flex h-40 items-center justify-center rounded-md bg-zinc-100 text-4xl dark:bg-zinc-800">
            ▶
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="font-semibold">@brand</span> {ad.subheadline} {ad.body}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(result.taglines || []).slice(0, 3).map((t) => (
              <span key={t.text} className="text-xs text-indigo-500">
                #{t.text.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18)}
              </span>
            ))}
          </div>
        </div>
      )}
      {platform === "Google" && (
        <div className="p-4">
          <div className="text-xs text-zinc-400">Ad · {ad.headline}</div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            {ad.headline.slice(0, 30)} {ad.headline.length > 30 ? "…" : " · " + ad.cta}
          </p>
          <p className="text-xs text-zinc-500">{ad.subheadline.slice(0, 90)}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{ad.body.slice(0, 90)}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
              {ad.cta}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
              {result.topic.slice(0, 24)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Platform preview</h3>
          <p className="mt-1 text-sm text-zinc-500">See your top ad rendered as it will appear natively.</p>
        </div>
        <div className="flex gap-1.5">
          {(["Meta", "TikTok", "Google"] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                platform === p
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">{mock}</div>
    </div>
  );
}