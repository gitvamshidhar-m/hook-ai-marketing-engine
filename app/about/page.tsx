import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Hook AI, the angle-discovery engine",
  description:
    "Hook AI is a live AI growth-marketing system: SEO content, A/B testing, email automation, and analytics in one product. This page tells the story behind it.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/about" },
  openGraph: {
    title: "About Hook AI · an AI growth engine that markets itself",
    description: "SEO, conversion, email automation, and analytics in one live product.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/about",
    siteName: "Hook AI",
  },
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type Counts = { hooks: number; campaigns: number; signups: number; leads: number };

async function liveCounts(): Promise<Counts> {
  const empty: Counts = { hooks: 0, campaigns: 0, signups: 0, leads: 0 };
  if (!URL || !KEY) return empty;
  try {
    const [h, c, s, l] = await Promise.all([
      fetch(`${URL}/rest/v1/community_hooks?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/hook_ai_stats?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/profiles?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/captures?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        next: { revalidate: 300 },
      }),
    ]);
    const parse = (r: Response) => Number((r.headers.get("content-range") || "/0").split("/")[1] || 0);
    return { hooks: parse(h), campaigns: parse(c), signups: parse(s), leads: parse(l) };
  } catch {
    return empty;
  }
}

const LEVERS = [
  { icon: "🌱", title: "Organic SEO", desc: "32 blog posts, niche tool pages, a learning hub, and a trends page — linked in topic silos so they rank together.", href: "/seo" },
  { icon: "🧪", title: "Conversion & A/B", desc: "A real hero headline A/B test with click-through and significance, plus an exit-intent lead form.", href: "/growth" },
  { icon: "✉️", title: "Email automation", desc: "5 scheduled lifecycle flows — nurture, re-engage, low-credit, weekly report, and hook-of-the-day.", href: "/community" },
  { icon: "📊", title: "Measurement", desc: "A live funnel and analytics dashboard so every channel is measured in one view.", href: "/analytics" },
];

export default async function AboutPage() {
  const counts = await liveCounts();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
            About · the story
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            An AI growth engine
            <br />
            <span className="text-gradient">that markets itself.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Hook AI turns one sentence into a full marketing campaign — CTR-scored ideas across ads,
            email, YouTube, and blog. And this site itself is the demo: SEO content, an A/B test, lead
            capture, email automations, and analytics all run live in public.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/#tool" className="bg-gradient-brand rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110">
              Try the generator
            </Link>
            <Link href="/growth" className="rounded-xl border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60">
              See the live dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "hooks generated", n: counts.hooks },
            { label: "campaign runs", n: counts.campaigns },
            { label: "accounts", n: counts.signups },
            { label: "leads captured", n: counts.leads },
          ].map((s) => (
            <div key={s.label} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-bold">{s.n.toLocaleString()}+</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {LEVERS.map((l) => (
            <Link key={l.title} href={l.href} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950">{l.icon}</span>
              <h2 className="mt-4 font-semibold">{l.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Built like a real product</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Accounts and credits, payments, referrals, rate limiting, monitoring, and shipping cost
                leverage. This isn&apos;a mockup — it&apos;s a working system on free tiers (Vercel +
                Supabase) so operating cost stays near zero.
              </p>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                The point of the platform is a marketing funnel in one repo: research, strategy,
                content, launch, analytics, and optimization — measured live on{" "}
                <Link href="/growth" className="font-medium text-indigo-500 hover:underline">/growth</Link>.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Explore the system</h2>
              <div className="mt-4 grid gap-2 text-sm">
                {[
                  { label: "SEO hub", href: "/seo" },
                  { label: "Free tools", href: "/tools" },
                  { label: "Niche templates", href: "/templates" },
                  { label: "Top hooks board", href: "/community" },
                  { label: "Seasonality & trends", href: "/trends" },
                  { label: "The blog", href: "/blog" },
                  { label: "Growth & A/B dashboard", href: "/growth" },
                  { label: "Analytics", href: "/analytics" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card-elevated rounded-2xl border border-indigo-200 bg-gradient-soft p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-2xl font-bold tracking-tight">Try it yourself</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Type a sentence about your product and watch it turn into scored, CTR-ranked campaign
            ideas across every channel.
          </p>
          <Link href="/#tool" className="bg-gradient-brand mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110">
            Generate your first angle
          </Link>
        </div>
      </section>
    </main>
  );
}