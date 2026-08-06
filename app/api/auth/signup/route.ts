import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { trackEvent } from "@/lib/events";
import { sendEmail, welcomeEmailText, referralBonusEmailText } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFERRAL_BONUS = 5;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hook-ai-marketing-engine.vercel.app";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  const { email, password, name, ref, attr } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || "Marketer" },
      emailRedirectTo: SITE_URL,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Seed a default credit grant for the new user.
  if (data.user) {
    const refCode = data.user.id.replace(/-/g, "").slice(0, 8);
    const a = attr && typeof attr === "object" ? (attr as Record<string, unknown>) : {};
    const clean = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 80) : "");
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        name: name || "Marketer",
        credits: 10,
        ref_code: refCode,
        utm_source: clean(a.source) || null,
        utm_medium: clean(a.medium) || null,
        utm_campaign: clean(a.campaign) || null,
        referrer: clean(a.referrer) || null,
      },
      { onConflict: "id" }
    );

    await trackEvent(
      "signup",
      {
        source: clean(a.source),
        medium: clean(a.medium),
        campaign: clean(a.campaign),
        referrer: clean(a.referrer),
      },
      data.user.id
    );
    const userEmail = data.user.email || "";
    await sendEmail({
      to: userEmail,
      subject: "Welcome to Hook AI — your credits are ready",
      text: welcomeEmailText(name || "there"),
    });

    // Referral: if a valid code came in, reward both the referrer and the new user.
    const code = typeof ref === "string" ? ref.trim() : "";
    if (code && code !== refCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id,email")
        .eq("ref_code", code)
        .neq("id", data.user.id)
        .maybeSingle();
      if (referrer) {
        await supabase.rpc("add_credits", { target_user: referrer.id, amount: REFERRAL_BONUS });
        await supabase.rpc("add_credits", { target_user: data.user.id, amount: REFERRAL_BONUS });
        await supabase.from("referrals").insert({
          referrer_id: referrer.id,
          referred_id: data.user.id,
          referred_email: data.user.email,
          code,
          credits_granted: REFERRAL_BONUS,
          status: "paid",
        });
        await trackEvent("referral_bonus", { code, amount: REFERRAL_BONUS }, referrer.id);
        if (referrer.email) {
          await sendEmail({
            to: referrer.email,
            subject: "You earned referral credits on Hook AI",
            text: referralBonusEmailText(REFERRAL_BONUS),
          });
        }
      }
    }
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
