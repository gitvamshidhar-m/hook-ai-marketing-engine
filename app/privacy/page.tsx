import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Hook AI",
  description: "How Hook AI collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: August 2026</p>

        <div className="prose mt-8 space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. What we collect</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Account data:</strong> when you sign up, we store your email, name, and a generated referral code.
              </li>
              <li>
                <strong>Content you generate:</strong> topics, competitor hooks, and generated results, used to improve the
                Service and show the public community feed.
              </li>
              <li>
                <strong>Attribution data:</strong> when you arrive via a UTM link, referral link, or referring site, we record
                that channel so we can measure our marketing.
              </li>
              <li>
                <strong>Emails you voluntarily submit</strong> through our capture forms, stored separately from accounts.
              </li>
              <li>
                <strong>Usage events:</strong> anonymous structured events (e.g. &quot;tool used&quot;) to understand product usage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. Payments</h2>
            <p>
              Payments are processed by Razorpay. We do not store your card details. We store a record of your purchase
              (amount, credits, status) to credit your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. How we use data</h2>
            <p>
              We use your data to operate the Service, grant credits, process referrals and payments, send transactional
              emails, and measure performance. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Cookies &amp; local storage</h2>
            <p>
              We use browser local storage to remember daily free-run counts, share bonuses, email-capture bonuses, and
              attribution details. See our <Link href="/cookies" className="text-indigo-600 hover:underline dark:text-indigo-400">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Data sharing</h2>
            <p>
              We share data only with service providers who help run the Service (hosting, payments, email delivery, and AI
              generation providers). Your generated content may appear on the public community feed with your topic.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data. You can also unsubscribe from any
              email. To exercise these rights, email{" "}
              <Link href="mailto:gitvamshidhar@gmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">gitvamshidhar@gmail.com</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">7. Retention</h2>
            <p>
              We retain data as long as needed to operate the Service or as required by law. You may delete your account by
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">8. Changes</h2>
            <p>We may update this policy and will post any changes on this page.</p>
          </section>
        </div>
      </div>
    </main>
  );
}