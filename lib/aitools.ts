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

export type Formula = "aida" | "pas" | "bab" | "4ps";

export async function improveHook(
  hook: Hook,
  mode: ImproveMode,
  formula?: Formula
): Promise<{ rewrites: ImprovedHook[]; model: string }> {
  const modeInstructions: Record<ImproveMode, string> = {
    stronger: "Rewrite to be bolder and more assertive — sharper payoff, bigger implied outcome, still truthful.",
    shorter: "Cut to the fewest possible words while keeping the promise — punchy, scannable, under 6 words if possible.",
    curious: "Rebuild around a curiosity gap — hide the payoff, make the reader need the next sentence.",
    urgent: "Add urgency or loss aversion — a deadline, a cost of waiting, or a scarce outcome.",
  };
  const formulaInstructions: Record<Formula, string> = {
    aida: "Use the AIDA framework: Attention-grabbing opening, Interest-building detail, Desire for the outcome, Clear action step.",
    pas: "Use the PAS framework: Problem statement, Agitation of the pain, Solution that resolves it.",
    bab: "Use the Before-After-Bridge framework: Paint the frustrating 'before', describe the ideal 'after', bridge with your offer.",
    "4ps": "Use the 4Ps framework: Promise the outcome, Paint the picture of using it, Prove it works, Push with a call to action.",
  };
  const formulaNote = formula ? `\nFramework: ${formulaInstructions[formula]}` : "";
  const prompt = [
    "You are a direct-response copywriter. Rewrite the hook below in 3 fresh ways.",
    `Original hook: "${hook.text}"`,
    `Channel: ${hook.channel}`,
    `Mode: ${modeInstructions[mode]}`,
    formulaNote,
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
  existing: string[],
  formula?: "aida" | "pas" | "bab" | "4ps"
): Promise<{ angles: AngleIdea[]; model: string }> {
  const formulaInstructions: Record<"aida" | "pas" | "bab" | "4ps", string> = {
    aida: "Use the AIDA framework: Attention-grabbing opening, Interest-building detail, Desire for the outcome, Clear action step.",
    pas: "Use the PAS framework: Problem statement, Agitation of the pain, Solution that resolves it.",
    bab: "Use the Before-After-Bridge framework: Paint the frustrating 'before', describe the ideal 'after', bridge with your offer.",
    "4ps": "Use the 4Ps framework: Promise the outcome, Paint the picture of using it, Prove it works, Push with a call to action.",
  };
  const formulaNote = formula ? `\nFramework: ${formulaInstructions[formula]}` : "";
  const prompt = [
    "You are a creative strategist. Brainstorm 20 brand-new headline angles for this topic.",
    `Topic: ${topic}`,
    `Audience: ${audience || "general"}`,
    `Goal: ${goal || "generate clicks"}`,
    existing.length
      ? `Angles already used (AVOID these): ${existing.join(", ")}`
      : "Produce the freshest, least-obvious angles possible.",
    formulaNote,
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

/* ---------- landing page generator ---------- */

export type LandingPageSection = {
  section: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
};

export async function generateLandingPage(
  result: AnalyzeResult,
  sections: number
): Promise<{ sections: LandingPageSection[]; model: string }> {
  const topHooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 3);
  const prompt = [
    "You are a conversion-focused copywriter. Generate a landing page from the analysis below.",
    `Topic: ${result.topic}`,
    `Audience: ${result.audience || "general"}`,
    `Goal: ${result.goal || "generate clicks"}`,
    `Positioning: ${result.usp.positioningStatement}`,
    `Elevator: ${result.usp.elevatorPitch}`,
    `Best hooks: ${topHooks.map((h) => `"${h.text}"`).join(", ")}`,
    `Number of sections: ${sections}`,
    "Output ONLY a JSON array.",
    'Shape: [{"section":"Hero / Features / Proof / CTA","headline":"...","subheadline":"...","body":"2-3 short sentences","cta":"imperative, under 6 words"}]',
    "Rules: each section must have a headline and CTA. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 1400);
  const arr = extractJsonArray(text);
  const landingSections = arr
    .filter((s) => s && typeof s === "object" && typeof (s as Record<string, unknown>).headline === "string")
    .map((s) => {
      const r = s as Record<string, unknown>;
      return {
        section: typeof r.section === "string" ? String(r.section) : "Section",
        headline: String(r.headline).trim(),
        subheadline: typeof r.subheadline === "string" ? String(r.subheadline).trim() : "",
        body: typeof r.body === "string" ? String(r.body).trim() : "",
        cta: typeof r.cta === "string" ? String(r.cta).trim() : "Learn more",
      };
    })
    .filter((s) => s.headline.length > 0)
    .slice(0, sections);
  return { sections: landingSections, model };
}

/* ---------- persona builder ---------- */

export type Persona = {
  name: string;
  demographics: string;
  painPoints: string[];
  desires: string[];
  objections: string[];
  triggers: string[];
  message: string;
};

export async function buildPersona(
  topic: string,
  audience: string
): Promise<{ personas: Persona[]; model: string }> {
  const prompt = [
    "You are a market research analyst. Build 2 detailed audience personas for this topic.",
    `Topic: ${topic}`,
    `Audience: ${audience || "general"}`,
    "Output ONLY a JSON array of 2 objects.",
    'Shape: [{"name":"persona name","demographics":"age, role, industry","painPoints":["...","..."],"desires":["...","..."],"objections":["...","..."],"triggers":["...","..."],"message":"one-line messaging hook"}]',
    "Rules: make personas distinct (different roles, different pain points). No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 900);
  const arr = extractJsonArray(text);
  const personas = arr
    .filter((p) => p && typeof p === "object" && typeof (p as Record<string, unknown>).name === "string")
    .map((p) => {
      const r = p as Record<string, unknown>;
      return {
        name: String(r.name).trim(),
        demographics: typeof r.demographics === "string" ? String(r.demographics) : "",
        painPoints: Array.isArray(r.painPoints) ? (r.painPoints as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 4) : [],
        desires: Array.isArray(r.desires) ? (r.desires as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 4) : [],
        objections: Array.isArray(r.objections) ? (r.objections as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 3) : [],
        triggers: Array.isArray(r.triggers) ? (r.triggers as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 3) : [],
        message: typeof r.message === "string" ? String(r.message).trim() : "",
      };
    })
    .filter((p) => p.name.length > 0)
    .slice(0, 2);
  return { personas, model };
}

/* ---------- SEO meta generator ---------- */

export type SEOMeta = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
};

export async function generateSEOMeta(
  topic: string,
  audience: string,
  bestHook: string
): Promise<{ meta: SEOMeta; model: string }> {
  const prompt = [
    "You are an SEO specialist. Generate SEO metadata for a landing page about this topic.",
    `Topic: ${topic}`,
    `Audience: ${audience || "general"}`,
    `Best hook: "${bestHook}"`,
    "Output ONLY a JSON object.",
    'Shape: {"title":"under 60 chars","description":"under 160 chars","ogTitle":"under 40 chars","ogDescription":"under 90 chars","keywords":["...","...","..."]}',
    "Rules: title must include the primary keyword, description must be compelling and include a CTA. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 500);
  const obj = extractJsonObject(text) || {};
  const meta: SEOMeta = {
    title: typeof obj.title === "string" ? obj.title : topic,
    description: typeof obj.description === "string" ? obj.description : "",
    ogTitle: typeof obj.ogTitle === "string" ? obj.ogTitle : topic,
    ogDescription: typeof obj.ogDescription === "string" ? obj.ogDescription : "",
    keywords: Array.isArray(obj.keywords) ? (obj.keywords as unknown[]).filter((x) => typeof x === "string").map(String).slice(0, 8) : [],
  };
  return { meta, model };
}

/* ---------- budget allocator ---------- */

export type BudgetAllocation = {
  channel: string;
  percent: number;
  rationale: string;
  estimatedCpc: string;
};

export async function allocateBudget(
  result: AnalyzeResult,
  totalBudget: number
): Promise<{ allocations: BudgetAllocation[]; model: string }> {
  const prompt = [
    "You are a media planner. Allocate a budget across channels for this campaign.",
    `Topic: ${result.topic}`,
    `Audience: ${result.audience || "general"}`,
    `Goal: ${result.goal || "generate clicks"}`,
    `Total budget: $${totalBudget}`,
    `Top hooks: ${result.hooks.slice(0, 3).map((h) => `"${h.text}"`).join(", ")}`,
    "Output ONLY a JSON array.",
    'Shape: [{"channel":"Google Ads / Meta / LinkedIn / TikTok / Email / YouTube","percent":40,"rationale":"why this channel","estimatedCpc":"$0.50"}]',
    "Rules: percentages must sum to 100. Include at least 3 channels. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 700);
  const arr = extractJsonArray(text);
  const allocations = arr
    .filter((a) => a && typeof a === "object" && typeof (a as Record<string, unknown>).channel === "string")
    .map((a) => {
      const r = a as Record<string, unknown>;
      return {
        channel: String(r.channel).trim(),
        percent: typeof r.percent === "number" ? Math.round(r.percent) : 0,
        rationale: typeof r.rationale === "string" ? String(r.rationale).trim() : "",
        estimatedCpc: typeof r.estimatedCpc === "string" ? String(r.estimatedCpc).trim() : "",
      };
    })
    .filter((a) => a.channel.length > 0 && a.percent > 0)
    .slice(0, 6);
  return { allocations, model };
}

/* ---------- brand voice trainer ---------- */

export type BrandVoiceSample = {
  tone: string;
  example: string;
};

export async function trainBrandVoice(
  samples: string
): Promise<{ voice: BrandVoiceSample[]; summary: string; model: string }> {
  const prompt = [
    "You are a brand voice analyst. Analyze these brand voice samples and extract the key tone attributes.",
    "Samples:\n" + samples.slice(0, 2000),
    "Output ONLY a JSON object.",
    'Shape: {"voice":[{"tone":"e.g. confident, casual, authoritative","example":"a short example sentence in this tone"}],"summary":"2-sentence brand voice description"}',
    "Rules: extract 3-5 distinct tone attributes. No markdown, no preamble.",
  ].join("\n");
  const { text, model } = await generateText(prompt, 600);
  const obj = extractJsonObject(text) || {};
  const voice: BrandVoiceSample[] = Array.isArray(obj.voice)
    ? (obj.voice as unknown[])
        .filter((v) => v && typeof v === "object")
        .map((v) => {
          const r = v as Record<string, unknown>;
          return {
            tone: typeof r.tone === "string" ? String(r.tone) : "",
            example: typeof r.example === "string" ? String(r.example) : "",
          };
        })
        .filter((v) => v.tone.length > 0)
        .slice(0, 5)
    : [];
  const summary = typeof obj.summary === "string" ? obj.summary : "";
  return { voice, summary, model };
}

/* ---------- utilities ---------- */

export function characterCount(text: string): number {
  return text.length;
}

export function fleschKincaid(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;
  const syllables = words.reduce((total, w) => {
    const wLower = w.toLowerCase().replace(/[^a-z]/g, "");
    if (wLower.length <= 3) return total + 1;
    const count = wLower.replace(/(?:[^aeiouy]|^)e$/, "").replace(/[^aeiouy]/g, "").length || 1;
    return total + count;
  }, 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
}

export function readabilityLabel(score: number): string {
  if (score >= 70) return "Easy (5th grade)";
  if (score >= 60) return "Fairly easy (6th-8th grade)";
  if (score >= 50) return "Standard (9th-10th grade)";
  if (score >= 30) return "Difficult (11th-12th grade)";
  return "Very difficult (college)";
}

export type PlatformExport = {
  platform: string;
  field: string;
  value: string;
};

export function exportForPlatform(
  result: AnalyzeResult,
  platform: "google-ads" | "meta" | "mailchimp" | "linkedin"
): PlatformExport[] {
  const hooks = [...result.hooks].sort((a, b) => b.score - a.score).slice(0, 4);
  const exports: PlatformExport[] = [];
  switch (platform) {
    case "google-ads":
      exports.push({ platform: "Google Ads", field: "Headline 1", value: hooks[0]?.text || "" });
      exports.push({ platform: "Google Ads", field: "Headline 2", value: hooks[1]?.text || "" });
      exports.push({ platform: "Google Ads", field: "Description", value: result.usp.positioningStatement });
      exports.push({ platform: "Google Ads", field: "Display URL", value: `www.${result.topic.replace(/\s+/g, "-")}.com` });
      break;
    case "meta":
      exports.push({ platform: "Meta", field: "Primary text", value: hooks[0]?.text || "" });
      exports.push({ platform: "Meta", field: "Headline", value: result.usp.positioningStatement });
      exports.push({ platform: "Meta", field: "Description", value: result.usp.elevatorPitch });
      break;
    case "mailchimp":
      exports.push({ platform: "Mailchimp", field: "Subject line", value: hooks[0]?.text || "" });
      exports.push({ platform: "Mailchimp", field: "Preview text", value: result.usp.elevatorPitch });
      exports.push({ platform: "Mailchimp", field: "Body headline", value: result.usp.positioningStatement });
      break;
    case "linkedin":
      exports.push({ platform: "LinkedIn", field: "Post hook", value: hooks[0]?.text || "" });
      exports.push({ platform: "LinkedIn", field: "Body", value: result.usp.positioningStatement });
      exports.push({ platform: "LinkedIn", field: "CTA", value: result.goal || "Learn more" });
      break;
  }
  return exports;
}

export type AbTestResult = {
  hookId: string;
  hookText: string;
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
  date: string;
};

export function logAbTest(
  hookId: string,
  hookText: string,
  variant: string,
  impressions: number,
  clicks: number
): AbTestResult {
  const ctr = impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0;
  const entry: AbTestResult = { hookId, hookText, variant, impressions, clicks, ctr, date: new Date().toISOString() };
  try {
    const raw = localStorage.getItem("hookai-abtests") || "[]";
    const tests: AbTestResult[] = JSON.parse(raw);
    tests.push(entry);
    localStorage.setItem("hookai-abtests", JSON.stringify(tests.slice(-100)));
  } catch {
    /* localStorage unavailable */
  }
  return entry;
}

export function getAbTests(): AbTestResult[] {
  try {
    const raw = localStorage.getItem("hookai-abtests") || "[]";
    return JSON.parse(raw) as AbTestResult[];
  } catch {
    return [];
  }
}

export function clearAbTests(): void {
  try {
    localStorage.removeItem("hookai-abtests");
  } catch {
    /* ignore */
  }
}

/* ---------- multi-language UI ---------- */

export const UI_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
] as const;

export type UiLanguage = (typeof UI_LANGUAGES)[number]["code"];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    improve: "Improve hook",
    explain: "Why it works",
    voc: "Voice of customer",
    "email-series": "Email series",
    calendar: "Content calendar",
    angles: "Brainstorm angles",
    landing: "Landing page",
    persona: "Audience persona",
    seo: "SEO metadata",
    budget: "Budget allocator",
    brand: "Brand voice",
    export: "Export",
    print: "Print",
    save: "Save campaign",
    share: "Share results",
    "try-harder": "Try harder",
    copy: "Copy",
    "ai-powered": "AI-powered",
    "free-plan": "Free plan",
    "runs-today": "runs today",
    "bonus-from-sharing": "bonus from sharing",
    "no-ai": "No AI configured",
    "ai-failed": "AI tool failed. Try again.",
    loading: "Thinking…",
    "paste-reviews": "Paste customer reviews here…",
    generate: "Generate",
    "export-csv": "Export CSV",
    "print-pdf": "Print PDF",
    "best-hook": "Best hook",
    "competitor-gaps": "Competitor gaps",
    keywords: "Keywords",
    "angles-title": "Angles",
    "ad-copy": "Ad Copy",
    plan: "Plan",
    "ai-tools": "AI Tools",
    intelligence: "Intelligence",
  },
  es: {
    improve: "Mejorar gancho",
    explain: "Por qué funciona",
    voc: "Voz del cliente",
    "email-series": "Serie de emails",
    calendar: "Calendario de contenido",
    angles: "Generar ángulos",
    landing: "Página de destino",
    persona: "Persona de audiencia",
    seo: "Metadatos SEO",
    budget: "Asignación de presupuesto",
    brand: "Voz de marca",
    export: "Exportar",
    print: "Imprimir",
    save: "Guardar campaña",
    share: "Compartir resultados",
    "try-harder": "Intentar más",
    copy: "Copiar",
    "ai-powered": "Impulsado por IA",
    "free-plan": "Plan gratuito",
    "runs-today": "ejecuciones hoy",
    "bonus-from-sharing": "bono por compartir",
    "no-ai": "Sin IA configurada",
    "ai-failed": "La herramienta de IA falló. Inténtalo de nuevo.",
    loading: "Pensando…",
    "paste-reviews": "Pega las reseñas de clientes aquí…",
    generate: "Generar",
    "export-csv": "Exportar CSV",
    "print-pdf": "Imprimir PDF",
    "best-hook": "Mejor gancho",
    "competitor-gaps": "Brechas competitivas",
    keywords: "Palabras clave",
    "angles-title": "Ángulos",
    "ad-copy": "Copiar anuncio",
    plan: "Plan",
    "ai-tools": "Herramientas IA",
    intelligence: "Inteligencia",
  },
  pt: {
    improve: "Melhorar gancho",
    explain: "Por que funciona",
    voc: "Voz do cliente",
    "email-series": "Sequência de e-mails",
    calendar: "Calendário de conteúdo",
    angles: "Gerar ângulos",
    landing: "Página de destino",
    persona: "Persona da audiência",
    seo: "Metadados SEO",
    budget: "Alocação de orçamento",
    brand: "Voz da marca",
    export: "Exportar",
    print: "Imprimir",
    save: "Salvar campanha",
    share: "Compartilhar resultados",
    "try-harder": "Tentar mais",
    copy: "Copiar",
    "ai-powered": "Impulsionado por IA",
    "free-plan": "Plano gratuito",
    "runs-today": "execuções hoje",
    "bonus-from-sharing": "bônus por compartilhar",
    "no-ai": "Sem IA configurada",
    "ai-failed": "A ferramenta de IA falhou. Tente novamente.",
    loading: "Pensando…",
    "paste-reviews": "Cole as avaliações dos clientes aqui…",
    generate: "Gerar",
    "export-csv": "Exportar CSV",
    "print-pdf": "Imprimir PDF",
    "best-hook": "Melhor gancho",
    "competitor-gaps": "Lacunas competitivas",
    keywords: "Palavras-chave",
    "angles-title": "Ângulos",
    "ad-copy": "Copiar anúncio",
    plan: "Plano",
    "ai-tools": "Ferramentas IA",
    intelligence: "Inteligência",
  },
  de: {
    improve: "Hook verbessern",
    explain: "Warum es funktioniert",
    voc: "Kundenstimme",
    "email-series": "E-Mail-Serie",
    calendar: "Inhaltskalender",
    angles: "Winkel brainstormen",
    landing: "Landingpage",
    persona: "Zielgruppen-Persona",
    seo: "SEO-Metadaten",
    budget: "Budgetverteilung",
    brand: "Markenstimme",
    export: "Exportieren",
    print: "Drucken",
    save: "Kampagne speichern",
    share: "Ergebnisse teilen",
    "try-harder": "Noch besser",
    copy: "Kopieren",
    "ai-powered": "KI-gestützt",
    "free-plan": "Kostenloser Plan",
    "runs-today": "Ausführungen heute",
    "bonus-from-sharing": "Bonus durch Teilen",
    "no-ai": "Keine KI konfiguriert",
    "ai-failed": "KI-Tool fehlgeschlagen. Versuchen Sie es erneut.",
    loading: "Denken…",
    "paste-reviews": "Kundenbewertungen hier einfügen…",
    generate: "Generieren",
    "export-csv": "CSV exportieren",
    "print-pdf": "PDF drucken",
    "best-hook": "Bester Hook",
    "competitor-gaps": "Wettbewerbslücken",
    keywords: "Schlüsselwörter",
    "angles-title": "Winkel",
    "ad-copy": "Anzeigen kopieren",
    plan: "Plan",
    "ai-tools": "KI-Tools",
    intelligence: "Intelligenz",
  },
  fr: {
    improve: "Améliorer le crochet",
    explain: "Pourquoi ça fonctionne",
    voc: "Voix du client",
    "email-series": "Série d'e-mails",
    calendar: "Calendrier de contenu",
    angles: "Générer des angles",
    landing: "Page de destination",
    persona: "Persona d'audience",
    seo: "Métadonnées SEO",
    budget: "Allocation budgétaire",
    brand: "Voix de marque",
    export: "Exporter",
    print: "Imprimer",
    save: "Enregistrer la campagne",
    share: "Partager les résultats",
    "try-harder": "Essayer plus fort",
    copy: "Copier",
    "ai-powered": "Propulsé par l'IA",
    "free-plan": "Plan gratuit",
    "runs-today": "exécutions aujourd'hui",
    "bonus-from-sharing": "bonus en partageant",
    "no-ai": "Aucune IA configurée",
    "ai-failed": "L'outil IA a échoué. Réessayez.",
    loading: "Réflexion…",
    "paste-reviews": "Collez les avis clients ici…",
    generate: "Générer",
    "export-csv": "Exporter CSV",
    "print-pdf": "Imprimer PDF",
    "best-hook": "Meilleur crochet",
    "competitor-gaps": "Failles concurrentielles",
    keywords: "Mots-clés",
    "angles-title": "Angles",
    "ad-copy": "Copier la pub",
    plan: "Plan",
    "ai-tools": "Outils IA",
    intelligence: "Intelligence",
  },
};

export function t(key: string, lang: UiLanguage = "en"): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
