import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/seo/blog";

export const metadata: Metadata = {
  title: "Blog · Hook AI",
  description:
    "Marketing psychology, recruiting copy, and SEO guides — practical posts on hooks, headlines, and structured data.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/blog" },
  openGraph: {
    title: "Blog · Hook AI",
    description: "Practical posts on marketing psychology, recruiting copy, and SEO.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/blog",
    siteName: "Hook AI",
  },
};

export default function BlogPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">The Hook AI blog</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Practical writing on marketing psychology, recruiting copy, and SEO — with free tools to put it into action.
        </p>
        <div className="mt-8 space-y-4">
          {blogPosts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="card-elevated block rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400">{new Date(p.date).toLocaleDateString()}</span>
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="mt-2 text-xl font-bold">{p.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}