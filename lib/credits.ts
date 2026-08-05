import { createServerSupabase } from "./supabase-server";
import { supabaseConfigured } from "./supabase";

export const FREE_CREDITS = 10;

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

export async function spendCredit(): Promise<CreditStatus> {
  if (!supabaseConfigured) return { ok: false, error: "no-supabase" };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no-user" };

  // Atomic decrement via RPC (see migrations/schema.sql).
  const { data, error } = await supabase.rpc("spend_credit", { user_id: user.id });
  if (error) {
    // Fallback: read + decrement manually.
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();
    const credits = typeof profile?.credits === "number" ? profile.credits : 0;
    if (credits <= 0) return { ok: false, error: "insufficient", credits: 0 };
    await supabase.from("profiles").update({ credits: credits - 1 }).eq("id", user.id);
    return { ok: true, credits, remaining: credits - 1 };
  }

  const remaining = typeof data === "number" ? data : -1;
  if (remaining < 0) return { ok: false, error: "insufficient", credits: 0 };
  return { ok: true, credits: remaining + 1, remaining };
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
