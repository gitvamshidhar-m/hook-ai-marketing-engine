import type { Metadata } from "next";
import Link from "next/link";
import { templates } from "@/lib/seo/templates";
import { blogPosts } from "@/lib/seo/blog";

export const metadata: Metadata = {
  title: "SEO Program · Hook AI",
  description:
    "The public SEO program behind Hook AI: 33 niche landing pages, structured data, and a growing content library — built, measured, and documented.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/seo" },
};

const STACK = [
  { name: "Niche landing pages", value: templates.length, note: "one per target niche, keyword-mapped" },
  { name: "SEO articles", value: blogPosts.length, note: "long-form, answer-focused" },
  { name: "Indexable URLs", value: templates.length + blogPosts.length + 8, note: "templates + blog + tools + static pages" },
  { name: "JSON-LD types", value: 6, note: "ItemList, FAQPage, BlogPosting, Product, JobPosting, BreadcrumbList" },
];

export default function SeoPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">SEO program</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">How this site earns organic traffic</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Hook AI&apos;s SEO is built like a growth program, not a bolt-on: programmatic niche pages, structured data
          that earns rich results, and internal linking that funnels readers into the free tool. All documented here —
          because SEO that isn&apos;t measured isn&apos;t SEO.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <div key={s.name} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-3xl font-black tracking-tight text-indigo-500">{s.value}</p>
              <p className="mt-1 text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-zinc-400">{s.note}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Programmatic niche pages ({templates.length})</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Each page targets a keyword cluster, ships example hooks, FAQ content, and FAQPage schema, and links to the
            matching free generator.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 divide-y divide-zinc-200 dark:divide-zinc-800 sm:grid-cols-2 sm:divide-x lg:grid-cols-3">
              {templates.map((t) => (
                <Link
                  key={t.slug}
                  href={`/templates/${t.slug}`}
                  className="group p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <p className="text-sm font-semibold group-hover:text-indigo-500">{t.niche}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{t.keywords.slice(0, 2).join(", ")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Content library ({blogPosts.length})</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {blogPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.excerpt}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">{p.tags.join(" · ")}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Technical SEO implemented</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "sitemap.xml + robots.txt (both generated)",
              "Canonical URLs on every template, blog, tool, and static page",
              "Structured data: FAQPage (every niche page + blog post), ItemList, BlogPosting, Product, JobPosting",
              "OG + Twitter image cards with a dynamic OG image route",
              "SSG pages (33 templates + 4 articles) for fast, indexable HTML",
              "Internal linking: niches → tools, tools → templates, blog → generators",
            ].map((f) => (
              <div key={f} className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-emerald-500">✓</span>
                <span className="text-zinc-600 dark:text-zinc-300">{f}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-zinc-400">
          See it in action:{" "}
          <Link href="/growth" className="underline hover:text-zinc-600">live growth dashboard</Link> ·{" "}
          <Link href="/templates" className="underline hover:text-zinc-600">all niches</Link>
        </p>
      </div>
    </main>
  );
}
