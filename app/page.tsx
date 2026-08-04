import Link from "next/link";
import HookTool from "@/components/HookTool";

const FEATURES = [
  {
    title: "10 Psychological Angles",
    desc: "Curiosity, loss aversion, social proof, contrarian, data-backed — the engine maps your topic to the triggers that actually get opened.",
    icon: "🧠",
  },
  {
    title: "CTR Prediction Score",
    desc: "Every headline gets a 0–100 score and the psychology behind it, so you A/B test with judgment, not guesses.",
    icon: "🎯",
  },
  {
    title: "Competitor Gap Scanner",
    desc: "Paste your competitor's headlines and it finds the angles they're all missing — your blue-ocean openings.",
    icon: "🧭",
  },
  {
    title: "Angle Coverage Meter",
    desc: "Live heatmap of the 10 psychological angles — see where your campaign is concentrated and where you're free to play.",
    icon: "📊",
  },
  {
    title: "Channel-Native Hooks",
    desc: "Ad headlines, email subject lines, YouTube titles, and blog H1s — formatted for where they'll actually run.",
    icon: "📣",
  },
  {
    title: "A/B Test Tracker",
    desc: "Pick winners between hooks; the tracker learns which psychology wins so future runs lean your proven direction.",
    icon: "⚔️",
  },
  {
    title: "USP Framer",
    desc: "Turns a vague product description into a positioning statement and elevator pitch you can steal verbatim.",
    icon: "💎",
  },
  {
    title: "Shareable Results",
    desc: "One click compresses your whole campaign into a shareable link — send it to a client or teammate.",
    icon: "🔗",
  },
];

const STEPS = [
  { n: "01", t: "Describe your topic", d: "One sentence — that's all it needs." },
  { n: "02", t: "Paste competitor hooks", d: "Optional, but powers the gap scan." },
  { n: "03", t: "Get scored hooks", d: "Angles, headlines, scores, and a USP in seconds." },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            Free · AI-powered · No signup
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Stop writing headlines.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Start winning angles.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Hook AI is the angle-discovery engine for digital marketers. It finds the psychological triggers your
            competitors are ignoring, scores every hook, and hands you a positioning statement — all in one shot.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#tool"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Try the tool
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            0 signups · 0 credit cards · runs on free hosting + free AI tiers
          </p>
        </div>
      </section>

      {/* Tool */}
      <section id="tool" className="scroll-mt-6">
        <HookTool />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Everything in one place</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">Three steps to your next campaign</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="font-mono text-sm text-indigo-500">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        Hook AI — built with Next.js, hosted free, powered by free AI tiers.
      </footer>
    </main>
  );
}
