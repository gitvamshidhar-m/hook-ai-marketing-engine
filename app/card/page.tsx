import type { Metadata } from "next";
import Link from "next/link";
import ScorecardShare from "@/components/ScorecardShare";

type Props = { searchParams: Promise<{ q?: string; s?: string; p?: string; t?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q || "A hook that stops the scroll").slice(0, 160);
  const s = Math.max(0, Math.min(100, Number(sp.s) || 0));
  const p = (sp.p || "Curiosity").slice(0, 60);
  const t = (sp.t || "").slice(0, 80);
  const og = `/og/card?q=${encodeURIComponent(q)}&s=${s}&p=${encodeURIComponent(p)}&t=${encodeURIComponent(t)}`;
  return {
    title: `${q.slice(0, 60)} — Hook AI Scorecard`,
    description: `A ${p} hook scored ${s}/100 by Hook AI. See the psychology behind it.`,
    openGraph: {
      title: `${q.slice(0, 60)} (${s}/100)`,
      description: `Psychology angle: ${p}. Generated free at Hook AI.`,
      type: "article",
      url: `/card?q=${encodeURIComponent(q)}&s=${s}&p=${encodeURIComponent(p)}&t=${encodeURIComponent(t)}`,
      images: [{ url: og, width: 1200, height: 630, alt: q }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${q.slice(0, 60)} (${s}/100)`,
      description: `Psychology angle: ${p}. Generated free at Hook AI.`,
      images: [og],
    },
  };
}

export default async function CardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q || "A hook that stops the scroll").slice(0, 160);
  const s = Math.max(0, Math.min(100, Number(sp.s) || 0));
  const p = (sp.p || "Curiosity").slice(0, 60);
  const t = (sp.t || "").slice(0, 80);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="bg-gradient-brand relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/25 sm:p-10">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-20" aria-hidden />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Hook AI scorecard</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-white/15 px-5 py-3">
                <span className="text-4xl font-extrabold">{s}</span>
                <span className="text-sm opacity-80">/100</span>
              </div>
              <div>
                <p className="text-lg font-bold">{s >= 80 ? "Elite hook" : s >= 60 ? "Strong hook" : "Needs work"}</p>
                <p className="text-sm text-white/80">Predicted CTR lift vs. a bland headline</p>
              </div>
            </div>
            <blockquote className="mt-6 text-2xl font-bold leading-snug sm:text-3xl">“{q}”</blockquote>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{p}</span>
              {t && <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{t}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ScorecardShare q={q} s={s} p={p} t={t} />
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Score a hook like this for free at{" "}
          <Link href="/" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Hook AI
          </Link>
        </p>
      </div>
    </main>
  );
}