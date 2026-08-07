import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/seo/tools";
import { templates } from "@/lib/seo/templates";
import { blogPosts } from "@/lib/seo/blog";
import { CHANNEL_LABELS, type Channel } from "@/lib/types";

export const metadata: Metadata = {
  title: "Learn to write hooks that convert · Hook AI",
  description:
    "A free playbook for writing CTR-driven ad headlines, email subjects, YouTube titles, and blog H1s — with live generators and niche examples ranked by predicted performance.",
  alternates: {
    canonical: "https://hook-ai-marketing-engine.vercel.app/learn",
  },
};

export default async function LearnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Learn to write hooks that convert",
    url: "https://hook-ai-marketing-engine.vercel.app/learn",
    description:
      "Free guides, tools, and niche templates for writing ad headlines, email subjects, YouTube titles, and blog H1s.",
  };

  const byChannel: Partial<Record<Channel, typeof tools>> = {};
  for (const t of tools) {
    byChannel[t.channel] ||= [];
    byChannel[t.channel]!.push(t);
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav className="mb-6 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-700 dark:text-zinc-300">Learn</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn to write hooks that convert</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          One free playbook for the marketing copy that actually gets opened. Start with the psychology, then use a
          free generator for your niche — every tool ranks, scores, and explains the hook so you learn as you go.
        </p>

        {/* Channels → tools */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">By channel</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {(Object.keys(byChannel) as Channel[]).map((ch) => (
              <div key={ch} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-semibold text-lg">{CHANNEL_LABELS[ch]}</h3>
                <p className="mt-1 text-xs text-zinc-500">Free {CHANNEL_LABELS[ch].toLowerCase()} generator</p>
                <div className="mt-3 space-y-1.5">
                  {(byChannel[ch] ?? []).map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      {t.title}
                      <span className="text-zinc-300 transition group-hover:text-indigo-400 dark:text-zinc-600">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Psychology primer → blog */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">The psychology behind it</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Hooks win on emotion, not features. These guides break down the triggers that lift CTR and open rates.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {blogPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="line-clamp-2 font-semibold">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Niche templates */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Niche playbooks</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Pre-filled starting points for the most common industries — click one to skip straight to strong hooks.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="font-semibold capitalize">{t.niche}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{t.intro}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
          <h2 className="font-bold text-lg">Try the full engine</h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            One analysis, twelve angles, CTR scores, ad copy, and a campaign plan in one shot.
          </p>
          <Link
            href="/"
            className="bg-gradient-brand mt-4 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          >
            Generate hooks free
          </Link>
        </section>
      </div>
    </main>
  );
}