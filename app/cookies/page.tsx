import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Hook AI",
  description: "How Hook AI uses cookies and browser storage.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: August 2026</p>

        <div className="prose mt-8 space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. What we use</h2>
            <p>Hook AI uses minimal browser storage:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Local storage</strong> to track your daily free-run count, share bonuses, email-capture bonuses,
                attribution (UTM/referral), and UI preferences. This stays in your browser and is not sent to advertising
                networks.
              </li>
              <li>
                <strong>Authentication cookies</strong> to keep you signed in (set by our hosting and Supabase).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. Why we use it</h2>
            <p>
              This storage powers the free plan (daily run limits and bonuses), referral tracking, and our anonymous-first
              email capture. Without it, core features of the free product would not work.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Managing storage</h2>
            <p>
              You can clear local storage and cookies at any time through your browser settings. Clearing them will reset
              your daily free-run counters and bonuses, and you will be signed out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Third parties</h2>
            <p>
              Our hosting provider (Vercel) sets a small cookie for CDN/security purposes. Payment processing (Razorpay) may
              set cookies in its own checkout window, governed by Razorpay&apos;s privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Contact</h2>
            <p>
              Questions: <Link href="mailto:gitvamshidhar@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">gitvamshidhar@gmail.com</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}