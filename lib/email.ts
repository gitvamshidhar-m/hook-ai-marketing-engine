type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Send a transactional email. Requires RESEND_API_KEY — if missing, this logs
 * and no-ops so the whole app keeps working without email configured.
 */
export async function sendEmail({ to, subject, text, html }: EmailInput): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] skipped (no RESEND_API_KEY)", { to, subject });
    return;
  }
  const from = process.env.RESEND_FROM || "Hook AI <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text, html: html || text }),
    });
  } catch (e) {
    console.error("[email] send failed (non-fatal)", e);
  }
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