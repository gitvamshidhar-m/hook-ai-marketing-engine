import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { templates, getTemplate } from "@/lib/seo/templates";
import { getTool } from "@/lib/seo/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return Promise.resolve(params).then(({ slug }) => {
    const t = getTemplate(slug);
    if (!t) return {};
    return {
      title: `${t.title} · Hook AI`,
      description: t.metaDescription,
      alternates: { canonical: `https://hook-ai-marketing-engine.vercel.app/templates/${t.slug}` },
      openGraph: {
        title: `${t.title} · Hook AI`,
        description: t.metaDescription,
        type: "website",
        url: `https://hook-ai-marketing-engine.vercel.app/templates/${t.slug}`,
        siteName: "Hook AI",
      },
      twitter: { card: "summary_large_image", title: `${t.title} · Hook AI`, description: t.metaDescription },
    };
  });
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();
  const tool = getTool(t.toolSlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    description: t.intro,
    itemListElement: t.hooks.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h,
    })),
  };

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/templates" className="hover:underline">Templates</Link>
          <span className="mx-2">/</span>
          <span className="capitalize text-zinc-700 dark:text-zinc-300">{t.niche}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{t.intro}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {t.hooks.map((h) => (
            <div key={h} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-base font-bold">{h}</p>
            </div>
          ))}
        </div>

        {t.keywords.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Keywords to target</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.keywords.map((k) => (
                <span key={k} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {k}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="card-elevated mt-10 rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-lg font-bold">Write your own in seconds</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {tool ? `Use the ${tool.h1} to adapt these hooks to your brand.` : "Use one of our free generators to adapt these hooks to your brand."}
          </p>
          {tool ? (
            <Link
              href={`/tools/${tool.slug}`}
              className="bg-gradient-brand mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
            >
              {tool.h1}
            </Link>
          ) : null}
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">More niches</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {templates
              .filter((tm) => tm.slug !== t.slug)
              .map((tm) => (
                <Link
                  key={tm.slug}
                  href={`/templates/${tm.slug}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs capitalize transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {tm.niche}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}