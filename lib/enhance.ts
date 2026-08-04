import type { ComplianceCheck, Forecast, Hook, KeywordRow, Tagline, Channel } from "./types";
import { classifyHook } from "./psych";

const EMOTION_BY_PSYCH: Record<string, { emotion: string; reasoning: string }> = {
  curiosity: { emotion: "Curiosity spike", reasoning: "Withholds payoff to open a loop the brain wants closed — drives clicks from the incomplete." },
  contrarian: { emotion: "Surprise", reasoning: "Contradicts expectations, producing a short salience spike that earns re-reading." },
  fear: { emotion: "Anxiety / urgency", reasoning: "Loss framing triggers a defensive response that motivates immediate action." },
  authority: { emotion: "Trust", reasoning: "Named credibility lowers skepticism, increasing later-stage conversion rather than raw clicks." },
  social: { emotion: "FOMO", reasoning: "Signals the crowd already approves, reducing perceived risk of choosing it." },
  data: { emotion: "Curiosity + trust", reasoning: "A precise number reads as measured, lending instant believability." },
  story: { emotion: "Empathy", reasoning: "Personal narrative keeps attention past the headline's first second." },
  specificity: { emotion: "Anticipation", reasoning: "Concrete promise makes the outcome tangible and easy to imagine." },
  ego: { emotion: "Pride", reasoning: "Appeals to self-image; readers act to protect their claimed identity." },
  misdirection: { emotion: "Surprise", reasoning: "Points at the obvious wrong answer, resetting the reader's frame for free." },
};

export function forecastHook(text: string): Forecast {
  const id = classifyHook(text);
  const meta = EMOTION_BY_PSYCH[id] || { emotion: "Neutral", reasoning: "Standard informational framing." };
  return { emotion: meta.emotion, reasoning: meta.reasoning };
}

const CHANNEL_COMPLIANCE: Record<Channel, string> = {
  ad: "Under 6 words is best for paid social; long claims may get truncated."
    + " Avoid ALL CAPS except penalty phrases.",
  email: "Avoid gutter spam words (free, guarantee, urgent) in the subject to protect deliverability.",
  youtube: "56 chars is the cut-off; keep the promise in the first 4 words. Avoid sensational ALL CAPS spam.",
  blog: "Left-aligned, under 70 chars for a clean SERP snippet. Avoid generic 'The Ultimate Guide' fluff.",
};

// used by docs/UI descriptions
export const complianceGuide = CHANNEL_COMPLIANCE;

export function complianceCheck(hook: Hook): ComplianceCheck {
  const flags: string[] = [];
  const t = hook.text;
  if (/urgent|free|guarantee|100%|act now|limited time|winner|triple|quick cash/i.test(t)) {
    if (hook.channel === "email") flags.push("Possible deliverability spam-word in subject");
    if (hook.channel === "ad") flags.push("High-intent claim — verify against platform ad policies");
  }
  if (hook.channel === "ad" && (t.split(/\s+/).length > 6)) flags.push(`Ad is ${t.split(/\s+/).length} words; keep it ≤6 for feed clarity`);
  if (hook.channel === "youtube" && t.length > 56) flags.push(`YouTube title is ${t.length} chars; try ≤56 to avoid truncation`);
  if (hook.channel === "email" && t.length > 60) flags.push(`Email subject is ${t.length} chars; shorter subjects get more opens on mobile`);
  if (hook.channel === "blog" && /the (ultimate|complete|definitive) guide/i.test(t)) flags.push("Weak generic 'guide' framing — consider a specific promise");
  if (t.length > 120) flags.push("Hook longer than 120 chars; likely too much for most channels");
  if (t !== t.trim()) flags.push("Trailing/leading whitespace detected");
  return { ok: flags.length === 0, flags };
}

export function catchphrases(topic: string, audience: string): Tagline[] {
  const t = topic.toLowerCase().split(/\s+/).slice(0, 4).join(" ");
  const a = audience ? audience.toLowerCase().split(/\s+/).slice(0, 3).join(" ") : "you";
  const pool = [
    `Do ${t} better.`,
    `${a.charAt(0).toUpperCase() + a.slice(1)}, ${t} finally clicks.`,
    `${t}, minus the guesswork.`,
    `Where ${a} get ${t} right.`,
    `Own your ${t}.`,
  ];
  return pool.map((text, i) => ({ text, confidence: 78 - i * 6 })).sort((x, y) => y.confidence - x.confidence);
}

export function keywordMatrix(competitorHooks: string[], hooks: Hook[]): KeywordRow[] {
  // derive topical keywords from competitor lines + our hooks
  const stopwords = new Set(["the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "your", "with", "how", "why", "what", "is", "are", "be", "10", "5", "top", "best"]);
  const counts = new Map<string, { comp: number; mine: number }>();
  const add = (text: string, bucket: "comp" | "mine") => {
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).forEach((w) => {
      if (w.length >= 3 && !stopwords.has(w)) {
        const row = counts.get(w) || { comp: 0, mine: 0 };
        row[bucket] += 1;
        counts.set(w, row);
      }
    });
  };
  competitorHooks.forEach((c) => add(c, "comp"));
  hooks.forEach((h) => add(h.text, "mine"));
  const rows: KeywordRow[] = [];
  counts.forEach((v, k) => {
    if (v.comp > 0 || v.mine > 0) rows.push({ keyword: k, competitorMentions: v.comp, yourMentions: v.mine });
  });
  return rows.sort((a, b) => b.competitorMentions - a.competitorMentions).slice(0, 14);
}