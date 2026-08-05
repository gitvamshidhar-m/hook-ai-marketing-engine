"use client";

import { useState } from "react";
import type { AnalyzeResult, Hook, ImproveMode } from "@/lib/types";
import { characterCount, fleschKincaid, readabilityLabel, exportForPlatform, logAbTest, getAbTests, clearAbTests, t, type UiLanguage } from "@/lib/aitools";

type ToolState = "idle" | "loading" | "done" | "error";

async function callTool<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/ai-tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI tool failed.");
  return data as T;
}

const MODES: { id: ImproveMode; label: string; hint: string }[] = [
  { id: "stronger", label: "Bolder", hint: "More assertive payoff" },
  { id: "shorter", label: "Tighter", hint: "Fewest words, same punch" },
  { id: "curious", label: "Curious", hint: "Rebuild the curiosity gap" },
  { id: "urgent", label: "Urgent", hint: "Add scarcity / deadline" },
];

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 sm:p-6">
      <h3 className="flex items-center gap-2.5 font-semibold">
        <span className="bg-gradient-soft flex h-8 w-8 items-center justify-center rounded-lg text-base" aria-hidden>
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
      Thinking…
    </div>
  );
}

export default function AiToolsPanel({ result }: { result: AnalyzeResult }) {
  const sortedHooks = [...result.hooks].sort((a, b) => b.score - a.score);
  const [improveHook, setImproveHook] = useState<Hook>(sortedHooks[0]);
  const [improveMode, setImproveMode] = useState<ImproveMode>("stronger");
  const [improveState, setImproveState] = useState<ToolState>("idle");
  const [rewrites, setRewrites] = useState<{ text: string; psychology: string; note: string }[]>([]);
  const [rewriteModel, setRewriteModel] = useState("");

  const [explainState, setExplainState] = useState<ToolState>("idle");
  const [explain, setExplain] = useState<{ trigger: string; audience: string; why: string; ctrLift: string } | null>(null);

  const [reviews, setReviews] = useState("");
  const [vocState, setVocState] = useState<ToolState>("idle");
  const [voc, setVoc] = useState<{ painPoints: string[]; desires: string[]; phrases: string[]; hooks: { text: string; psychology: string }[] } | null>(null);

  const [emailCount, setEmailCount] = useState(4);
  const [emailState, setEmailState] = useState<ToolState>("idle");
  const [emails, setEmails] = useState<{ subject: string; preview: string; body: string; goal: string }[]>([]);

  const [days, setDays] = useState(14);
  const [calState, setCalState] = useState<ToolState>("idle");
  const [calendar, setCalendar] = useState<{ day: number; platform: string; format: string; headline: string; angle: string }[]>([]);

  const [anglesState, setAnglesState] = useState<ToolState>("idle");
  const [angles, setAngles] = useState<{ text: string; psychology: string }[]>([]);
  const [angleFormula, setAngleFormula] = useState<"aida" | "pas" | "bab" | "4ps">("aida");
  const [copied, setCopied] = useState("");

  // New feature states
  const [landingState, setLandingState] = useState<ToolState>("idle");
  const [landingSections, setLandingSections] = useState<{ section: string; headline: string; subheadline?: string; body?: string; cta: string }[]>([]);
  const [personaState, setPersonaState] = useState<ToolState>("idle");
  const [personas, setPersonas] = useState<{ name: string; demographics: string; painPoints: string[]; desires: string[]; objections: string[]; triggers: string[]; message: string }[]>([]);
  const [seoState, setSeoState] = useState<ToolState>("idle");
  const [seoMeta, setSeoMeta] = useState<{ title: string; description: string; ogTitle: string; ogDescription: string; keywords: string[] } | null>(null);
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [budgetState, setBudgetState] = useState<ToolState>("idle");
  const [budgetAllocations, setBudgetAllocations] = useState<{ channel: string; percent: number; estimatedCpc: string; rationale: string }[]>([]);
  const [brandSamples, setBrandSamples] = useState("");
  const [brandState, setBrandState] = useState<ToolState>("idle");
  const [brandVoice, setBrandVoice] = useState<{ voice: { tone: string; example: string }[]; summary: string } | null>(null);
  const [exportData, setExportData] = useState<{ field: string; value: string }[]>([]);
  const [exportPlatform, setExportPlatform] = useState<string>("");
  const [abHookText, setAbHookText] = useState("");
  const [abVariant, setAbVariant] = useState("A");
  const [abImpressions, setAbImpressions] = useState(0);
  const [abClicks, setAbClicks] = useState(0);
  const [abTests, setAbTests] = useState<{ hookText: string; variant: string; impressions: number; clicks: number; ctr: number }[]>([]);
  const [readabilityText, setReadabilityText] = useState("");
  const [lang, setLang] = useState<UiLanguage>("en");

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function runImprove() {
    setImproveState("loading");
    try {
      const data = await callTool<{ rewrites: { text: string; psychology: string; note: string }[]; model: string }>({
        tool: "improve",
        hook: improveHook,
        mode: improveMode,
      });
      setRewrites(data.rewrites);
      setRewriteModel(data.model);
      setImproveState("done");
    } catch (e) {
      setImproveState("error");
      console.error(e);
    }
  }

  async function runExplain() {
    setExplainState("loading");
    try {
      const data = await callTool<{ explanation: { trigger: string; audience: string; why: string; ctrLift: string }; model: string }>({
        tool: "explain",
        hook: improveHook,
        audience: result.audience,
      });
      setExplain(data.explanation);
      setExplainState("done");
    } catch (e) {
      setExplainState("error");
      console.error(e);
    }
  }

  async function runVoc() {
    setVocState("loading");
    try {
      const data = await callTool<{ mine: { painPoints: string[]; desires: string[]; phrases: string[]; hooks: { text: string; psychology: string }[] }; model: string }>({
        tool: "voc",
        reviews,
      });
      setVoc(data.mine);
      setVocState("done");
    } catch (e) {
      setVocState("error");
      console.error(e);
    }
  }

  async function runEmails() {
    setEmailState("loading");
    try {
      const data = await callTool<{ emails: { subject: string; preview: string; body: string; goal: string }[]; model: string }>({
        tool: "email-series",
        result,
        count: emailCount,
      });
      setEmails(data.emails);
      setEmailState("done");
    } catch (e) {
      setEmailState("error");
      console.error(e);
    }
  }

  async function runCalendar() {
    setCalState("loading");
    try {
      const data = await callTool<{ calendar: { day: number; platform: string; format: string; headline: string; angle: string }[]; model: string }>({
        tool: "calendar",
        result,
        days,
      });
      setCalendar(data.calendar);
      setCalState("done");
    } catch (e) {
      setCalState("error");
      console.error(e);
    }
  }

  async function runAngles() {
    setAnglesState("loading");
    try {
      const data = await callTool<{ angles: { text: string; psychology: string }[]; model: string }>({
        tool: "angles",
        topic: result.topic,
        audience: result.audience,
        goal: result.goal,
        existing: result.hooks.map((h) => h.psychology).slice(0, 12),
        formula: angleFormula,
      });
      setAngles(data.angles);
      setAnglesState("done");
    } catch (e) {
      setAnglesState("error");
      console.error(e);
    }
  }

  async function runLanding() {
    setLandingState("loading");
    try {
      const data = await callTool<{ sections: { section: string; headline: string; subheadline?: string; body?: string; cta: string }[]; model: string }>({
        tool: "landing",
        result,
        bestHook: sortedHooks[0],
      });
      setLandingSections(data.sections);
      setLandingState("done");
    } catch (e) {
      setLandingState("error");
      console.error(e);
    }
  }

  async function runPersona() {
    setPersonaState("loading");
    try {
      const data = await callTool<{ personas: { name: string; demographics: string; painPoints: string[]; desires: string[]; objections: string[]; triggers: string[]; message: string }[]; model: string }>({
        tool: "persona",
        result,
      });
      setPersonas(data.personas);
      setPersonaState("done");
    } catch (e) {
      setPersonaState("error");
      console.error(e);
    }
  }

  async function runSeo() {
    setSeoState("loading");
    try {
      const data = await callTool<{ meta: { title: string; description: string; ogTitle: string; ogDescription: string; keywords: string[] }; model: string }>({
        tool: "seo",
        bestHook: sortedHooks[0],
        topic: result.topic,
      });
      setSeoMeta(data.meta);
      setSeoState("done");
    } catch (e) {
      setSeoState("error");
      console.error(e);
    }
  }

  async function runBudget() {
    setBudgetState("loading");
    try {
      const data = await callTool<{ allocations: { channel: string; percent: number; estimatedCpc: string; rationale: string }[]; model: string }>({
        tool: "budget",
        result,
        totalBudget: budgetAmount,
      });
      setBudgetAllocations(data.allocations);
      setBudgetState("done");
    } catch (e) {
      setBudgetState("error");
      console.error(e);
    }
  }

  async function runBrandVoice() {
    setBrandState("loading");
    try {
      const data = await callTool<{ voice: { tone: string; example: string }[]; summary: string; model: string }>({
        tool: "brand-voice",
        samples: brandSamples,
      });
      setBrandVoice(data);
      setBrandState("done");
    } catch (e) {
      setBrandState("error");
      console.error(e);
    }
  }

  async function runAbTest() {
    if (!abHookText.trim()) return;
    const ctr = abImpressions > 0 ? ((abClicks / abImpressions) * 100).toFixed(2) : "0";
    logAbTest(`hook-${Date.now()}`, abHookText, abVariant, abImpressions, abClicks);
    setAbTests(getAbTests());
    setAbHookText("");
    setAbVariant("A");
    setAbImpressions(0);
    setAbClicks(0);
  }

  const hookSelect = (
    <select
      value={improveHook.id}
      onChange={(e) => setImproveHook(sortedHooks.find((h) => h.id === e.target.value) || sortedHooks[0])}
      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40"
    >
      {sortedHooks.map((h) => (
        <option key={h.id} value={h.id}>
          {h.text} ({h.score})
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          AI tools — each runs on the live AI provider and adds zero cost to you.
        </div>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as UiLanguage)}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        >
          {([["en", "English"], ["es", "Español"], ["pt", "Português"], ["de", "Deutsch"], ["fr", "Français"], ["hi", "हिन्दी"], ["ja", "日本語"], ["ko", "한국어"], ["zh", "中文"], ["ar", "العربية"]] as [UiLanguage, string][]).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      {/* Improve + Explain */}
      <Section title="Improve a hook" icon="✨">
        {hookSelect}
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setImproveMode(m.id)}
              title={m.hint}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                improveMode === m.id
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={runImprove}
            disabled={improveState === "loading"}
            className="bg-gradient-brand ml-auto rounded-full px-4 py-1 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Rewrite
          </button>
        </div>
        {improveState === "loading" && <div className="mt-3"><Spinner /></div>}
        {improveState === "error" && <p className="mt-3 text-sm text-red-500">Improve failed — try again.</p>}
        {rewrites.length > 0 && (
          <div className="mt-4 space-y-3">
            {rewrites.map((r, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{r.text}</p>
                  <button
                    onClick={() => copy(r.text, `rw-${i}`)}
                    className="shrink-0 rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {copied === `rw-${i}` ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{r.psychology}</span>
                  {r.note && <span className="ml-2">{r.note}</span>}
                </p>
              </div>
            ))}
            {rewriteModel && <p className="text-xs text-zinc-400">via {rewriteModel}</p>}
          </div>
        )}
      </Section>

      <Section title="Why this hook works" icon="🔍">
        {hookSelect}
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runExplain}
            disabled={explainState === "loading"}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Explain it
          </button>
          {explainState === "loading" && <Spinner />}
        </div>
        {explainState === "error" && <p className="mt-3 text-sm text-red-500">Explain failed — try again.</p>}
        {explain && (
          <div className="mt-4 space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-violet-100 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                {explain.trigger}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                CTR {explain.ctrLift}
              </span>
            </div>
            <p className="text-sm">
              <span className="font-semibold">Who it lands with:</span> {explain.audience}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{explain.why}</p>
          </div>
        )}
      </Section>

      <Section title="Voice-of-customer mining" icon="🗣️">
        <p className="text-xs text-zinc-500">
          Paste real customer reviews, testimonials, or survey answers. The AI extracts their exact pain points,
          desires, and language, then writes hooks in their words.
        </p>
        <textarea
          value={reviews}
          onChange={(e) => setReviews(e.target.value)}
          rows={4}
          placeholder={"Example:\n\"I was so embarrassed the plumber had to fix what my DIY attempt broke.\"\n\"Finally a routine that takes 10 minutes — my skin has never looked better.\""}
          className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runVoc}
            disabled={vocState === "loading" || !reviews.trim()}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            Mine the voice
          </button>
          {vocState === "loading" && <Spinner />}
        </div>
        {vocState === "error" && <p className="mt-3 text-sm text-red-500">Mining failed — try again.</p>}
        {voc && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Pain points</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {voc.painPoints.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Desires</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {voc.desires.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Their exact words</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {voc.phrases.map((p) => (
                  <span key={p} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs italic text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    “{p}”
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hooks from customer language</p>
              <div className="mt-2 space-y-2">
                {voc.hooks.map((h) => (
                  <div key={h.text} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <p className="text-sm font-medium">{h.text}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{h.psychology}</span>
                      <button
                        onClick={() => copy(h.text, `voc-${h.text}`)}
                        className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        {copied === `voc-${h.text}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section title="Email series generator" icon="📧">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setEmailCount(n)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  emailCount === n
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {n} emails
              </button>
            ))}
          </div>
          <button
            onClick={runEmails}
            disabled={emailState === "loading"}
            className="bg-gradient-brand ml-auto rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Generate sequence
          </button>
        </div>
        {emailState === "loading" && <div className="mt-3"><Spinner /></div>}
        {emailState === "error" && <p className="mt-3 text-sm text-red-500">Sequence failed — try again.</p>}
        {emails.length > 0 && (
          <div className="mt-4 space-y-4">
            {emails.map((e, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Email {i + 1}</p>
                    <p className="mt-1 font-semibold">{e.subject}</p>
                    {e.preview && <p className="mt-0.5 text-xs text-zinc-500">{e.preview}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {e.goal && (
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                        {e.goal}
                      </span>
                    )}
                    <button
                      onClick={() => copy(e.body, `em-${i}`)}
                      className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {copied === `em-${i}` ? "Copied" : "Copy body"}
                    </button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{e.body}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Content calendar" icon="📅">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {[7, 14, 21].map((n) => (
              <button
                key={n}
                onClick={() => setDays(n)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  days === n
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
          <button
            onClick={runCalendar}
            disabled={calState === "loading"}
            className="bg-gradient-brand ml-auto rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Build calendar
          </button>
        </div>
        {calState === "loading" && <div className="mt-3"><Spinner /></div>}
        {calState === "error" && <p className="mt-3 text-sm text-red-500">Calendar failed — try again.</p>}
        {calendar.length > 0 && (
          <div className="mt-4 space-y-2">
            {calendar.map((d) => (
              <div key={d.day} className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="w-8 shrink-0 text-sm font-mono text-zinc-400">D{d.day}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.headline}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {d.platform} · {d.format} · <span className="text-indigo-500">{d.angle}</span>
                  </p>
                </div>
                <button
                  onClick={() => copy(d.headline, `cal-${d.day}`)}
                  className="shrink-0 rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {copied === `cal-${d.day}` ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="20 fresh angle ideas" icon="💡">
        <p className="text-xs text-zinc-500">
          A single brainstorm pass that avoids the psychology triggers your current hooks already use — great for
          variation testing beyond the first run.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["aida", "pas", "bab", "4ps"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAngleFormula(f)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                angleFormula === f
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runAngles}
            disabled={anglesState === "loading"}
            className="bg-gradient-brand ml-auto rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Brainstorm 20
          </button>
          {anglesState === "loading" && <Spinner />}
        </div>
        {anglesState === "error" && <p className="mt-3 text-sm text-red-500">Brainstorm failed — try again.</p>}
        {angles.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {angles.map((a, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="w-6 shrink-0 text-xs font-mono text-zinc-400">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="mt-0.5 text-xs text-indigo-500">{a.psychology}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ---- NEW FEATURES ---- */}

      <Section title="Landing page generator" icon="📄">
        <p className="text-xs text-zinc-500">
          Generate a full landing page structure from your analysis — hero, features, proof, and CTA sections.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runLanding}
            disabled={landingState === "loading"}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Generate landing page
          </button>
          {landingState === "loading" && <Spinner />}
        </div>
        {landingState === "error" && <p className="mt-3 text-sm text-red-500">Landing page generation failed — try again.</p>}
        {landingSections.length > 0 && (
          <div className="mt-4 space-y-3">
            {landingSections.map((s, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{s.section}</p>
                <p className="mt-1 font-semibold">{s.headline}</p>
                {s.subheadline && <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{s.subheadline}</p>}
                {s.body && <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{s.body}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{s.cta}</span>
                  <button onClick={() => copy(s.headline, `lp-${i}`)} className="text-xs text-zinc-400 hover:text-zinc-600">{copied === `lp-${i}` ? "Copied" : "Copy"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Audience persona builder" icon="👤">
        <p className="text-xs text-zinc-500">
          Generate detailed audience personas from your topic and audience description.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runPersona}
            disabled={personaState === "loading"}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Build personas
          </button>
          {personaState === "loading" && <Spinner />}
        </div>
        {personaState === "error" && <p className="mt-3 text-sm text-red-500">Persona builder failed — try again.</p>}
        {personas.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {personas.map((p, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="font-semibold">{p.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{p.demographics}</p>
                <div className="mt-3 space-y-2">
                  <div><p className="text-xs font-semibold text-red-500">Pain points</p><ul className="mt-1 list-disc list-inside text-xs space-y-1">{p.painPoints.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className="text-xs font-semibold text-emerald-500">Desires</p><ul className="mt-1 list-disc list-inside text-xs space-y-1">{p.desires.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className="text-xs font-semibold text-amber-500">Objections</p><ul className="mt-1 list-disc list-inside text-xs space-y-1">{p.objections.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className="text-xs font-semibold text-violet-500">Triggers</p><ul className="mt-1 list-disc list-inside text-xs space-y-1">{p.triggers.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
                {p.message && <p className="mt-3 text-xs italic text-zinc-500">"{p.message}"</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="SEO metadata generator" icon="🔍">
        <p className="text-xs text-zinc-500">
          Auto-generate SEO title, description, OG tags, and keywords from your best hook.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runSeo}
            disabled={seoState === "loading"}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Generate SEO tags
          </button>
          {seoState === "loading" && <Spinner />}
        </div>
        {seoState === "error" && <p className="mt-3 text-sm text-red-500">SEO generation failed — try again.</p>}
        {seoMeta && (
          <div className="mt-4 space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Title tag</p><p className="mt-1 text-sm font-medium">{seoMeta.title}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Meta description</p><p className="mt-1 text-sm">{seoMeta.description}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">OG title</p><p className="mt-1 text-sm">{seoMeta.ogTitle}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">OG description</p><p className="mt-1 text-sm">{seoMeta.ogDescription}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Keywords</p><div className="mt-1 flex flex-wrap gap-2">{seoMeta.keywords.map((k) => <span key={k} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{k}</span>)}</div></div>
          </div>
        )}
      </Section>

      <Section title="Budget allocator" icon="💰">
        <p className="text-xs text-zinc-500">
          Allocate your campaign budget across channels based on your audience and goal.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-xs text-zinc-500">Budget:</label>
          <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(Number(e.target.value) || 100)} className="w-20 rounded-xl border border-zinc-300 bg-white px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40" />
          <button
            onClick={runBudget}
            disabled={budgetState === "loading"}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            Allocate
          </button>
          {budgetState === "loading" && <Spinner />}
        </div>
        {budgetState === "error" && <p className="mt-3 text-sm text-red-500">Budget allocation failed — try again.</p>}
        {budgetAllocations.length > 0 && (
          <div className="mt-4 space-y-2">
            {budgetAllocations.map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="w-16 shrink-0 text-xs font-semibold text-indigo-500">{a.channel}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${a.percent}%` }} /></div>
                  <p className="mt-1 text-xs text-zinc-500">{a.rationale}</p>
                </div>
                <span className="shrink-0 text-xs font-mono text-zinc-400">{a.percent}% · {a.estimatedCpc}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Brand voice trainer" icon="🎙️">
        <p className="text-xs text-zinc-500">
          Paste 3-5 brand voice samples (e.g. "We cut the busywork so teams ship faster.") and the AI extracts your tone attributes.
        </p>
        <textarea
          value={brandSamples}
          onChange={(e) => setBrandSamples(e.target.value)}
          rows={3}
          placeholder="We cut the busywork so teams ship faster. Practical skills, zero fluff, real projects. Send once, sell on autopilot."
          className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runBrandVoice}
            disabled={brandState === "loading" || !brandSamples.trim()}
            className="bg-gradient-brand rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            Train brand voice
          </button>
          {brandState === "loading" && <Spinner />}
        </div>
        {brandState === "error" && <p className="mt-3 text-sm text-red-500">Brand voice training failed — try again.</p>}
        {brandVoice && brandVoice.voice.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm italic text-zinc-600 dark:text-zinc-300">"{brandVoice.summary}"</p>
            <div className="flex flex-wrap gap-2">
              {brandVoice.voice.map((v, i) => (
                <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">{v.tone}</span>
                  <p className="mt-2 text-xs italic text-zinc-500">"{v.example}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Platform export" icon="📤">
        <p className="text-xs text-zinc-500">
          Export your hooks and ad copy in platform-ready formats.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["google-ads", "meta", "mailchimp", "linkedin"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                const exports = exportForPlatform(result, p);
                setExportData(exports);
                setExportPlatform(p);
              }}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {p === "google-ads" ? "Google Ads" : p === "meta" ? "Meta/Facebook" : p === "mailchimp" ? "Mailchimp" : "LinkedIn"}
            </button>
          ))}
        </div>
        {exportData.length > 0 && (
          <div className="mt-4 space-y-2">
            {exportData.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-zinc-500">{e.field}</span>
                  <p className="text-sm font-medium truncate">{e.value}</p>
                </div>
                <button onClick={() => copy(e.value, `exp-${i}`)} className="shrink-0 rounded-md border border-zinc-300 px-2 py-0.5 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  {copied === `exp-${i}` ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="A/B test tracker" icon="⚗️">
        <p className="text-xs text-zinc-500">
          Log real campaign performance for your hooks and track which ones actually win.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-500">Hook text</label>
            <input type="text" value={abHookText} onChange={(e) => setAbHookText(e.target.value)} placeholder="Paste your hook..." className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Variant</label>
            <input type="text" value={abVariant} onChange={(e) => setAbVariant(e.target.value)} placeholder="A or B" className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Impressions</label>
            <input type="number" value={abImpressions} onChange={(e) => setAbImpressions(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Clicks</label>
            <input type="number" value={abClicks} onChange={(e) => setAbClicks(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40" />
          </div>
        </div>
        <button onClick={runAbTest} className="bg-gradient-brand mt-3 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110">Log test result</button>
        {abTests.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Recent tests ({abTests.length})</p>
              <button onClick={() => { clearAbTests(); setAbTests([]); }} className="text-xs text-zinc-400 hover:text-rose-500">Clear all</button>
            </div>
            {abTests.slice(-10).reverse().map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="flex-1 text-sm truncate">{t.hookText}</span>
                <span className="text-xs font-mono text-emerald-500">{t.ctr}% CTR</span>
                <span className="text-xs text-zinc-400">{t.impressions} imp · {t.clicks} clicks</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Character counter & readability" icon="📏">
        <p className="text-xs text-zinc-500">
          Check hook length and readability score for your target audience.
        </p>
        <textarea
          value={readabilityText}
          onChange={(e) => setReadabilityText(e.target.value)}
          rows={2}
          placeholder="Paste a hook or headline to check..."
          className="mt-3 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900/40"
        />
        {readabilityText.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Characters</p>
              <p className="text-xl font-bold">{characterCount(readabilityText)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Words</p>
              <p className="text-xl font-bold">{readabilityText.split(/\s+/).filter(Boolean).length}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Readability</p>
              <p className="text-xl font-bold">{fleschKincaid(readabilityText).toFixed(1)}</p>
              <p className="text-xs text-zinc-500">{readabilityLabel(fleschKincaid(readabilityText))}</p>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
