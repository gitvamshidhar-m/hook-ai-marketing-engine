import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import {
  sendEmail,
  nurtureEmailText,
  topupEmailText,
  reengageEmailText,
  lowBalanceEmailText,
  digestEmailText,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CAMPAIGN_NURTURE = "nurture";
const CAMPAIGN_TOPUP = "topup";
const CAMPAIGN_REENGAGE = "reengage";
const CAMPAIGN_LOWBALANCE = "lowbalance";
const CAMPAIGN_DIGEST = "digest";

const SUBJECTS: Record<string, string> = {
  [CAMPAIGN_NURTURE]: "Your hooks are still here",
  [CAMPAIGN_TOPUP]: "Out of credits? Here's your fastest way back",
  [CAMPAIGN_REENGAGE]: "Your best results are still waiting",
  [CAMPAIGN_LOWBALANCE]: "You're a few runs from hitting zero",
  [CAMPAIGN_DIGEST]: "Your Hook AI week in review",
};

export async function GET(req: NextRequest) {
  // Vercel cron sends an Authorization header with the secret when configured.
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  // Without a sender configured, don't mark anything as mailed — the send
  // is only logged AFTER it succeeds so a key added later isn't blocked
  // by 7-day dedupe for emails we never actually delivered.
  const senderConfigured =
    Boolean(process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_USER) ||
    Boolean(process.env.RESEND_API_KEY);
  if (!senderConfigured) {
    return NextResponse.json({
      ok: true,
      summary: {
        nurture: 0,
        topup: 0,
        reengage: 0,
        lowbalance: 0,
        digest: 0,
        skippedNoKey: true,
      },
    });
  }

  const supabase = await createServerSupabase();

  const summary = {
    nurture: 0,
    topup: 0,
    reengage: 0,
    lowbalance: 0,
    digest: 0,
    skippedNoKey: false,
  };

  async function mailCandidates<T>(
    campaign: string,
    rpc: string,
    makeText: (row: T) => string
  ): Promise<number> {
    const { data: rows, error } = await supabase.rpc(rpc, { limit_n: 200 });
    if (error || !Array.isArray(rows)) {
      console.error(`[cron] ${rpc} failed`, error?.message);
      return 0;
    }
    let sent = 0;
    for (const row of rows as T[]) {
      const email = (row as { email: string }).email;
      const delivered = await sendEmail({
        to: email,
        subject: SUBJECTS[campaign] || "Update from Hook AI",
        text: makeText(row),
      });
      // Only record a send the provider actually accepted, so failed
      // deliveries aren't suppressed by the 7-day dedupe.
      if (!delivered) continue;
      const { data: logged } = await supabase.rpc("log_email", {
        p_email: email,
        p_campaign: campaign,
      });
      if (logged === true) sent += 1;
    }
    return sent;
  }

  summary.nurture = await mailCandidates<{ email: string; topic: string }>(
    CAMPAIGN_NURTURE,
    "nurture_email_candidates",
    (row) => nurtureEmailText(row.topic)
  );

  summary.topup = await mailCandidates<{ email: string }>(
    CAMPAIGN_TOPUP,
    "topup_email_candidates",
    () => topupEmailText()
  );

  summary.reengage = await mailCandidates<{ email: string }>(
    CAMPAIGN_REENGAGE,
    "reengage_email_candidates",
    () => reengageEmailText()
  );

  summary.lowbalance = await mailCandidates<{ email: string; credits: number }>(
    CAMPAIGN_LOWBALANCE,
    "lowbalance_email_candidates",
    (row) => lowBalanceEmailText(row.credits)
  );

  summary.digest = await mailCandidates<{ email: string; hooks: number; projects: number }>(
    CAMPAIGN_DIGEST,
    "digest_email_candidates",
    (row) => digestEmailText(Number(row.hooks) || 0, Number(row.projects) || 0)
  );

  return NextResponse.json({ ok: true, summary });
}
