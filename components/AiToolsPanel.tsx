"use client";

import { useState } from "react";
import type { AnalyzeResult, Hook, ImproveMode } from "@/lib/types";

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
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="flex items-center gap-2 font-semibold">
        <span>{icon}</span> {title}
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
  const [copied, setCopied] = useState("");

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
      });
      setAngles(data.angles);
      setAnglesState("done");
    } catch (e) {
      setAnglesState("error");
      console.error(e);
    }
  }

  const hookSelect = (
    <select
      value={improveHook.id}
      onChange={(e) => setImproveHook(sortedHooks.find((h) => h.id === e.target.value) || sortedHooks[0])}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      {sortedHooks.map((h) => (
        <option key={h.id} value={h.id}>
          {h.text} ({h.score})
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        AI tools — each runs on the live AI provider and adds zero cost to you.
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
            className="ml-auto rounded-full bg-zinc-900 px-4 py-1 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
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
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
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
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runVoc}
            disabled={vocState === "loading" || !reviews.trim()}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
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
            className="ml-auto rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
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
            className="ml-auto rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
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
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runAngles}
            disabled={anglesState === "loading"}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
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
    </div>
  );
}
