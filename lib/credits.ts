import { createServerSupabase } from "./supabase-server";
import { supabaseConfigured } from "./supabase";

export const FREE_CREDITS = 10;
export const CAMPAIGN_COST = 1;
export const PREMIUM_CAMPAIGN_COST = 3;

export type CreditStatus =
  | { ok: false; error: "no-user" }
  | { ok: false; error: "no-supabase" }
  | { ok: false; error: "insufficient"; credits: number }
  | { ok: true; credits: number; remaining: number };

export async function getCreditStatus(): Promise<CreditStatus> {
  if (!supabaseConfigured) return { ok: false, error: "no-supabase" };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no-user" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  const credits = typeof profile?.credits === "number" ? profile.credits : 0;
  if (credits <= 0) return { ok: false, error: "insufficient", credits: 0 };
  return { ok: true, credits, remaining: credits };
}

export async function spendCredit(amount = 1): Promise<CreditStatus> {
  if (!supabaseConfigured) return { ok: false, error: "no-supabase" };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no-user" };

  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 1;

  // Atomic decrement via RPC (see supabase/schema_v3.sql).
  const { data, error } = await supabase.rpc("spend_credits", { uid: user.id, amount: safeAmount });
  if (error) {
    // Fallback: read + decrement manually.
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();
    const credits = typeof profile?.credits === "number" ? profile.credits : 0;
    if (credits < safeAmount) return { ok: false, error: "insufficient", credits };
    await supabase.from("profiles").update({ credits: credits - safeAmount }).eq("id", user.id);
    return { ok: true, credits, remaining: credits - safeAmount };
  }

  const remaining = typeof data === "number" ? data : -1;
  if (remaining < 0) return { ok: false, error: "insufficient", credits: 0 };
  return { ok: true, credits: remaining + safeAmount, remaining };
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();
  const current = typeof profile?.credits === "number" ? profile.credits : 0;
  await supabase
    .from("profiles")
    .upsert({ id: userId, credits: current + amount }, { onConflict: "id" });
}
