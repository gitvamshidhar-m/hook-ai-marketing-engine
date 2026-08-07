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

// ── EDIT ME: your name and contact for the "built by" sections ─────────────
const AUTHOR = {
  name: "M. Vamshidhar Reddy",
  tagline: "Digital marketer who builds — SEO, A/B testing, email automation, and the tools that run them.",
  role: "Digital Marketer · Growth",
  email: "geovamshidhar@gmail.com",
  phone: "+91-7981719085",
  linkedin: "https://www.linkedin.com/in/vamshidharreddym",
  github: "https://github.com/gitvamshidhar-m",
};
// ─────────────────────────────────────────────────────────────────────────────

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type Counts = { hooks: number; campaigns: number; signups: number; leads: number };
type AbRow = { variant: string; views: number; clicks: number; ctr: number };

async function liveCounts(): Promise<Counts> {
  const empty: Counts = { hooks: 0, campaigns: 0, signups: 0, leads: 0 };
  if (!URL || !KEY) return empty;
  try {
    const [h, c, s, l] = await Promise.all([
      fetch(`${URL}/rest/v1/community_hooks?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/hook_ai_stats?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/profiles?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, next: { revalidate: 300 },
      }),
      fetch(`${URL}/rest/v1/captures?select=id&head=true&count=exact`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, next: { revalidate: 300 },
      }),
    ]);
    const parse = (r: Response) => Number((r.headers.get("content-range") || "/0").split("/")[1] || 0);
    return { hooks: parse(h), campaigns: parse(c), signups: parse(s), leads: parse(l) };
  } catch {
    return empty;
  }
}

// Pulls the live hero headline A/B test straight from the growth dashboard.
async function liveAbTest(): Promise<AbRow[]> {
  try {
    const res = await fetch(`https://hook-ai-marketing-engine.vercel.app/api/growth`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.ab) ? json.ab : [];
  } catch {
    return [];
  }
}

const LEVERS = [
  { icon: "🌱", title: "Organic SEO", desc: "32 blog posts, niche tool pages, a learning hub, and a trends page — linked in topic silos so they rank together.", href: "/seo" },
  { icon: "🧪", title: "Conversion & A/B", desc: "A real hero headline A/B test with click-through and significance, plus an exit-intent lead form.", href: "/growth" },
  { icon: "✉️", title: "Email automation", desc: "5 scheduled lifecycle flows — nurture, re-engage, low-credit, weekly report, and hook-of-the-day.", href: "/community" },
  { icon: "📊", title: "Measurement", desc: "A live funnel and analytics dashboard so every channel is measured in one view.", href: "/analytics" },
];

const DID = [
  "Named the niche, wrote every piece, and structured the site for long-tail SEO",
  "Ran a production hero headline A/B test and shipped the winner",
  "Built exit-intent + email-capture flows that feed a nurture list",
  "Wired 5 scheduled lifecycle emails and a referral loop",
  "Designed a live funnel + analytics dashboard for measurement",
  "Shipped end-to-end: auth, payments, rate limits, monitoring",
];

const TECH = ["Next.js 16", "React 19", "TypeScript", "Tailwind", "Supabase", "Razorpay", "Groq/Gemini AI", "Vercel"];

const TIMELINE = [
  { date: "Jan 2026", note: "Core engine live: CTR-scored hooks + the tool that makes it" },
  { date: "Mar 2026", note: "Accounts, credits, referrals, saved projects" },
  { date: "May 2026", note: "Analytics, admin, shareable campaigns, monitoring" },
  { date: "Jul 2026", note: "SEO system: blogs, niche tools, /learn hub, /trends" },
  { date: "Aug 2026", note: "A/B hero, exit-intent, email flows, growth dashboard" },
];

const BLOG_PICKS = [
  { slug: "psychology-of-high-converting-headlines", label: "The psychology of high-converting headlines" },
  { slug: "real-estate-hooks-that-stop-the-scroll", label: "Real-estate hooks that stop the scroll" },
  { slug: "b2b-sales-outreach-hooks-that-get-replies", label: "B2B sales outreach hooks that get replies" },
];

const FEATURES = [
  { icon: "🔍", title: "SEO system", desc: "32 blog posts, 15+ tool pages, /learn hub, /trends page — all in the sitemap." },
  { icon: "🗂️", title: "Niche tool pages", desc: "Real-estate, SaaS, fitness, insurance, local, wedding, pet, accounting, photography, career generators." },
  { icon: "🧪", title: "A/B testing", desc: "Hero headline A/B with CTR and significance; A/B tracker inside the tools." },
  { icon: "✉️", title: "Email flows", desc: "5 scheduled campaigns: nurture, re-engage, low-credit, weekly digest, hook-of-the-day." },
  { icon: "📋", title: "Community feed", desc: "/community shows top hooks generated by real users, filterable and copyable." },
  { icon: "🌤️", title: "Trends page", desc: "/trends — when each niche peaks and which angle wins that window." },
  { icon: "🧩", title: "Chrome extension", desc: "Right-click any text → generate a hook for it, prefilled via deep link." },
  { icon: "🎯", title: "Exit-intent capture", desc: "Lead popup that feeds the email list and nurture flow." },
  { icon: "📑", title: "Structured data", desc: "Sitemap, canonical URLs, FAQ/HowTo JSON-LD for rich results." },
  { icon: "⚙️", title: "Campaign Studio", desc: "One click: hooks, health score, budget split, channel strategy, calendar, KPIs." },
  { icon: "💳", title: "Payments & accounts", desc: "Auth, credits, Razorpay top-ups, referrals, saved projects." },
  { icon: "📊", title: "Analytics", desc: "/analytics and /growth dashboards measure every channel." },
];

const PACK = [
  { title: "Case study", href: "https://github.com/gitvamshidhar-m/hook-ai-marketing-engine/blob/master/docs/portfolio/CASE-STUDY.md", note: "The marketing-pitched narrative with metric placeholders." },
  { title: "Resume bullets", href: "https://github.com/gitvamshidhar-m/hook-ai-marketing-engine/blob/master/docs/portfolio/RESUME-BULLETS.md", note: "Copy-paste bullets, LinkedIn headline, and STAR stories." },
  { title: "Acquisition playbook", href: "https://github.com/gitvamshidhar-m/hook-ai-marketing-engine/blob/master/docs/portfolio/USER-ACQUISITION-PLAYBOOK.md", note: "The 2–3 week plan to get real users and proof." },
  { title: "Launch posts", href: "https://github.com/gitvamshidhar-m/hook-ai-marketing-engine/blob/master/docs/portfolio/LAUNCH-POSTS.md", note: "Ready-to-paste Reddit, X, LinkedIn, and Indie Hackers posts." },
];

export default async function AboutPage() {
  const [counts, ab] = await Promise.all([liveCounts(), liveAbTest()]);

  const stats = [
    { label: "hooks generated", n: counts.hooks },
    { label: "campaign runs", n: counts.campaigns },
    { label: "accounts", n: counts.signups },
    { label: "leads captured", n: counts.leads },
  ];

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

      {/* Founder-voice intro */}
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Why I built it</h2>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          I&apos;m <span className="font-semibold text-zinc-900 dark:text-zinc-100">{AUTHOR.name}</span>, a
          digital marketer who wanted a funnel I could see working start to finish. Most marketing
          happens in tools that don&apos;t talk to each other.
        </p>
        <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
          So I built a product that <em>is</em> a funnel: it ranks in search, tests and converts, sends
          the right follow-up emails, and measures every step — and I made the whole thing measurable,
          live, on this very site.
        </p>
      </section>

      {/* Live stats */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 py-12 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight">Live product, live numbers</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold">{s.n.toLocaleString()}+</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live A/B widget */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight">A test I&apos;m actually running</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Two versions of the homepage headline are live. Every view and click is counted.
        </p>
        <div className="card-elevated mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {ab.length === 0 ? (
            <p className="text-sm text-zinc-400">No test data yet — check back after traffic.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ab.map((r) => {
                const leading = ab.length === 2 && r.views > 0 && r.ctr > ab[1 - ab.indexOf(r)].ctr;
                return (
                  <div key={r.variant} className={`rounded-xl border p-4 ${r.variant === "A" ? "border-indigo-200 dark:border-indigo-800" : "border-fuchsia-200 dark:border-fuchsia-900"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Variant {r.variant}</p>
                      {leading && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Leading</span>}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-lg font-bold">{r.views}</p><p className="text-xs text-zinc-400">views</p></div>
                      <div><p className="text-lg font-bold">{r.clicks}</p><p className="text-xs text-zinc-400">clicks</p></div>
                      <div><p className="text-lg font-bold text-indigo-500">{r.ctr}%</p><p className="text-xs text-zinc-400">CTR</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-4 text-center text-xs text-zinc-400">
            Full funnel + A/B details on <Link href="/growth" className="text-indigo-500 hover:underline">/growth</Link>.
          </p>
        </div>
      </section>

      {/* The four growth levers */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {LEVERS.map((l) => (
            <Link key={l.title} href={l.href} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950">{l.icon}</span>
              <h3 className="mt-4 font-semibold">{l.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* What I did / tech */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 py-12 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">What I did</h2>
            <ul className="mt-4 space-y-2.5">
              {DID.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Going everywhere</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {TECH.map((t) => (
                <span key={t} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">{t}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Live on <a href={AUTHOR.github} className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>, deployed to Vercel, data in Supabase — the whole thing runs on free tiers.
            </p>
          </div>
        </div>
      </section>

      {/* Everything I built */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Everything I built</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
            The full system, end to end — from SEO to payments to analytics.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950">{f.icon}</span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio pack */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 py-12 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight">Portfolio pack</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-500">
            Deep dives for anyone who wants the full story behind this project.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PACK.map((p) => (
              <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{p.note}</p>
                <p className="mt-2 text-xs font-medium text-indigo-500">Open on GitHub →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Reading picks */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight">Where I think in public</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {BLOG_PICKS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <p className="text-sm font-semibold leading-snug">{p.label}</p>
              <p className="mt-2 text-xs text-indigo-500">Read →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 py-12 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight">Built in public</h2>
          <div className="mt-6 space-y-3">
            {TIMELINE.map((t) => (
              <div key={t.date} className="card-elevated flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{t.date}</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / hire */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card-elevated rounded-2xl border border-indigo-200 bg-gradient-soft p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-2xl font-bold tracking-tight">Hire me</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            I build and grow digital products. If you need SEO that compounds, emails that convert, or
            a team that measures what it ships — let&apos;s talk.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${AUTHOR.email}`} className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110">
              Email me
            </a>
            <a href={`tel:${AUTHOR.phone.replace(/\D/g, "")}`} className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              {AUTHOR.phone}
            </a>
            <a href={AUTHOR.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              LinkedIn
            </a>
            <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}