import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/seo/tools";
import { templates } from "@/lib/seo/templates";
import { blogPosts } from "@/lib/seo/blog";
import { CHANNEL_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Free Marketing Tools · Hook AI",
  description:
    "Free AI generators for ad headlines, email subjects, YouTube titles, and blog H1s — scored by predicted CTR. Plus niche templates and the Campaign Studio.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/tools" },
  openGraph: {
    title: "Free Marketing Tools · Hook AI",
    description: "Free AI headline, subject line, YouTube title, and blog title generators with CTR scoring.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/tools",
    siteName: "Hook AI",
  },
};

export default function ToolsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Free marketing tools</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Every generator scores output against predicted click-through rate, so the strongest angle surfaces first.
          Run as many as you like — no credit card, no signup required for quick tries.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                {CHANNEL_LABELS[t.channel]}
              </p>
              <h2 className="mt-2 text-xl font-bold">{t.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{t.metaDescription}</p>
            </Link>
          ))}
        </div>

        <div className="card-elevated mt-8 rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-xl font-bold">Also in the toolkit</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/tools/ad-preview" className="rounded-xl border border-zinc-100 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <p className="font-semibold">Ad & SERP Preview</p>
              <p className="mt-1 text-xs text-zinc-500">See how your hook renders in Google Ads and search results before you spend a rupee.</p>
            </Link>
            <Link href="/tools/job-snippet-generator" className="rounded-xl border border-zinc-100 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
              <p className="font-semibold">Job Snippet Generator</p>
              <p className="mt-1 text-xs text-zinc-500">Job postings that rank: meta description + JobPosting & FAQ structured data.</p>
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Niche hook templates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tm) => (
              <Link
                key={tm.slug}
                href={`/templates/${tm.slug}`}
                className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="font-semibold capitalize">{tm.niche}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{tm.intro}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Latest from the blog</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {blogPosts.slice(0, 2).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}