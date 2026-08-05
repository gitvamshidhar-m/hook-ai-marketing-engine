import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFERRAL_BONUS = 5;

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  const { email, password, name, ref } = await req.json().catch(() => ({}));
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
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Seed a default credit grant for the new user.
  if (data.user) {
    const refCode = data.user.id.replace(/-/g, "").slice(0, 8);
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        name: name || "Marketer",
        credits: 10,
        ref_code: refCode,
      },
      { onConflict: "id" }
    );

    // Referral: if a valid code came in, reward both the referrer and the new user.
    const code = typeof ref === "string" ? ref.trim() : "";
    if (code && code !== refCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
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
      }
    }
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
