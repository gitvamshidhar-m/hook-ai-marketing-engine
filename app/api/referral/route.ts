import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("ref_code")
    .eq("id", user.id)
    .maybeSingle();

  const code = profile?.ref_code || user.id.replace(/-/g, "").slice(0, 8);

  const { data: referred } = await supabase
    .from("referrals")
    .select("credits_granted,created_at,referred_email")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const url = `${req.headers.get("origin") || ""}/?ref=${code}`;
  return NextResponse.json({
    code,
    url,
    referredCount: referred?.length ?? 0,
    creditsEarned: (referred || []).reduce((s, r) => s + r.credits_granted, 0),
    referred,
  });
}