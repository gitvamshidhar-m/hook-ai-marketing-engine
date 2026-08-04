"use client";

import { useState } from "react";
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
import { buildShareUrl } from "@/lib/analytics";
import { buildShareUrl as buildRefShareUrl, earnBonusOnShare } from "@/lib/referral";
import { saveCampaign } from "@/lib/account";

const CHANNEL_ORDER: Channel[] = ["ad", "email", "youtube", "blog"];
const TABS = ["Hooks", "Angles", "Gap Scan", "USP", "Ad Copy", "Plan", "Intelligence"] as const;
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
    setSavedState("done");
    setTimeout(() => setSavedState("idle"), 2000);
  }

  const best = [...result.hooks].sort((a, b) => b.score - a.score)[0];

  return (
    <div className={`mt-6 transition-opacity duration-300 ${loading ? "pointer-events-none opacity-40" : ""}`}>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Results sections">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {t}
            {t === "Hooks" && ` (${result.hooks.length})`}
          </button>
        ))}
        {result.aiPowered && (
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            AI-powered · {result.model}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={save}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {savedState === "done" ? "Saved!" : "Save campaign"}
          </button>
          <button
            onClick={share}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {shareState === "copied" ? "Link copied!" : shareState === "bonus" ? "+1 free run earned!" : "Share results"}
          </button>
          {onTryHarder && (
            <button
              onClick={onTryHarder}
              disabled={tryingHarder || loading}
              className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {tryingHarder ? "Trying harder…" : "Try harder (new angles)"}
            </button>
          )}
        </span>
      </div>

      {best && (
        <div className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Best hook · predicted score {best.score}/100
              <button
                type="button"
                onClick={() => setShowScoreTip((v) => !v)}
                className="ml-2 rounded-full border border-indigo-300/50 px-1.5 text-xs leading-5"
                aria-expanded={showScoreTip}
                aria-label="What does the score mean?"
              >
                ⓘ
              </button>
            </p>
            <span className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => copy(best.text, "best")}
                className="rounded-md border border-white/40 px-2.5 py-1 text-xs font-medium transition hover:bg-white/10"
              >
                {copied === "best" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => setTab("Ad Copy")}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Build into an ad →
              </button>
            </span>
          </div>
          {showScoreTip && (
            <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-xs leading-relaxed text-indigo-100">
              Score = pattern-weighted prediction of CTR lift vs. a bland headline, from specificity, trigger
              strength, and length. AI uses its own judgment too.
            </p>
          )}
          <p className="mt-1 text-lg font-semibold">{best.text}</p>
        </div>
      )}

      {tab === "Hooks" && (
        <div className="mt-5 grid gap-4 md:grid-cols-2" role="tabpanel" id="panel-Hooks" aria-labelledby="tab-Hooks">
          {CHANNEL_ORDER.map((ch) => (
            <section key={ch} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{CHANNEL_LABELS[ch]}</h3>
              <div className="mt-3 space-y-3">
                {result.hooks
                  .filter((h) => h.channel === ch)
                  .map((h) => (
                    <div key={h.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{h.text}</p>
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
                            className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            {copied === h.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>{h.psychology}</span>
                        {h.forecast && (
                          <span className="rounded bg-violet-50 px-1.5 py-0.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {h.forecast.emotion}
                          </span>
                        )}
                        {h.compliance && (
                          <span
                            className={`rounded px-1.5 py-0.5 ${
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
        <div className="mt-5 grid gap-4 md:grid-cols-2" role="tabpanel" id="panel-Angles" aria-labelledby="tab-Angles">
          {result.angles.map((a) => {
            const meta = ANGLE_CATEGORIES.find((c) => c.id === a.category);
            return (
              <div key={a.category} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta?.tint }} />
                  <h3 className="font-semibold">{a.name}</h3>
                </div>
                <p className="mt-2 text-sm">{a.description}</p>
                <p className="mt-2 text-xs text-zinc-500">{a.whyItWorks}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Gap Scan" && (
        <div className="mt-5 space-y-4" role="tabpanel" id="panel-Gap Scan" aria-labelledby="tab-Gap Scan">
          {result.gaps.map((g) => (
            <div key={g.angleCategory} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Untapped angle: {g.angleName}</h3>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  Blue ocean
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{g.evidence}</p>
              <p className="mt-1 text-sm">{g.suggestedHook}</p>
            </div>
          ))}
          {result.gaps.length === 0 && (
            <p className="text-sm text-zinc-500">Add competitor headlines above to scan for untapped angles.</p>
          )}
        </div>
      )}

      {tab === "USP" && (
        <div className="mt-5 space-y-4" role="tabpanel" id="panel-USP" aria-labelledby="tab-USP">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Positioning statement</h3>
            <p className="mt-2 text-lg font-medium">{result.usp.positioningStatement}</p>
            <button
              onClick={() => copy(result.usp.positioningStatement, "usp")}
              className="mt-3 rounded-md border border-zinc-300 px-3 py-1 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {copied === "usp" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Elevator pitch</h3>
            <p className="mt-2 text-lg font-medium">{result.usp.elevatorPitch}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Differentiators</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {result.usp.differentiators.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          {result.taglines && result.taglines.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Catchphrases</h3>
              <div className="mt-3 space-y-2">
                {result.taglines.map((t) => (
                  <div key={t.text} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                    <p className="text-sm font-medium">{t.text}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-800">
                        {t.confidence}%
                      </span>
                      <button
                        onClick={() => copy(t.text, `tag-${t.text}`)}
                        className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
