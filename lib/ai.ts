import { generateResult } from "./engine";
import type { AnalyzeInput, AnalyzeResult, Hook } from "./types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export function hasAi() {
  return Boolean(GEMINI_KEY || GROQ_KEY);
}

function geminiPrompt(input: AnalyzeInput, channels: string[]): string {
  return [
    "You are a senior digital marketing analyst and direct-response copywriter.",
    "Generate hyper-specific, original hooks for the following campaign.",
    "",
    `Topic: ${input.topic}`,
    `Audience: ${input.audience || "general marketers"}`,
    `Goal: ${input.goal || "generate clicks"}`,
    `Channels: ${channels.join(", ")}`,
    `Number of hooks per channel: ${input.count || 3}`,
    "",
    "For EACH channel, output exactly this JSON line:",
    '{"channel":"ad","text":"...","score":82,"psychology":"Curiosity gap"}',
    "",
    "Rules:",
    "- Each text MUST be under 75 characters.",
    "- Vary the psychological triggers (curiosity, loss aversion, social proof, specificity, contrarian, authority, story, identity).",
    "- Scores are 0-100 reflecting expected CTR lift vs a bland headline.",
    "- Output ONLY the JSON lines, one per hook. No markdown, no preamble.",
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
        generationConfig: { temperature: 0.9, maxOutputTokens: 1600 },
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
      temperature: 0.9,
      max_tokens: 1600,
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
        out.push({ text: j.text.trim(), channel: j.channel, score: j.score, psychology: j.psychology });
      }
    } catch {
      /* skip malformed line */
    }
  }
  return out;
}

export async function generateAiResult(input: AnalyzeInput): Promise<AnalyzeResult> {
  const base = generateResult(input);
  const channels = input.channel && input.channel !== "all" ? [input.channel] : ["ad", "email", "youtube", "blog"];
  const prompt = geminiPrompt(input, channels);
  let raw = "";
  let model = "";
  try {
    if (GEMINI_KEY) {
      raw = await callGemini(prompt);
      model = `Gemini ${GEMINI_MODEL}`;
    } else if (GROQ_KEY) {
      raw = await callGroq(prompt);
      model = `Groq ${GROQ_MODEL}`;
    }
  } catch (e) {
    console.error("AI call failed, falling back to engine", e);
    return base;
  }
  const parsed = parseHooks(raw);
  if (parsed.length === 0) return base;

  const byChannel = new Map<string, number>();
  parsed.forEach((h) => byChannel.set(h.channel, (byChannel.get(h.channel) || 0) + 1));
  const perChannel = input.count && input.count > 0 ? input.count : 3;

  const merged: Hook[] = [];
  channels.forEach((ch) => {
    const ai = parsed.filter((h) => h.channel === ch).slice(0, perChannel);
    const engineFallback = base.hooks.filter((h) => h.channel === ch);
    const list = ai.length > 0 ? ai : engineFallback;
    const label = base.hooks.find((b) => b.channel === ch)?.channelLabel || ch;
    list.forEach((h, i) => {
      merged.push({
        ...h,
        id: `${ch}-${i}`,
        channelLabel: label,
      });
    });
  });

  return { ...base, hooks: merged, aiPowered: true, model };
}
