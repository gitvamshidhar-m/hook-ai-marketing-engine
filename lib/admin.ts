import { createServerSupabase } from "./supabase-server";
import { supabaseConfigured } from "./supabase";

export type AdminGuard =
  | { ok: true }
  | { ok: false; error: string; status: number };

export async function requireAdmin(): Promise<AdminGuard> {
  if (!supabaseConfigured) {
    return { ok: false, error: "Supabase is not configured.", status: 503 };
  }
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required.", status: 401 };

  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) return { ok: false, error: "Forbidden — admin only.", status: 403 };
  return { ok: true };
}