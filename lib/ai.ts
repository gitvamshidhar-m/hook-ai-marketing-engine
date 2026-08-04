import { generateResult } from "./engine";
import { classifyHook, detectVoice } from "./psych";
import { catchphrases, complianceCheck, forecastHook, keywordMatrix } from "./enhance";
import type { AdCopy, AnalyzeInput, AnalyzeResult, Channel, Hook } from "./types";
import { CHANNEL_LABELS } from "./types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function hasAi() {
  return Boolean(GEMINI_KEY || GROQ_KEY);
}

const CHANNEL_RULES: Record<Channel, string> = {
  ad: "Ad headline: MAX 6 words. Front-load the payoff. No questions here â€” a bold claim is stronger.",
  email: "Email subject line: 3-8 words, curiosity + urgency. A 'RE:' or 'question' framing works well. No clickbait exclamation spam.",
  youtube: "YouTube title: 40-55 chars, curiosity FIRST, but readable â€” this is it, the promise, then payoff in caps or a bracket.",
  blog: "Blog H1: 6-10 words, clear and specific with a number or 'the' x 'exact way'. Authority + clarity beat cleverness.",
};

function buildPrompt(input: AnalyzeInput, channel: Channel): string {
  const variation = input.variation && input.variation > 0 ? input.variation : 0;
  const avoidPsych = input.avoidPsych || [];
  const avoid = avoidPsych.length
    ? `\n- AVOID these already-used psychology triggers (try different ones): ${avoidPsych.join(", ")}`
    : "";
  const voiceNote =
    input.voiceSamples && input.voiceSamples.length
      ? `\nMatch this brand voice exactly. Examples of their tone: ${input.voiceSamples.slice(0, 3).join(" | ")}`
      : "";
  const languageNote = input.language && input.language !== "en" ? `\nWrite the hooks in ${input.language}.` : "";
  const competitorNote =
    input.competitorHooks && input.competitorHooks.length
      ? `\nCompetitors already use: ${input.competitorHooks.slice(0, 4).join(" | ")}\n- Steer AWAY from matching them unless you can be sharper.`
      : "";
  const variationNote =
    variation > 0
      ? `\nThis is variation #${variation}. The previous sets used generic/openings â€” produce FRESH, non-obvious angles this time.`
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
    voiceNote,
    languageNote,
    "",
    'JSON shape per line: {"channel":"' + channel + '","text":"...","score":82,"psychology":"Curiosity gap","forecast":{"emotion":"Curiosity spike","reasoning":"..."}}',
    "",
    "Rules:",
    `- text MUST be under ${channel === "ad" ? 40 : 75} characters.`,
    "- Vary the psychology trigger across the set (curiosity, loss aversion, social proof, specificity, contrarian, authority, story, identity, misdirection).",
    "- score is 0-100 predicting CTR lift vs a bland headline.",
    "- forecast.emotion is the predicted reader emotion (e.g. Curiosity spike, FOMO, Trust, Surprise); forecast.reasoning is one short sentence explaining it.",
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
          forecast: j.forecast && typeof j.forecast.emotion === "string" ? j.forecast : undefined,
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
      if (GROQ_KEY) {
        raw = await callGroq(buildPrompt({ ...input, count: input.count || 3 }, ch));
        model = `Groq ${GROQ_MODEL}`;
      } else if (GEMINI_KEY) {
        raw = await callGemini(buildPrompt({ ...input, count: input.count || 3 }, ch));
        model = `Gemini ${GEMINI_MODEL}`;
      }
      rawByChannel.set(ch, raw);
    }
  } catch (e) {
    console.error("AI call failed, falling back to engine. Raw error:", e, "| model used:", model);
    return input.debug ? { ...base, aiDebug: String(e) } : base;
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
        forecast: h.forecast || forecastHook(h.text),
        compliance: complianceCheck({ channel: ch, text: h.text } as Hook),
      });
    });
  });

  return {
    ...base,
    hooks: merged,
    aiPowered: true,
    model,
    language: input.language || "en",
    voice:
      input.voiceSamples && input.voiceSamples.length ? detectVoice(input.voiceSamples) : base.voice,
    taglines: catchphrases(input.topic, input.audience || ""),
    keywords: keywordMatrix(input.competitorHooks || [], merged),
  };
}

function parseAdCopies(raw: string): AdCopy[] {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (arrStart === -1 || arrEnd === -1) return [];
  try {
    const arr = JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((c) => typeof c.headline === "string" && c.headline.trim().length > 0)
      .map((c) => ({
        variant: c.variant === "B" ? "B" : "A",
        angle: typeof c.angle === "string" ? c.angle : "Hook",
        headline: c.headline.trim(),
        subheadline: typeof c.subheadline === "string" ? c.subheadline.trim() : "",
        body: typeof c.body === "string" ? c.body.trim() : "",
        cta: typeof c.cta === "string" ? c.cta.trim() : "",
      }));
  } catch {
    return [];
  }
}

export async function generateAiAdCopy(
  result: AnalyzeResult,
  channel: Channel
): Promise<{ copies: AdCopy[]; model: string }> {
  const language =
    result.language && result.language !== "en"
      ? `Write the copy in ${result.language}.`
      : "Write the copy in English.";
  const hooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 4);
  const voiceLine = result.voice
    ? `Match the brand voice (${result.voice.detected.join(", ")}). ${result.voice.summary}`
    : "Use a confident, conversational marketing voice.";
  const keywordLine =
    result.keywords && result.keywords.length
      ? `Naturally include some of these keywords where they fit: ${result.keywords.slice(0, 6).map((k) => k.keyword).join(", ")}.`
      : "";
  const taglineLine =
    result.taglines && result.taglines.length
      ? `You may pull a line from these catchphrases: ${result.taglines.slice(0, 3).map((t) => `"${t.text}"`).join(", ")}.`
      : "";

  const prompt = [
    "You are a direct-response copywriter. Write ONE complete, paste-ready ad.",
    `CHANNEL: ${CHANNEL_LABELS[channel]}`,
    `TOPIC: ${result.topic}`,
    `AUDIENCE: ${result.audience || "general"}`,
    `GOAL: ${result.goal || "generate clicks"}`,
    language,
    voiceLine,
    `Highest-scoring hooks to draw from: ${hooks.map((h) => `"${h.text}"`).join(", ")}`,
    `POSITIONING: ${result.usp.positioningStatement}`,
    `ELEVATOR: ${result.usp.elevatorPitch}`,
    `DIFFERENTIATORS: ${result.usp.differentiators.join("; ")}`,
    keywordLine,
    taglineLine,
    "",
    "Return a JSON array with exactly 2 variants (A and B) using DIFFERENT psychology angles.",
    'Shape: [{"variant":"A","angle":"Curiosity gap","headline":"...","subheadline":"...","body":"...","cta":"..."}]',
    "Rules: headline under 12 words; subheadline under 20 words; body 2-3 short sentences; CTA imperative and under 6 words. No markdown, no commentary.",
  ].join("\n");

  if (GROQ_KEY) {
    const raw = await callGroq(prompt);
    return { copies: parseAdCopies(raw), model: `Groq ${GROQ_MODEL}` };
  }
  const raw = await callGemini(prompt);
  return { copies: parseAdCopies(raw), model: `Gemini ${GEMINI_MODEL}` };
}
