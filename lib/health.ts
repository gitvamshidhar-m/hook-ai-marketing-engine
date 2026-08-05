import type { AnalyzeResult } from "./types";
import { computeCoverage } from "./analytics";
import { classifyHook } from "./psych";

export type HealthFactor = {
  id: string;
  label: string;
  score: number;
  weight: number;
  hint: string;
  ok: boolean;
};

export type HealthScore = {
  score: number;
  grade: string;
  factors: HealthFactor[];
  checklist: { label: string; ok: boolean }[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function avgScores(result: AnalyzeResult): number {
  if (!result.hooks.length) return 0;
  return result.hooks.reduce((s, h) => s + h.score, 0) / result.hooks.length;
}

function avgHookLength(result: AnalyzeResult): number {
  if (!result.hooks.length) return 0;
  const words = result.hooks.reduce((s, h) => s + h.text.split(/\s+/).filter(Boolean).length, 0);
  return words / result.hooks.length;
}

function channelSpread(result: AnalyzeResult): number {
  const seen = new Set(result.hooks.map((h) => h.channel));
  return seen.size;
}

function bestScore(result: AnalyzeResult): number {
  if (!result.hooks.length) return 0;
  return Math.max(...result.hooks.map((h) => h.score));
}

export function computeHealthScore(result: AnalyzeResult): HealthScore {
  const cov = computeCoverage(result);

  const factors: HealthFactor[] = [];

  // 1. Angle coverage (25%)
  const covPct = cov.total ? (cov.covered / cov.total) * 100 : 0;
  factors.push({
    id: "coverage",
    label: "Angle diversity",
    score: clamp(covPct),
    weight: 25,
    hint:
      covPct >= 70
        ? "Great spread across psychological angles."
        : covPct >= 40
          ? "Decent mix — some angles carry the load."
          : "Heavy concentration — diversify your angles.",
    ok: covPct >= 60,
  });

  // 2. Hook strength (25%)
  const scoreAvg = avgScores(result);
  factors.push({
    id: "strength",
    label: "Hook strength",
    score: clamp(scoreAvg),
    weight: 25,
    hint:
      scoreAvg >= 75
        ? "Strong predicted CTR."
        : scoreAvg >= 55
          ? "Solid hooks with room to improve."
          : "Hooks underperforming — try the Improve tool.",
    ok: scoreAvg >= 70,
  });

  // 3. Channel fit (15%)
  const spread = channelSpread(result);
  const spreadScore = Math.min(100, (spread / 4) * 100);
  factors.push({
    id: "channel",
    label: "Channel coverage",
    score: spreadScore,
    weight: 15,
    hint:
      spread >= 3
        ? "Hooks tuned across multiple channels."
        : spread >= 2
          ? "Two channels covered — add more for reach."
          : "Single channel — consider email, video, and blog variants.",
    ok: spread >= 2,
  });

  // 4. Readability (15%)
  const len = avgHookLength(result);
  const readabilityScore = clamp(100 - Math.max(0, len - 9) * 4);
  factors.push({
    id: "readability",
    label: "Readability",
    score: readabilityScore,
    weight: 15,
    hint:
      len <= 12
        ? "Hooks are tight and scannable."
        : len <= 16
          ? "Slightly long — tighten a few."
          : "Hooks are long — trim to under 12 words where possible.",
    ok: len <= 14,
  });

  // 5. USP & differentiators (10%)
  const diff = result.usp?.differentiators?.length || 0;
  const uspScore = clamp(diff * 25);
  factors.push({
    id: "usp",
    label: "Positioning",
    score: uspScore,
    weight: 10,
    hint:
      diff >= 3
        ? "Clear differentiators in play."
        : diff >= 1
          ? "Some differentiation — add more proof points."
          : "No unique selling points surfaced.",
    ok: diff >= 1,
  });

  // 6. Gap opportunities (10%)
  const gaps = result.gaps?.length || 0;
  const gapScore = clamp(gaps * 20);
  factors.push({
    id: "gaps",
    label: "White space",
    score: gapScore,
    weight: 10,
    hint:
      gaps >= 3
        ? "Multiple blue-ocean angles identified."
        : gaps >= 1
          ? "Gaps found — exploit them before competitors do."
          : "No gaps detected — check competitor data.",
    ok: gaps >= 1,
  });

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const score = clamp(
    factors.reduce((s, f) => s + f.score * (f.weight / totalWeight), 0)
  );

  const grade =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  const checklist = [
    { label: "Hooks span 3+ psychological angles", ok: cov.covered >= 3 },
    { label: "Best hook scores 75+", ok: bestScore(result) >= 75 },
    { label: "Hooks tuned for 2+ channels", ok: spread >= 2 },
    { label: "Average hook under 14 words", ok: len <= 14 },
    { label: "Clear USP differentiators", ok: diff >= 1 },
    { label: "At least 1 competitor gap found", ok: gaps >= 1 },
  ];

  return { score, grade, factors, checklist };
}
