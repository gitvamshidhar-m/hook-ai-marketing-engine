import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seasonality & Demand Signals by Niche · Hook AI",
  description:
    "When does each niche's demand peak? A seasonal playbook for ads, email, and content — so your hooks land when buyers are already looking.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/trends" },
  openGraph: {
    title: "Seasonality & Demand Signals by Niche · Hook AI",
    description: "A seasonal marketing playbook: when each niche peaks and which angle to run.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/trends",
    siteName: "Hook AI",
  },
};

type NicheTrend = {
  niche: string;
  peak: string[];
  angle: string;
  why: string;
  toolSlug: string;
};

const TRENDS: NicheTrend[] = [
  {
    niche: "Real estate",
    peak: ["Jan–Feb", "Apr–Jun"],
    angle: "Timing & proof",
    why: "New-year resolutions and spring moving season. Sellers are listing, buyers are pre-approved.",
    toolSlug: "real-estate-hook-generator",
  },
  {
    niche: "SaaS / B2B",
    peak: ["Jan", "Sep–Oct"],
    angle: "Time-saved & friction",
    why: "Budget refresh cycles and post-vacation buying. Lead with the metric you save.",
    toolSlug: "saas-marketing-hooks-generator",
  },
  {
    niche: "Fitness coaching",
    peak: ["Jan–Mar", "Sep"],
    angle: "Transformation",
    why: "New Year's, then back-to-school structure. Promise outcomes, keep them reachable.",
    toolSlug: "fitness-coach-hook-generator",
  },
  {
    niche: "Insurance",
    peak: ["Nov–Feb", "Tax season (Feb–Apr)"],
    angle: "Speed & proof",
    why: "Policy reviews cluster around year-start and life changes. Estimate, don't guarantee.",
    toolSlug: "insurance-marketing-hook-generator",
  },
  {
    niche: "Local services",
    peak: ["Weather-dependent"],
    angle: "Intent & urgency",
    why: "Heatwaves, storms, and school terms drive 'near me' searches. Match the hook to the moment.",
    toolSlug: "local-seo-hook-generator",
  },
  {
    niche: "Weddings & events",
    peak: ["Jan", "Jul–Oct"],
    angle: "Moment + deadline",
    why: "Engagement season and wedding fair season. Sell the date, not just the service.",
    toolSlug: "wedding-and-event-hook-generator",
  },
  {
    niche: "Pet care",
    peak: ["May–Sep", "Holidays"],
    angle: "Owner trust",
    why: "Travel season means boarding and sitting. Holidays mean grooming. Warm + proof wins.",
    toolSlug: "pet-care-hook-generator",
  },
  {
    niche: "Accounting & tax",
    peak: ["Jan–Apr"],
    angle: "Deadline urgency",
    why: "Tax season is a fixed calendar. Urgency is honest here — use it before it spikes.",
    toolSlug: "accounting-hook-generator",
  },
  {
    niche: "Photography",
    peak: ["Apr–Jun", "Sep–Nov"],
    angle: "Memory & niche",
    why: "Wedding, family, and holiday-session booking windows. Own the 'good enough phone photo' pain.",
    toolSlug: "photography-hook-generator",
  },
  {
    niche: "Career coaching",
    peak: ["Jan", "Jun–Sep"],
    angle: "Identity & salary",
    why: "New-year goals and hiring-season prep. Sell the raise and the role, not the resume.",
    toolSlug: "career-coaching-hook-generator",
  },
];

export default function TrendsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-700 dark:text-zinc-300">Seasonality & demand</span>
        </nav>

        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
            Demand signals
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">When each niche peaks</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500">
            Demand is seasonal. This playbook shows the months buyers are already looking in each
            niche, the angle that wins in that window, and the free tool to generate the hook.
            The same signals are baked into every Campaign Plan you generate.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TRENDS.map((t) => (
            <Link
              key={t.niche}
              href={`/tools/${t.toolSlug}`}
              className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold">{t.niche}</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {t.angle}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">Peak: {t.peak.join(" · ")}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t.why}</p>
              <p className="mt-3 text-xs font-medium text-indigo-500">Open the {t.niche} hook generator →</p>
            </Link>
          ))}
        </div>

        <section className="card-elevated mt-10 rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-lg font-bold">How demand flows into your campaigns</h2>
          <div className="mt-3 grid gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">1. Timing</p>
              <p className="mt-1">Peak-month framing moves CTR because the search intent is already hot.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">2. Angle</p>
              <p className="mt-1">Each window rewards one angle — urgency in tax season, proof in moving season.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">3. Delivery</p>
              <p className="mt-1">Every Campaign Plan includes a demand signal with peak months for your topic.</p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Seasonal demand is directional guidance, not a guarantee. Test hooks in your own market before scaling.
        </p>
      </div>
    </main>
  );
}
