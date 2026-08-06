import type { Metadata } from "next";
import Link from "next/link";
import { templates } from "@/lib/seo/templates";
import { getTool } from "@/lib/seo/tools";

export const metadata: Metadata = {
  title: "Niche Marketing Hook Templates · Hook AI",
  description:
    "Ready-to-use marketing hooks for recruitment, real estate, SaaS, fitness, education, and finance — plus free generators to write your own.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/templates" },
  openGraph: {
    title: "Niche Marketing Hook Templates · Hook AI",
    description: "Proven hooks for 6 industries, with a free generator to adapt them.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/templates",
    siteName: "Hook AI",
  },
};

export default function TemplatesPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Niche marketing hooks</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Proven, ready-to-adapt hooks broken down by industry. Open a niche for specific examples, then use the free
          generator to write your own.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tm) => {
            const tool = getTool(tm.toolSlug);
            return (
              <Link
                key={tm.slug}
                href={`/templates/${tm.slug}`}
                className="card-elevated flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">{tm.niche}</p>
                <h2 className="mt-1 text-lg font-bold capitalize">{tm.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{tm.intro}</p>
                <p className="mt-auto pt-3 text-xs text-zinc-400">
                  {tm.hooks.length} hooks · {tool ? tool.h1 : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}