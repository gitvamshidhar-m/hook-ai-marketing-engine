import { generateResult } from "./engine";
import { classifyHook } from "./psych";
import type { AnalyzeInput, AnalyzeResult, Channel, Hook } from "./types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function hasAi() {
  return Boolean(GEMINI_KEY || GROQ_KEY);
}

const CHANNEL_RULES: Record<Channel, string> = {
  ad: "Ad headline: MAX 6 words. Front-load the payoff. No questions here — a bold claim is stronger.",
  email: "Email subject line: 3-8 words, curiosity + urgency. A 'RE:' or 'question' framing works well. No clickbait exclamation spam.",
  youtube: "YouTube title: 40-55 chars, curiosity FIRST, but readable — this is it, the promise, then payoff in caps or a bracket.",
  blog: "Blog H1: 6-10 words, clear and specific with a number or 'the' x 'exact way'. Authority + clarity beat cleverness.",
};

function buildPrompt(input: AnalyzeInput, channel: Channel): string {
  const variation = input.variation && input.variation > 0 ? input.variation : 0;
  const avoidPsych = input.avoidPsych || [];
  const avoid = avoidPsych.length
    ? `\n- AVOID these already-used psychology triggers (try different ones): ${avoidPsych.join(", ")}`
    : "";
  const competitorNote =
    input.competitorHooks && input.competitorHooks.length
      ? `\nCompetitors already use: ${input.competitorHooks.slice(0, 4).join(" | ")}\n- Steer AWAY from matching them unless you can be sharper.`
      : "";
  const variationNote =
    variation > 0
      ? `\nThis is variation #${variation}. The previous sets used generic/openings — produce FRESH, non-obvious angles this time.`
      : "\nProduce the single strongest options (high CTR ambition).";
  return [
    "You are a senior digital marketing analyst and direct-response copywriter.",
    "Generate original, line-ready hooks. Output ONLY JSON lines, one hook per line. No markdown, no preamble.",
    `Topic: ${input.topic}`,
    `Audience: ${input.audience || "general marketers"}`,
    `Goal: ${input.goal || "generate clicks"}`,
    `Channel: ${CHANNEL_RULES[channel]}`,
    `Number of hooks for this channel: ${input.count || 3}`,
    variationNote,
    competitorNote,
    avoid,
    "",
    'JSON shape per line: {"channel":"' + channel + '","text":"...","score":82,"psychology":"Curiosity gap"}',
    "",
    "Rules:",
    `- text MUST be under ${channel === "ad" ? 40 : 75} characters.`,
    "- Vary the psychology trigger across the set (curiosity, loss aversion, social proof, specificity, contrarian, authority, story, identity, misdirection).",
    "- score is 0-100 predicting CTR lift vs a bland headline.",
  ].join("\n");
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2000 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.95,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

function parseHooks(raw: string): Array<Omit<Hook, "id" | "channelLabel">> {
  const cleaned = raw
    .replace(/```json|```/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{") && l.endsWith("}"));
  const out: Array<Omit<Hook, "id" | "channelLabel">> = [];
  for (const line of cleaned) {
    try {
      const j = JSON.parse(line);
      if (typeof j.text === "string" && typeof j.score === "number") {
        out.push({
          text: j.text.trim(),
          channel: j.channel,
          score: j.score,
          psychology: typeof j.psychology === "string" ? j.psychology : humanize(j.text),
        });
      }
    } catch {
      /* skip malformed line */
    }
  }
  return out;
}

function humanize(t: string) {
  const id = classifyHook(t);
  const map: Record<string, string> = {
    data: "Data-backed", contrarian: "Contrarian", curiosity: "Curiosity gap",
    fear: "Loss aversion", social: "Social proof", specificity: "Specificity",
    authority: "Authority", story: "Story-driven", ego: "Identity / ego", identity: "Identity",
    misdirection: "Misdirection",
  };
  return map[id] || "Curiosity gap";
}

export async function generateAiResult(input: AnalyzeInput): Promise<AnalyzeResult> {
  const base = generateResult(input);
  const channels: Channel[] =
    input.channel && input.channel !== "all" ? [input.channel] : ["ad", "email", "youtube", "blog"];
  const variation = input.variation && input.variation > 0 ? input.variation : 0;

  const rawByChannel = new Map<string, string>();
  let model = "";
  try {
    for (const ch of channels) {
      let raw = "";
      if (GEMINI_KEY) {
        raw = await callGemini(buildPrompt({ ...input, count: input.count || 3 }, ch));
        model = `Gemini ${GEMINI_MODEL}`;
      } else if (GROQ_KEY) {
        raw = await callGroq(buildPrompt({ ...input, count: input.count || 3 }, ch));
        model = `Groq ${GROQ_MODEL}`;
      }
      rawByChannel.set(ch, raw);
    }
  } catch (e) {
    console.error("AI call failed, falling back to engine", e);
    return base;
  }

  const merged: Hook[] = [];
  const perChannel = input.count && input.count > 0 ? input.count : 3;
  channels.forEach((ch) => {
    const ai = parseHooks(rawByChannel.get(ch) || "").slice(0, perChannel);
    const kept = ai.length > 0 ? ai : base.hooks.filter((h) => h.channel === ch);
    const label = base.hooks.find((b) => b.channel === ch)?.channelLabel || ch;
    kept.forEach((h, i) => {
      merged.push({
        ...h,
        channel: ch,
        id: `${ch}-${variation}-${i}`,
        channelLabel: label,
        variation: variation > 0 ? `v${variation}` : undefined,
      });
    });
  });

  return { ...base, hooks: merged, aiPowered: true, model };
}
