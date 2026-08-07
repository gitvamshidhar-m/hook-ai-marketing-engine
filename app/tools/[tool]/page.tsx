import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tools, getTool } from "@/lib/seo/tools";
import { templates } from "@/lib/seo/templates";
import { postsForTool } from "@/lib/seo/blog";
import ToolGenerator from "@/components/ToolGenerator";
import { CHANNEL_LABELS } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  return Promise.resolve(params).then(({ tool }) => {
    const t = getTool(tool);
    if (!t) return {};
    return {
      title: `${t.title} · Hook AI`,
      description: t.metaDescription,
      alternates: { canonical: `https://hook-ai-marketing-engine.vercel.app/tools/${t.slug}` },
      openGraph: {
        title: `${t.title} · Hook AI`,
        description: t.metaDescription,
        type: "website",
        url: `https://hook-ai-marketing-engine.vercel.app/tools/${t.slug}`,
        siteName: "Hook AI",
      },
      twitter: { card: "summary_large_image", title: `${t.title} · Hook AI`, description: t.metaDescription },
    };
  });
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const t = getTool(tool);
  if (!t) notFound();
  const relatedTemplates = templates.filter((tm) => tm.toolSlug === t.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title,
    description: t.metaDescription,
    url: `https://hook-ai-marketing-engine.vercel.app/tools/${t.slug}`,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: t.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:underline">Free tools</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-700 dark:text-zinc-300">{t.title}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{t.h1}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{t.intro}</p>

        <div className="mt-8">
          <ToolGenerator channel={t.channel} channelLabel={CHANNEL_LABELS[t.channel]} />
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.benefits.map((b) => (
            <div key={b} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium">{b}</p>
            </div>
          ))}
        </section>

        <section className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold">Example output</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {t.examples.map((ex) => (
              <div key={ex.prompt} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">{ex.prompt}</p>
                <p className="mt-1 text-base font-bold">{ex.result}</p>
              </div>
            ))}
          </div>
        </section>

        {relatedTemplates.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Popular niches for this tool</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTemplates.map((tm) => (
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
        )}

        {(() => { const related = postsForTool(t.slug); return related.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Related guides</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
                >
                  <p className="font-semibold leading-snug">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null; })()}

        <section className="mt-8">
          <h2 className="text-lg font-bold">Frequently asked questions</h2>
          <div className="mt-4 space-y-4">
            {t.faq.map((f) => (
              <details key={f.q} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-zinc-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}