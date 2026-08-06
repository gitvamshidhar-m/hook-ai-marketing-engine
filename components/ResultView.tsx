"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalyzeResult, Channel } from "@/lib/types";
import { CHANNEL_LABELS, ANGLE_CATEGORIES } from "@/lib/types";
import IntelligencePanel from "./IntelligencePanel";
import AbTestTracker from "./AbTestTracker";
import AbSimulator from "./AbSimulator";
import AdCopyBuilder from "./AdCopyBuilder";
import VoicePanel from "./VoicePanel";
import PlanningPanel from "./PlanningPanel";
import CampaignBrief from "./CampaignBrief";
import KeywordHeatmap from "./KeywordHeatmap";
import AiToolsPanel from "./AiToolsPanel";
import { buildShareUrl } from "@/lib/analytics";
import { buildShareUrl as buildRefShareUrl, earnBonusOnShare } from "@/lib/referral";
import { saveCampaign } from "@/lib/account";
import { exportResultCSV, exportSheets, printCampaignReport } from "@/lib/export";
import { track } from "@/lib/tracking";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];
const TABS = ["Hooks", "Angles", "Gap Scan", "USP", "Ad Copy", "Plan", "AI Tools", "Intelligence"] as const;
type Tab = (typeof TABS)[number];

export default function ResultView({
  result,
  onTryHarder,
  tryingHarder,
  loading = false,
}: {
  result: AnalyzeResult;
  onTryHarder?: () => void;
  tryingHarder?: boolean;
  loading?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Hooks");
  const [copied, setCopied] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "bonus">("idle");
  const [savedState, setSavedState] = useState<"idle" | "done">("idle");
  const [showScoreTip, setShowScoreTip] = useState(false);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    const url = await buildShareUrl(result);
    const refUrl = buildRefShareUrl(url);
    const earned = earnBonusOnShare();
    track("share_created", { topic: result.topic });
    try {
      await navigator.clipboard.writeText(refUrl);
      setShareState(earned ? "bonus" : "copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  function save() {
    saveCampaign(result);
    // Cloud sync when signed in — the session cookie is sent automatically.
    fetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: result.topic, topic: result.topic, result }),
    }).catch(() => {});
    setSavedState("done");
    setTimeout(() => setSavedState("idle"), 2000);
  }

  const best = [...result.hooks].sort((a, b) => b.score - a.score)[0];

  return (
    <div className={`mt-6 transition-opacity duration-300 ${loading ? "pointer-events-none opacity-40" : ""}`}>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Results sections">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              onClick={() => setTab(t)}
              className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-gradient-brand text-white shadow-md shadow-indigo-500/25"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t}
              {t === "Hooks" && ` (${result.hooks.length})`}
            </button>
          ))}
        </div>
        {result.aiPowered && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            AI-powered · {result.model}
          </span>
        )}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={save}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {savedState === "done" ? "Saved!" : "Save campaign"}
          </button>
          <button
            onClick={() => exportResultCSV(result)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            title="Download hooks as CSV"
          >
            CSV
          </button>
          <button
            onClick={() => exportSheets(result)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            title="Copy Google Sheets-ready CSV"
          >
            Sheets
          </button>
          <button
            onClick={() => printCampaignReport(result)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            title="Print or save as PDF report"
          >
            PDF report
          </button>
          <button
            onClick={share}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {shareState === "copied" ? "Link copied!" : shareState === "bonus" ? "+1 free run earned!" : "Share results"}
          </button>
          {onTryHarder && (
            <button
              onClick={onTryHarder}
              disabled={tryingHarder || loading}
              className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {tryingHarder ? "Trying harder…" : "Try harder (new angles)"}
            </button>
          )}
        </span>
      </div>

      {best && (
        <div className="bg-gradient-brand relative mt-6 overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-20" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Best hook · predicted score {best.score}/100
                <button
                  type="button"
                  onClick={() => setShowScoreTip((v) => !v)}
                  className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/40 text-[10px] leading-none transition hover:bg-white/10"
                  aria-expanded={showScoreTip}
                  aria-label="What does the score mean?"
                >
                  ⓘ
                </button>
              </p>
              {showScoreTip && (
                <p className="mt-2 rounded-lg bg-black/15 px-3 py-2 text-xs leading-relaxed text-white/90">
                  Score = pattern-weighted prediction of CTR lift vs. a bland headline, from specificity, trigger
                  strength, and length. AI uses its own judgment too.
                </p>
              )}
              <p className="mt-1.5 text-xl font-semibold sm:text-2xl">{best.text}</p>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <Link
                href={`/card?t=${encodeURIComponent(result.topic)}&q=${encodeURIComponent(best.text)}&s=${best.score}&p=${encodeURIComponent(best.psychology)}`}
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                title="Open the viral scorecard for this hook"
              >
                Scorecard ↗
              </Link>
              <button
                onClick={() => copy(best.text, "best")}
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
              >
                {copied === "best" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => setTab("Ad Copy")}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Build into an ad →
              </button>
            </span>
          </div>
        </div>
      )}

      {tab === "Hooks" && (
        <div className="mt-6 grid gap-5 md:grid-cols-2" role="tabpanel" id="panel-Hooks" aria-labelledby="tab-Hooks">
          {CHANNEL_ORDER.map((ch) => (
            <section key={ch} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                <span className="bg-gradient-brand flex h-6 w-6 items-center justify-center rounded-md text-[10px] text-white">
                  {CHANNEL_LABELS[ch].charAt(0)}
                </span>
                {CHANNEL_LABELS[ch]}
              </h3>
              <div className="mt-4 space-y-3">
                {result.hooks
                  .filter((h) => h.channel === ch)
                  .map((h) => (
                    <div key={h.id} className="group rounded-xl border border-zinc-200 p-3.5 transition hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-indigo-800">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{h.text}</p>
                        <div className="flex shrink-0 items-center gap-2">
                          {h.variation && (
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                              {h.variation}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              h.score >= 80
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : h.score >= 60
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {h.score}
                          </span>
                          <button
                            onClick={() => copy(h.text, h.id)}
                            className="rounded-lg border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            {copied === h.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="text-zinc-400">{h.psychology}</span>
                        {h.forecast && (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {h.forecast.emotion}
                          </span>
                        )}
                        {h.compliance && (
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              h.compliance.ok
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                            title={h.compliance.ok ? "Channel-compliant" : h.compliance.flags.join("\n")}
                          >
                            {h.compliance.ok ? "✓ compliant" : "⚠ flags"}
                          </span>
                        )}
                      </div>
                      {h.forecast && (
                        <p className="mt-1.5 text-xs text-zinc-400">“{h.forecast.reasoning}”</p>
                      )}
                      {h.compliance && !h.compliance.ok && (
                        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-amber-600 dark:text-amber-400">
                          {h.compliance.flags.slice(0, 2).map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "Angles" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2" role="tabpanel" id="panel-Angles" aria-labelledby="tab-Angles">
          {result.angles.map((a) => {
            const meta = ANGLE_CATEGORIES.find((c) => c.id === a.category);
            return (
              <div key={a.category} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta?.tint }} />
                  <h3 className="font-semibold">{a.name}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{a.description}</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">{a.whyItWorks}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Gap Scan" && (
        <div className="mt-6 space-y-4" role="tabpanel" id="panel-Gap Scan" aria-labelledby="tab-Gap Scan">
          {result.gaps.map((g) => (
            <div key={g.angleCategory} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Untapped angle: {g.angleName}</h3>
                <span className="bg-gradient-brand rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                  Blue ocean
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{g.evidence}</p>
              <p className="mt-1.5 text-sm font-medium">{g.suggestedHook}</p>
            </div>
          ))}
          {result.gaps.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-sm text-zinc-500">Add competitor headlines above to scan for untapped angles.</p>
            </div>
          )}
        </div>
      )}

      {tab === "USP" && (
        <div className="mt-6 space-y-4" role="tabpanel" id="panel-USP" aria-labelledby="tab-USP">
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Positioning statement</h3>
            <p className="mt-2 text-lg font-medium leading-relaxed">{result.usp.positioningStatement}</p>
            <button
              onClick={() => copy(result.usp.positioningStatement, "usp")}
              className="mt-3 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {copied === "usp" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Elevator pitch</h3>
            <p className="mt-2 text-lg font-medium leading-relaxed">{result.usp.elevatorPitch}</p>
          </div>
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Differentiators</h3>
            <ul className="mt-3 space-y-2">
              {result.usp.differentiators.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <span className="bg-gradient-brand mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] text-white">
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {result.taglines && result.taglines.length > 0 && (
            <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Catchphrases</h3>
              <div className="mt-3 space-y-2">
                {result.taglines.map((t) => (
                  <div key={t.text} className="flex items-center justify-between gap-2 rounded-xl border border-zinc-100 p-3 transition hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-800">
                    <p className="text-sm font-medium">{t.text}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-800">
                        {t.confidence}%
                      </span>
                      <button
                        onClick={() => copy(t.text, `tag-${t.text}`)}
                        className="rounded-lg border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        {copied === `tag-${t.text}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <CampaignBrief result={result} />
        </div>
      )}

      {tab === "Ad Copy" && (
        <div className="mt-5" role="tabpanel" id="panel-Ad Copy" aria-labelledby="tab-Ad Copy">
          <AdCopyBuilder result={result} />
        </div>
      )}

      {tab === "Plan" && (
        <div role="tabpanel" id="panel-Plan" aria-labelledby="tab-Plan">
          <PlanningPanel result={result} />
        </div>
      )}

      {tab === "AI Tools" && (
        <div className="mt-5" role="tabpanel" id="panel-AI Tools" aria-labelledby="tab-AI Tools">
          <AiToolsPanel result={result} />
        </div>
      )}

      {tab === "Intelligence" && (
        <>
          <AbSimulator result={result} />
          <div className="mt-5">
            <IntelligencePanel result={result} />
          </div>
          <div className="mt-5">
            <VoicePanel result={result} />
          </div>
          {result.keywords && result.keywords.length > 0 && (
            <div className="mt-5">
              <KeywordHeatmap result={result} />
            </div>
          )}
          <div className="mt-5">
            <AbTestTracker result={result} />
          </div>
        </>
      )}
    </div>
  );
}
