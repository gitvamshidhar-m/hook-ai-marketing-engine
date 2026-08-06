import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public read of funnel + A/B aggregates. Security-definer RPCs return
// counts only — raw user data never leaves the database.
export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const supabase = await createServerSupabase();

  const [{ data: overview }, { data: ab }] = await Promise.all([
    supabase.rpc("growth_overview"),
    supabase.rpc("ab_stats"),
  ]);

  return NextResponse.json({
    overview: overview || null,
    ab: ab || [],
    fetchedAt: new Date().toISOString(),
  });
}
