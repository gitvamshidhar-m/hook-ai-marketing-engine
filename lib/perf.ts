import type {
  AnalyzeResult,
  FunnelMap,
  Hook,
  MessageMatchResult,
  PlatformPolicy,
  RoasProjection,
  SovRow,
  TargetingSuggestions,
  TestingStep,
} from "./types";
import { classifyHook } from "./psych";

/* ---------------- #2 funnel-stage mapping ---------------- */

const FUNNEL_BY_PSYCH: Record<string, "TOFU" | "MOFU" | "BOFU"> = {
  curiosity: "TOFU",
  contrarian: "TOFU",
  misdirection: "TOFU",
  story: "TOFU",
  social: "MOFU",
  authority: "MOFU",
  data: "MOFU",
  specificity: "MOFU",
  ego: "MOFU",
  identity: "MOFU",
  fear: "BOFU",
};

const STAGE_LABEL: Record<string, string> = {
  TOFU: "Top of funnel — awareness & reach",
  MOFU: "Middle of funnel — consideration & proof",
  BOFU: "Bottom of funnel — conversion & urgency",
};

export function funnelMap(result: AnalyzeResult): FunnelMap[] {
  const stages: ("TOFU" | "MOFU" | "BOFU")[] = ["TOFU", "MOFU", "BOFU"];
  return stages.map((stage) => {
    const hooks = result.hooks.filter((h) => FUNNEL_BY_PSYCH[classifyHook(h.text)] === stage);
    return {
      stage,
      label: STAGE_LABEL[stage],
      hooks,
      share: result.hooks.length ? Math.round((hooks.length / result.hooks.length) * 100) : 0,
    };
  });
}

/* ---------------- #1 budget & ROAS projection ---------------- */

function estimateCtr(score: number): number {
  return 0.004 + (score / 100) * 0.05; // 0.4% baseline → ~5.4% at top score
}

export function projectBudget(
  result: AnalyzeResult,
  dailyBudget: number,
  cpm: number,
  conversionValue: number,
  conversionRate: number
): RoasProjection {
  const rows = result.hooks.map((hook) => {
    const ctr = estimateCtr(hook.score);
    const cpc = cpm / 1000 / ctr;
    const clicks = cpc > 0 ? dailyBudget / cpc : 0;
    const conversions = clicks * (conversionRate / 100);
    const revenue = conversions * conversionValue;
    const roas = dailyBudget > 0 ? revenue / dailyBudget : 0;
    return { hook, ctr, cpc, clicks, spend: dailyBudget, conversions, revenue, roas };
  });
  const best = rows.length ? [...rows].sort((a, b) => b.roas - a.roas)[0] : null;
  return { dailyBudget, cpm, conversionValue, conversionRate, rows, best };
}

/* ---------------- #3 message-match score ---------------- */

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

export function messageMatch(result: AnalyzeResult, landingText: string): MessageMatchResult {
  const lp = new Set(tokens(landingText));
  const matches = result.hooks.slice(0, 8).map((hook) => {
    const hookTokens = tokens(hook.text);
    const matched = hookTokens.filter((t) => lp.has(t));
    const missing = hookTokens.filter((t) => !lp.has(t));
    return { hook, matched, missing };
  });
  const scored = matches.filter((m) => m.matched.length > 0).length;
  const score = matches.length ? Math.round((scored / matches.length) * 100) : 0;
  const note =
    score >= 70
      ? "Strong message-match — the page reinforces the ad's promise."
      : score >= 40
        ? "Partial match — page and ad are saying different things. Tighten the landing copy."
        : "Weak match — the page barely echoes the ad's hooks. Expect high bounce and wasted spend.";
  return { score, matches, note };
}

/* ---------------- #4 platform targeting suggestions ---------------- */

export function targetingSuggestions(result: AnalyzeResult): TargetingSuggestions {
  const topicWords = tokens(result.topic);
  const kw = (result.keywords || []).map((k) => k.keyword).filter((k) => k.length > 2);
  const pool = [...new Set([...topicWords, ...kw])].slice(0, 8);
  const aud = result.audience || "";
  const meta = pool.map((p) => p.replace(/\b\w/g, (c) => c.toUpperCase()));
  const tiktok = pool.map((p) => "#" + p.replace(/\s+/g, "")).slice(0, 6);
  const google = [
    ...pool.map((p) => `${p} + ${aud || "guide"}`),
    ...pool.map((p) => `best ${p}`),
    ...pool.map((p) => `${p} for ${aud || "beginners"}`),
  ].slice(0, 9);
  const note = `Estimated from topic keywords and your competitor scan. Import into Ads Manager, then layer on lookalikes of past converters for best ROAS.`;
  return { meta, tiktok, google, note };
}

/* ---------------- #5 creative testing plan ---------------- */

export function testingPlan(result: AnalyzeResult): TestingStep[] {
  const top = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 4);
  return top.map((hook, i) => {
    const strategy =
      i === 0
        ? "Control — highest predicted CTR, run first at scale"
        : i === 1
          ? "Challenger — different psychology trigger from the control"
          : "Explorer — test a lower-confidence angle cheaply";
    const minClicks = 500 + i * 250;
    const durationDays = 5 + i * 2;
    return {
      step: i + 1,
      hook,
      strategy,
      minClicks,
      durationDays,
      verdict:
        i === 0
          ? "Keep if CTR holds above baseline; scale budget"
          : "Promote if it beats the control; else kill at the click threshold",
    };
  });
}

/* ---------------- #9 ad-policy compliance (per platform) ---------------- */

export function platformPolicy(hook: Hook): PlatformPolicy[] {
  const t = hook.text;
  const platforms: { platform: "Meta" | "TikTok" | "Google"; flags: string[] }[] = [
    { platform: "Meta", flags: [] },
    { platform: "TikTok", flags: [] },
    { platform: "Google", flags: [] },
  ];
  if (/\b(guarantee|free|100%|no risk|instant|overnight)\b/i.test(t)) {
    platforms.forEach((p) => p.flags.push("Sweeping claim (guarantee/100%) — needs substantiation or qualification"));
  }
  if (/(?!.)(\.\.\.|!!!|\?\?\?){2,}/.test(t) || /([A-Z]){4,}/.test(t)) {
    platforms.forEach((p) => p.flags.push("Punctuation or ALL-CAPS emphasis — Meta/TikTok dislike excessive emphasis"));
  }
  if (/\b(weight loss|anti-aging|cure|treatment|medical|health benefit)\b/i.test(t)) {
    platforms.forEach((p) => p.flags.push("Health/medical claim — extra review and disclaimers required"));
  }
  if (/^\d+%|\$[\d,]+/.test(t)) {
    platforms.forEach((p) => p.flags.push("Exact numeric claim — keep an evidence source on file"));
  }
  if (/brand|trademark|ours|theirs/i.test(t)) platforms.forEach((p) => p.flags.push("Possible trademark reference — confirm usage rights"));
  if (t.length > 40) {
    platforms[2].flags.push("Google headline limit is 30 chars — this is " + t.length);
  }
  return platforms.map((p) => ({ platform: p.platform, flags: p.flags, ok: p.flags.length === 0 }));
}

/* ---------------- #8 share-of-voice tracker ---------------- */

export function sovRows(result: AnalyzeResult): SovRow[] {
  const map: Record<string, { you: number; competitors: number }> = {};
  result.hooks.forEach((h) => {
    const id = classifyHook(h.text);
    map[id] = map[id] || { you: 0, competitors: 0 };
    map[id].you += 1;
  });
  result.competitorHooks.forEach((c) => {
    const id = classifyHook(c);
    map[id] = map[id] || { you: 0, competitors: 0 };
    map[id].competitors += 1;
  });
  return Object.entries(map)
    .map(([angle, v]) => ({ angle, ...v }))
    .sort((a, b) => b.competitors + b.you - (a.competitors + a.you))
    .slice(0, 10);
}
