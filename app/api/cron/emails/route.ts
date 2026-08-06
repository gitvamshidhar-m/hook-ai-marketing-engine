import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { sendEmail, nurtureEmailText, topupEmailText } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CAMPAIGN_NURTURE = "nurture";
const CAMPAIGN_TOPUP = "topup";

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

  const supabase = await createServerSupabase();

  const summary = { nurture: 0, topup: 0, skippedNoKey: !process.env.RESEND_API_KEY };

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
      // Idempotent guard lives in the DB; skip rows we can't address.
      const { data: fresh } = await supabase.rpc("log_email", {
        p_email: (row as { email: string }).email,
        p_campaign: campaign,
      });
      if (fresh !== true) continue; // already mailed within 7d
      await sendEmail({
        to: (row as { email: string }).email,
        subject: campaign === CAMPAIGN_NURTURE ? "Your hooks are still here" : "Out of credits? Here's your fastest way back",
        text: makeText(row),
      });
      sent += 1;
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

  return NextResponse.json({ ok: true, summary });
}
