import type { AnalyzeResult, Hook } from "./types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const NVIDIA_KEY = process.env.NVIDIA_API_KEY || "";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";

async function callGroq(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callNvidia(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${NVIDIA_KEY}` },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: maxTokens },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
}

export async function generateText(
  prompt: string,
  maxTokens = 1200
): Promise<{ text: string; model: string }> {
  const attempts: Array<() => Promise<string>> = [];
  if (GROQ_KEY) attempts.push(() => callGroq(prompt, maxTokens));
  if (NVIDIA_KEY) attempts.push(() => callNvidia(prompt, maxTokens));
  if (GEMINI_KEY) attempts.push(() => callGemini(prompt, maxTokens));
  if (attempts.length === 0) throw new Error("No AI provider configured.");
  let lastError: unknown = null;
  for (let i = 0; i < attempts.length; i++) {
    try {
      const text = await attempts[i]();
      if (text.trim()) {
        const model = [GROQ_MODEL, NVIDIA_MODEL, GEMINI_MODEL][i];
        return { text, model };
      }
    } catch (e) {
      lastError = e;
      console.error(`[aitools] provider ${i} failed. Raw error:`, e);
    }
  }
  throw new Error(String(lastError));
}

function extractJsonArray(raw: string): unknown[] {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (arrStart === -1 || arrEnd === -1 || arrEnd <= arrStart) return [];
  try {
    const arr = JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1 || e <= s) return null;
  try {
    return JSON.parse(cleaned.slice(s, e + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export type ImproveMode = "stronger" | "shorter" | "curious" | "urgent";
export type ImprovedHook = { text: string; psychology: string; note: string };

export async function improveHook(
  hook: Hook,
  mode: ImproveMode
): Promise<{ rewrites: ImprovedHook[]; model: string }> {
  const modeInstructions: Record<ImproveMode, string> = {
    stronger: "Rewrite to be bolder and more assertive — sharper payoff, bigger implied outcome, still truthful.",
    shorter: "Cut to the fewest possible words while keeping the promise — punchy, scannable, under 6 words if possible.",
    curious: "Rebuild around a curiosity gap — hide the payoff, make the reader need the next sentence.",
    urgent: "Add urgency or loss aversion — a deadline, a cost of waiting, or a scarce outcome.",
  };
  const prompt = [
    "You are a direct-response copywriter. Rewrite the hook below in 3 fresh ways.",
    `Original hook: "${hook.text}"`,
    `Channel: ${hook.channel}`,
    `Mode: ${modeInstructions[mode]}`,
    "Output ONLY a JSON array of 3 objects.",
    'Shape: [{"text":"...","psychology":"trigger used","note":"one sentence why it works"}]',
    "Rules: each text under 75 chars, no markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 700);
  const arr = extractJsonArray(text);
  const rewrites = arr
    .filter((o) => o && typeof o === "object" && typeof (o as Record<string, unknown>).text === "string")
    .map((o) => {
      const r = o as Record<string, unknown>;
      return {
        text: String(r.text).trim(),
        psychology: typeof r.psychology === "string" ? r.psychology : "Curiosity gap",
        note: typeof r.note === "string" ? r.note : "",
      };
    })
    .filter((r) => r.text.length > 0)
    .slice(0, 3);
  return { rewrites, model };
}

export type HookExplanation = {
  trigger: string;
  audience: string;
  why: string;
  ctrLift: string;
};

export async function explainHook(
  hook: Hook,
  audience: string
): Promise<{ explanation: HookExplanation; model: string }> {
  const prompt = [
    "You are a senior marketing psychologist. Explain why this headline works.",
    `Headline: "${hook.text}"`,
    `Channel: ${hook.channel}`,
    `Target audience: ${audience || "general"}`,
    "Output ONLY a JSON object.",
    'Shape: {"trigger":"name of the psychology trigger","audience":"who this appeals to most","why":"2-3 sentence breakdown of the mechanism","ctrLift":"expected CTR lift vs bland (e.g. +38%)"}',
    "No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 500);
  const obj = extractJsonObject(text);
  const explanation: HookExplanation = {
    trigger: obj && typeof obj.trigger === "string" ? obj.trigger : "Curiosity gap",
    audience: obj && typeof obj.audience === "string" ? obj.audience : "General audience",
    why: obj && typeof obj.why === "string" ? obj.why : "This hook plays on an emotion that drives attention.",
    ctrLift: obj && typeof obj.ctrLift === "string" ? obj.ctrLift : "+25%",
  };
  return { explanation, model };
}

export type VocMine = {
  painPoints: string[];
  desires: string[];
  phrases: string[];
  hooks: { text: string; psychology: string }[];
};

export async function mineVoiceOfCustomer(
  reviews: string
): Promise<{ mine: VocMine; model: string }> {
  const prompt = [
    "You are a voice-of-customer analyst for a marketer. Analyze the customer reviews below.",
    "Reviews:\n" + reviews.slice(0, 2500),
    "Output ONLY a JSON object.",
    'Shape: {"painPoints":["...","..."],"desires":["...","..."],"phrases":["exact customer language","..."],"hooks":[{"text":"headline using customer language","psychology":"trigger"}]}',
    "Rules: 3-5 pain points, 3-5 desires, 3-5 exact phrases, 5 hooks under 75 chars each. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 900);
  const obj = extractJsonObject(text) || {};
  const list = (k: string): string[] =>
    Array.isArray(obj[k]) ? (obj[k] as unknown[]).filter((x) => typeof x === "string").map(String) : [];
  const mine: VocMine = {
    painPoints: list("painPoints").slice(0, 5),
    desires: list("desires").slice(0, 5),
    phrases: list("phrases").slice(0, 5),
    hooks: Array.isArray(obj.hooks)
      ? (obj.hooks as unknown[])
          .filter((h) => h && typeof h === "object" && typeof (h as Record<string, unknown>).text === "string")
          .map((h) => {
            const r = h as Record<string, unknown>;
            return {
              text: String(r.text).trim(),
              psychology: typeof r.psychology === "string" ? r.psychology : "Customer language",
            };
          })
          .slice(0, 5)
      : [],
  };
  return { mine, model };
}

export type EmailDraft = { subject: string; preview: string; body: string; goal: string };

export async function generateEmailSeries(
  result: AnalyzeResult,
  count: number
): Promise<{ emails: EmailDraft[]; model: string }> {
  const topHooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 3);
  const prompt = [
    "You are an email marketing strategist. Write a short welcome/drip sequence for the product below.",
    `Topic: ${result.topic}`,
    `Audience: ${result.audience || "general"}`,
    `Goal: ${result.goal || "generate clicks"}`,
    `Positioning: ${result.usp.positioningStatement}`,
    `Best hooks: ${topHooks.map((h) => `"${h.text}"`).join(", ")}`,
    `Number of emails: ${count}`,
    "Output ONLY a JSON array.",
    'Shape: [{"subject":"under 60 chars","preview":"under 80 chars","body":"3-4 short sentences, paste-ready, plain text","goal":"the purpose of this email in 4 words"}]',
    "Rules: escalate from welcome -> value -> proof -> offer. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 1400);
  const arr = extractJsonArray(text);
  const emails = arr
    .filter((e) => e && typeof e === "object" && typeof (e as Record<string, unknown>).subject === "string")
    .map((e) => {
      const r = e as Record<string, unknown>;
      return {
        subject: String(r.subject).trim(),
        preview: typeof r.preview === "string" ? String(r.preview).trim() : "",
        body: typeof r.body === "string" ? String(r.body).trim() : "",
        goal: typeof r.goal === "string" ? String(r.goal).trim() : "",
      };
    })
    .filter((e) => e.subject.length > 0)
    .slice(0, count);
  return { emails, model };
}

export type CalendarDay = { day: number; platform: string; format: string; headline: string; angle: string };

export async function generateContentCalendar(
  result: AnalyzeResult,
  days: number
): Promise<{ calendar: CalendarDay[]; model: string }> {
  const topHooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 4);
  const platforms = ["Instagram", "LinkedIn", "X", "Facebook", "Email", "YouTube", "TikTok", "Blog", "Threads", "LinkedIn"];
  const prompt = [
    "You are a social media content strategist. Build a content calendar for the topic below.",
    `Topic: ${result.topic}`,
    `Audience: ${result.audience || "general"}`,
    `Goal: ${result.goal || "generate clicks"}`,
    `Best hooks: ${topHooks.map((h) => `"${h.text}"`).join(", ")}`,
    `Number of days: ${days}`,
    `Suggested platform pool: ${platforms.slice(0, 7).join(", ")}`,
    "Output ONLY a JSON array. Each entry is ONE day of content.",
    'Shape: [{"platform":"Instagram","format":"carousel / reel / story / post / thread / newsletter","headline":"the hook for this post","angle":"psychology angle used"}]',
    "Rules: no repeats of the same headline, vary the psychology angle day to day, exact count. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 1200);
  const arr = extractJsonArray(text);
  const calendar = arr
    .filter((d) => d && typeof d === "object" && typeof (d as Record<string, unknown>).headline === "string")
    .map((d, idx) => {
      const r = d as Record<string, unknown>;
      return {
        day: idx + 1,
        platform: typeof r.platform === "string" ? String(r.platform) : "Social",
        format: typeof r.format === "string" ? String(r.format) : "post",
        headline: String(r.headline).trim(),
        angle: typeof r.angle === "string" ? String(r.angle) : "Curiosity gap",
      };
    })
    .filter((d) => d.headline.length > 0)
    .slice(0, days);
  return { calendar, model };
}

export type AngleIdea = { text: string; psychology: string };

export async function brainstormAngles(
  topic: string,
  audience: string,
  goal: string,
  existing: string[]
): Promise<{ angles: AngleIdea[]; model: string }> {
  const prompt = [
    "You are a creative strategist. Brainstorm 20 brand-new headline angles for this topic.",
    `Topic: ${topic}`,
    `Audience: ${audience || "general"}`,
    `Goal: ${goal || "generate clicks"}`,
    existing.length
      ? `Angles already used (AVOID these): ${existing.join(", ")}`
      : "Produce the freshest, least-obvious angles possible.",
    "Output ONLY a JSON array of 20 objects.",
    'Shape: [{"text":"headline under 75 chars","psychology":"trigger used"}]',
    "Rules: spread across curiosity, loss aversion, social proof, contrarian, specificity, authority, story, identity, misdirection, urgency. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 1400);
  const arr = extractJsonArray(text);
  const angles = arr
    .filter((a) => a && typeof a === "object" && typeof (a as Record<string, unknown>).text === "string")
    .map((a) => {
      const r = a as Record<string, unknown>;
      return {
        text: String(r.text).trim(),
        psychology: typeof r.psychology === "string" ? String(r.psychology) : "Curiosity gap",
      };
    })
    .filter((a) => a.text.length > 0)
    .slice(0, 20);
  return { angles, model };
}
