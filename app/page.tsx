import Link from "next/link";
import HookTool from "@/components/HookTool";

const FEATURES = [
  {
    title: "AI-Generated Hooks",
    desc: "Groq, NVIDIA, and Gemini back the engine — live AI headlines with psychology scores, not canned templates.",
    icon: "🤖",
    grad: "from-indigo-500 to-blue-500",
  },
  {
    title: "10 Psychological Angles",
    desc: "Curiosity, loss aversion, social proof, contrarian, data-backed — the engine maps your topic to the triggers that actually get opened.",
    icon: "🧠",
    grad: "from-violet-500 to-purple-500",
  },
  {
    title: "CTR Prediction Score",
    desc: "Every headline gets a 0–100 score and the psychology behind it, so you A/B test with judgment, not guesses.",
    icon: "🎯",
    grad: "from-rose-500 to-pink-500",
  },
  {
    title: "Competitor Gap Scanner",
    desc: "Paste your competitor's headlines and it finds the angles they're all missing — your blue-ocean openings.",
    icon: "🧭",
    grad: "from-amber-500 to-orange-500",
  },
  {
    title: "Performance Marketing Plan",
    desc: "Budget projection, funnel map, platform policy checks, and a testing plan — turn one run into a full campaign.",
    icon: "📈",
    grad: "from-emerald-500 to-teal-500",
  },
  {
    title: "Channel-Native Hooks",
    desc: "Ad headlines, email subject lines, YouTube titles, and blog H1s — formatted for where they'll actually run.",
    icon: "📣",
    grad: "from-sky-500 to-cyan-500",
  },
  {
    title: "Saved Campaigns + Templates",
    desc: "One-click starter templates and a campaign vault that syncs to your account — pick up where you left off.",
    icon: "🗂️",
    grad: "from-fuchsia-500 to-pink-500",
  },
  {
    title: "A/B Test Tracker",
    desc: "Pick winners between hooks; the tracker learns which psychology wins so future runs lean your proven direction.",
    icon: "⚔️",
    grad: "from-red-500 to-rose-500",
  },
  {
    title: "USP Framer",
    desc: "Turns a vague product description into a positioning statement and elevator pitch you can steal verbatim.",
    icon: "💎",
    grad: "from-indigo-500 to-violet-500",
  },
  {
    title: "Ad Copy Builder",
    desc: "One click turns your top hooks into a complete paste-ready ad with headline, body, and CTA.",
    icon: "📝",
    grad: "from-blue-500 to-indigo-500",
  },
  {
    title: "Share-to-Earn Referrals",
    desc: "Share your results and earn bonus runs every day — every friend who joins gives you more free runs.",
    icon: "🔗",
    grad: "from-teal-500 to-emerald-500",
  },
  {
    title: "Seasonality + Demand Signals",
    desc: "The engine watches search demand and seasonal timing so your hooks land when your audience is looking.",
    icon: "🌤️",
    grad: "from-orange-500 to-amber-500",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Pick a template or describe your topic",
    d: "One sentence — or start from a ready-made niche template.",
  },
  {
    n: "02",
    t: "Paste competitor hooks",
    d: "Optional, but powers the gap scan and blue-ocean angles.",
  },
  {
    n: "03",
    t: "Get scored hooks + a campaign plan",
    d: "Angles, headlines, scores, ad copy, and a growth plan in seconds.",
  },
];

const MOCK_HOOKS = [
  { text: "Ship projects 3x faster without meetings", score: 92, psych: "Outcome" },
  { text: "Your team is silently burning out on Zoom", score: 87, psych: "Empathy" },
  { text: "Stop losing 10 hours a week to status calls", score: 84, psych: "Loss aversion" },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(99,102,241,0.18),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:pt-24">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            Free · AI-powered · No signup
          </span>
          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl [animation-delay:80ms]">
            Stop writing headlines.
            <br />
            <span className="text-gradient">Start winning angles.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 [animation-delay:160ms]">
            Hook AI is the angle-discovery engine for digital marketers. It finds the psychological triggers your
            competitors are ignoring, scores every hook, drafts your ad copy, and plans your campaign — all in one shot.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
            <Link
              href="#tool"
              className="bg-gradient-brand rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Try the tool free
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
            >
              See how it works
            </a>
          </div>
          <p className="animate-fade-up mt-6 text-xs text-zinc-500 [animation-delay:320ms]">
            0 signups · 0 credit cards · runs on free hosting + free AI tiers
          </p>

          {/* Product mockup preview */}
          <div className="animate-fade-up relative mx-auto mt-16 max-w-4xl [animation-delay:400ms]">
            <div className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 bg-gradient-brand opacity-20 blur-3xl" aria-hidden />
            <div className="card-elevated relative overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-zinc-400">hook-ai · best hook results</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="bg-gradient-brand rounded-xl p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                    Best hook · predicted score 92/100
                  </p>
                  <p className="mt-1 font-semibold sm:text-lg">Ship projects 3x faster without meetings</p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {MOCK_HOOKS.map((h, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <p className="text-xs font-medium leading-snug">{h.text}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">{h.psych}</span>
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {h.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="animate-float absolute -right-4 -top-6 hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:block">
              <p className="text-[10px] font-semibold text-zinc-400">CTR prediction</p>
              <p className="text-xl font-bold text-emerald-500">+42%</p>
            </div>
            <div className="animate-float absolute -left-6 -bottom-6 hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:block [animation-delay:1.5s]">
              <p className="text-[10px] font-semibold text-zinc-400">Gap found</p>
              <p className="text-sm font-semibold text-indigo-500">Contrarian angle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tool */}
      <section id="tool" className="scroll-mt-6">
        <HookTool />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything in one place</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            One analysis. Twelve ways to win. From the angle to the ad copy to the growth plan.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group card-elevated relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.grad} opacity-[0.08] blur-2xl transition duration-300 group-hover:opacity-20`}
                aria-hidden
              />
              <div
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.grad} text-lg text-white shadow-md`}
              >
                <span aria-hidden>{f.icon}</span>
              </div>
              <h3 className="relative mt-4 font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps to your next campaign</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="card-elevated relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-gradient font-mono text-3xl font-bold">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{s.d}</p>
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
