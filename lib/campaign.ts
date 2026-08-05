import type {
  AnalyzeResult,
  BudgetAllocation,
  CampaignPlan,
  Channel,
  ChannelStrategy,
  ContentCalendarItem,
  Kpi,
} from "./types";
import { CHANNEL_LABELS } from "./types";
import { computeHealthScore } from "./health";
import { targetingSuggestions, testingPlan, funnelMap } from "./perf";
import { demandSignal } from "./demand";

const CHANNELS: Channel[] = ["ad", "email", "youtube", "blog"];

const CHANNEL_ROLES: Record<Channel, string> = {
  ad: "Paid acquisition — cold audiences, fast CTR testing at scale",
  email: "Lifecycle & retention — warm list, subject-line open-rate wins",
  youtube: "Discovery — algorithm-driven reach plus top-of-funnel search",
  blog: "SEO moat — compounding organic traffic and topical authority",
};

export type CampaignOptions = {
  budget?: number;
};

function presentChannels(result: AnalyzeResult): Channel[] {
  return CHANNELS.filter((ch) => result.hooks.some((h) => h.channel === ch));
}

function buildBudget(result: AnalyzeResult, total: number): BudgetAllocation[] {
  const channels = presentChannels(result);
  const weights: Record<Channel, number> = { ad: 1.8, email: 1.2, youtube: 1.4, blog: 0.8 };
  const raw = channels.map((ch) => {
    const hs = result.hooks.filter((h) => h.channel === ch);
    const avg = hs.reduce((s, h) => s + h.score, 0) / (hs.length || 1);
    // Weight by channel base + hook strength so high-scoring channels get more.
    return { channel: ch, w: (weights[ch] || 1) * (0.5 + avg / 100) };
  });
  const sum = raw.reduce((s, r) => s + r.w, 0) || 1;
  const allocations = raw.map((r) => {
    const percent = Math.round((r.w / sum) * 100);
    return {
      channel: r.channel,
      label: CHANNEL_LABELS[r.channel],
      percent,
      amount: Math.round((r.w / sum) * total * 100) / 100,
    };
  });
  // Correct rounding drift so amounts sum exactly to the total.
  const drift = Math.round((total - allocations.reduce((s, a) => s + a.amount, 0)) * 100) / 100;
  if (allocations.length) allocations[allocations.length - 1].amount += drift;
  return allocations;
}

function buildStrategies(result: AnalyzeResult): ChannelStrategy[] {
  return presentChannels(result).map((ch) => {
    const best = [...result.hooks].filter((h) => h.channel === ch).sort((a, b) => b.score - a.score)[0];
    return {
      channel: ch,
      label: CHANNEL_LABELS[ch],
      role: CHANNEL_ROLES[ch],
      bestHook: best?.text || "",
      recommendation: best
        ? `Launch ${CHANNEL_LABELS[ch]} testing with “${best.text}” as your control, then A/B against the challenger angles.`
        : `No hook yet for ${CHANNEL_LABELS[ch]} — run a channel-specific generation to open this lane.`,
    };
  });
}

function buildCalendar(result: AnalyzeResult): ContentCalendarItem[] {
  const channels = presentChannels(result);
  const days = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ];
  const gaps = result.gaps || [];
  const angles = result.angles || [];
  const ideas: string[] = [];
  result.hooks.forEach((h) => {
    if (ideas.length < 5) ideas.push(`Feature a top hook on ${CHANNEL_LABELS[h.channel]}`);
  });
  gaps.slice(0, 2).forEach((g) => ideas.push(`Publish a blue-ocean post on “${g.angleName}”`));
  angles.slice(0, 2).forEach((a) => ideas.push(`Deep-dive content on the ${a.name} angle`));
  if (ideas.length < 7) ideas.push("Share a customer proof point and a video clip");
  while (ideas.length < 7) ideas.push("Republish a top-performing asset to the winning channel");

  return days.map((day, i) => {
    const channel = channels.length ? channels[i % channels.length] : "ad";
    return {
      day: i + 1,
      channel,
      label: CHANNEL_LABELS[channel],
      idea: ideas[i % ideas.length],
    };
  });
}

function buildKpis(result: AnalyzeResult, budget: number): Kpi[] {
  const best = result.hooks.length ? Math.max(...result.hooks.map((h) => h.score)) : 0;
  const projectedCtr = (0.004 + (best / 100) * 0.05) * 100;
  return [
    { metric: "CTR", target: `${projectedCtr.toFixed(1)}%+`, note: "Predicted from your best-scoring hook; a 10% lift over category benchmark is the bar." },
    { metric: "Conversion", target: "3%+", note: "Assumes a matched landing page that echoes the ad promise." },
    { metric: "ROAS", target: "3x+", note: "Profitable at ~₹${budget}/day once frequency and CPA stabilize." },
    { metric: "CPA", target: "≤ ₹" + Math.ceil(budget / 12) , note: "Calibrate daily spend against the conversion count you actually see in test." },
  ];
}

export function buildCampaignPlan(result: AnalyzeResult, opts: CampaignOptions = {}): CampaignPlan {
  const budget = Math.max(50, Number(opts.budget) || 500);
  const health = computeHealthScore(result);
  const demand = demandSignal(result.topic);
  const funnel = funnelMap(result);
  const targeting = targetingSuggestions(result);
  const testing = testingPlan(result);

  return {
    healthScore: health.score,
    healthGrade: health.grade,
    budget: { total: budget, allocations: buildBudget(result, budget) },
    strategies: buildStrategies(result),
    funnel: funnel.map((f) => ({ stage: f.stage, label: f.label, share: f.share })),
    targeting: {
      meta: targeting.meta,
      tiktok: targeting.tiktok,
      google: targeting.google,
      note: targeting.note,
    },
    calendar: buildCalendar(result),
    testing: testing.map((t) => ({
      step: t.step,
      hook: t.hook.text,
      strategy: t.strategy,
      minClicks: t.minClicks,
      durationDays: t.durationDays,
    })),
    demand: { demand: demand.demand, trend: demand.trend, peakMonths: demand.peakMonths, note: demand.note },
    kpis: buildKpis(result, budget),
  };
}