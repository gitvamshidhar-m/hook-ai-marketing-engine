import type { Metadata } from "next";
import Link from "next/link";
import { planAmount, planCredits, planLabel, type Plan } from "@/lib/razorpay";

export const metadata: Metadata = {
  title: "Pricing · Hook AI",
  description:
    "Free daily runs of the angle-discovery engine, plus Starter and Pro credit packs. No subscriptions — pay as you go.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/pricing" },
};

const inr = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

const tiers: {
  plan: Plan | "free";
  name: string;
  price: string;
  sub: string;
  cta: string;
  href: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    plan: "free",
    name: "Free",
    price: "₹0",
    sub: "forever",
    cta: "Start free",
    href: "/",
    features: [
      "20 scored runs every day",
      "All 10 generator tools",
      "Email capture bonus: +5 runs",
      "Share-to-earn credits",
      "No credit card",
    ],
  },
  {
    plan: "starter",
    name: "Starter",
    price: inr(planAmount("starter")),
    sub: `one-time · ${planLabel("starter")}`,
    cta: "Top up Starter",
    href: "/account",
    features: [
      "Everything in Free",
      `${planCredits("starter")} premium credits`,
      "Full angle analysis + USP",
      "Funnel & competitor gap map",
      "Priority generation",
    ],
    highlight: true,
  },
  {
    plan: "pro",
    name: "Pro",
    price: inr(planAmount("pro")),
    sub: `one-time · ${planLabel("pro")}`,
    cta: "Top up Pro",
    href: "/account",
    features: [
      "Everything in Starter",
      `${planCredits("pro")} premium credits`,
      "Campaign plan + ROAS projection",
      "Content calendar & A/B testing kit",
      "Best value per credit",
    ],
  },
];

const faq = [
  {
    q: "Is Hook AI really free to try?",
    a: "Yes. Anonymous visitors get 20 scored runs every day, and verifying your email adds a one-time +5 bonus for that day. You never need a card to test the tools.",
  },
  {
    q: "How do credits work?",
    a: "Premium analysis (full angle reports, campaign plans) spends 1 credit per run. Free daily runs cover quick hook generation. When your balance hits zero you can top up from your account page or wait for the next free refresh.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Starter and Pro are one-time credit packs — buy once, spend when you need. No recurring charges.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Payments are processed securely by Razorpay, which supports UPI, cards, and net banking for India-based customers.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Hook AI — Credits",
  description: "Pay-as-you-go credit packs for the Hook AI angle-discovery engine.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: (planAmount("starter") / 100).toFixed(0),
    highPrice: (planAmount("pro") / 100).toFixed(0),
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
};

export default function PricingPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-500">Pricing</p>
        <h1 className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Start free. Pay only when you&apos;re ready.
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-zinc-500">
          Every tool on Hook AI is free to try every day. Credit packs unlock premium analysis without locking you into a subscription.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`card-elevated flex flex-col rounded-2xl border p-6 ${
                t.highlight
                  ? "border-indigo-500 bg-gradient-soft shadow-lg shadow-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.name}</h2>
                {t.highlight && (
                  <span className="bg-gradient-brand rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-3 text-4xl font-black tracking-tight">{t.price}</p>
              <p className="mt-1 text-xs text-zinc-500">{t.sub}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-zinc-600 dark:text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.href}
                className={`mt-6 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition ${
                  t.highlight
                    ? "bg-gradient-brand text-white shadow-md shadow-indigo-500/25 hover:brightness-110"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <section className="mx-auto mt-14 max-w-2xl">
          <h2 className="text-lg font-bold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-zinc-200 bg-white p-4 open:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:open:bg-zinc-950"
              >
                <summary className="cursor-pointer text-sm font-semibold marker:content-none">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-zinc-400">
          Prices in INR. Payments handled securely by Razorpay. See our{" "}
          <Link href="/privacy" className="underline hover:text-zinc-600">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline hover:text-zinc-600">
            terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
