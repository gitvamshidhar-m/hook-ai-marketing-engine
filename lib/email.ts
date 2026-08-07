import nodemailer from "nodemailer";

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function gmailTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return cachedTransporter;
}

/**
 * Send a transactional email.
 * Preferred path: Gmail SMTP (free, no domain) when GMAIL_APP_PASSWORD is set.
 * Fallback path: Resend when RESEND_API_KEY is set.
 * If neither is configured this logs and no-ops so the app keeps working.
 * Returns true only if the provider accepted the send (callers record the
 * send afterwards so failed deliveries are never logged as sent).
 */
export async function sendEmail({ to, subject, text, html }: EmailInput): Promise<boolean> {
  if (process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_USER) {
    try {
      await gmailTransporter().sendMail({
        from: `Hook AI <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text,
      });
      return true;
    } catch (e) {
      console.error("[email] gmail send failed (non-fatal)", e);
      return false;
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const from = process.env.RESEND_FROM || "Hook AI <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, text, html: html || text }),
      });
      if (!res.ok) {
        console.error("[email] provider rejected send (non-fatal)", { to, subject, status: res.status });
        return false;
      }
      return true;
    } catch (e) {
      console.error("[email] send failed (non-fatal)", e);
      return false;
    }
  }

  console.log("[email] skipped (no sender configured)", { to, subject });
  return false;
}

export function welcomeEmailText(name: string): string {
  return `Hi ${name || "there"},

Welcome to Hook AI — the angle-discovery engine for digital marketers.

Your free credits are ready. Generate your first hooks now:

https://hook-ai-marketing-engine.vercel.app/

Tip: the most common mistake is a vague topic. Give the engine a concrete audience ("busy new parents") plus an outcome ("get 10 hours back a week") and the scores jump.

— The Hook AI team`;
}

export function referralBonusEmailText(added: number): string {
  return `A friend just joined Hook AI using your referral link — you earned ${added} bonus credits. They're added to your balance now.

Keep sharing your result cards to earn a credit for every signup.

https://hook-ai-marketing-engine.vercel.app/`;
}

export function nurtureEmailText(topic?: string): string {
  const topicLine = topic
    ? `Last time you were here you searched for "${topic.slice(0, 80)}".`
    : "You got a taste of it last time you were here.";
  return `${topicLine}

You haven't created an account yet, so your results are still waiting. Here's the thing: free members get 20 fresh runs every single day plus a bonus 5 when you verify your email — and every result card you share earns a credit on signups.

Try the angle engine again in under 30 seconds:

https://hook-ai-marketing-engine.vercel.app/

No credit card. Your daily allowance resets each morning.

— The Hook AI team`;
}

export function topupEmailText(): string {
  return `Your Hook AI balance just hit zero.

Good news: you clearly used it. The fastest way to get back to shipping hooks is one of these:

1. Share a result card — every friend who signs up through your link earns you a credit.
2. Top up with a Starter or Pro pack (they're a fraction of one hour of an agency's time).
3. Wait for tomorrow's free refresh — your daily allowance resets every morning.

Top up or track your credits here:

https://hook-ai-marketing-engine.vercel.app/account

— The Hook AI team`;
}

export function reengageEmailText(): string {
  return `We noticed you haven't been back in a few days — and your best results are still waiting for you.

Your saved campaigns, templates, and credits are all exactly where you left them:

https://hook-ai-marketing-engine.vercel.app/

Pro tip: if you're stuck, try "trying harder" variations on your last topic — they never count against your daily allowance.

— The Hook AI team`;
}

export function lowBalanceEmailText(credits: number): string {
  return `You're ${credits} run${credits === 1 ? "" : "s"} away from hitting zero credits.

No need to stop mid-campaign. Two free ways to keep going:

1. Share a result card — each friend who signs up through your link adds a credit.
2. Your daily free allowance resets every morning for quick hooks.

Or top up instantly (Starter/Pro packs) so nothing interrupts your flow:

https://hook-ai-marketing-engine.vercel.app/account

— The Hook AI team`;
}

export function digestEmailText(hooks: number, projects: number, featuredHook?: string): string {
  return `Here's your Hook AI week in review — ${
    hooks > 0 ? `you generated ${hooks} fresh hooks` : "a quiet week so far"
  }${projects > 0 ? ` and saved ${projects} campaign${projects === 1 ? "" : "s"}` : ""}.

${featuredHook ? `HOOK OF THE DAY\n\n  "${featuredHook}"\n\n` : ""}Your saved campaigns, templates, and credits are waiting right where you left them:

https://hook-ai-marketing-engine.vercel.app/

Pro tip: try the "trying harder" variations on a past topic — they don't count against your daily free runs.

— The Hook AI team`;
}
