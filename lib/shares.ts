import { createServerSupabase } from "./supabase-server";
import { supabaseConfigured } from "./supabase";
import type { AnalyzeResult } from "./types";

export function createSlug(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function saveShare(
  payload: AnalyzeResult,
  opts: { title?: string } = {}
): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = createSlug();
  const { data, error } = await supabase
    .from("shares")
    .insert({
      slug,
      user_id: user?.id ?? null,
      title: (opts.title || payload.topic || "Campaign").slice(0, 120),
      payload,
    })
    .select("slug")
    .single();
  if (error || !data) {
    console.error("[shares] insert failed:", error);
    return null;
  }
  return data.slug as string;
}

export async function getShare(slug: string): Promise<AnalyzeResult | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("shares")
    .select("title,payload")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const payload = data.payload as AnalyzeResult;
  return payload && Array.isArray(payload.hooks) ? payload : null;
}
