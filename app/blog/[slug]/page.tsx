import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogPost, toolForPost } from "@/lib/seo/blog";
import { getTool } from "@/lib/seo/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return Promise.resolve(params).then(({ slug }) => {
    const p = getBlogPost(slug);
    if (!p) return {};
    return {
      title: `${p.title} · Hook AI Blog`,
      description: p.metaDescription,
      alternates: { canonical: `https://hook-ai-marketing-engine.vercel.app/blog/${p.slug}` },
      openGraph: {
        title: p.title,
        description: p.metaDescription,
        type: "article",
        url: `https://hook-ai-marketing-engine.vercel.app/blog/${p.slug}`,
        siteName: "Hook AI",
        publishedTime: p.date,
      },
      twitter: { card: "summary_large_image", title: p.title, description: p.metaDescription },
    };
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.date,
        url: `https://hook-ai-marketing-engine.vercel.app/blog/${post.slug}`,
        author: { "@type": "Organization", name: "Hook AI" },
        publisher: { "@type": "Organization", name: "Hook AI" },
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:underline">Blog</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">{new Date(post.date).toLocaleDateString()}</span>
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800">
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{post.excerpt}</p>

        <article className="mt-6 space-y-4 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <div className="card-elevated mt-10 rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-lg font-bold">Put this into action</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Try the free generator referenced in this post — scored by predicted CTR.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {(() => {
              const t = getTool(toolForPost(post.slug));
              return t ? (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="bg-gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
                >
                  {t.h1}
                </Link>
              ) : null;
            })()}
            <Link
              href="/tools/job-snippet-generator"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Job Snippet Generator
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-bold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {post.faq.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-zinc-200 bg-white p-4 open:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:open:bg-zinc-950"
              >
                <summary className="cursor-pointer text-sm font-semibold marker:content-none">{f.question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}